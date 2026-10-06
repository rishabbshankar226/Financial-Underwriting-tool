from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from .assessment import assess_commercial
from .assessment_contracts import CommercialAssessment, CommercialAssessmentRequest, MAX_REQUEST_BYTES
from .schemas import CommercialRequest, ConsumerRequest, Decision, DISCLAIMER, SBACase
from .decision import decide_commercial, decide_consumer
from .sba import load_size_table, evaluate_sba
from .ingestion import parse_structured

app = FastAPI(title="Spreadline", version="0.1.0", description=DISCLAIMER)


@app.middleware("http")
async def validate_raw_json(request: Request, call_next):
    if request.url.path.rstrip("/") == "/commercial/assessment":
        # This route owns a bounded stream read, before any JSON buffering.
        return await call_next(request)
    # Validate before framework JSON decoding can discard duplicate object keys.
    media_type = request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if request.method == "POST" and (not media_type or media_type == "application/json"
                                    or media_type.startswith("application/") and media_type.endswith("+json")):
        try:
            parse_structured((await request.body()).decode("utf-8"), "json")
        except (ValueError, UnicodeDecodeError) as exc:
            return JSONResponse(status_code=422, content={"detail": str(exc)})
    return await call_next(request)


# CORS must wrap validation so a rejected JSON request remains readable by the UI.
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],allow_credentials=False,allow_methods=["*"],allow_headers=["*"])

@app.get("/health")
def health() -> dict:
    return {"status":"ok","prototype":True,"disclaimer":DISCLAIMER}


@app.post("/commercial/assessment/", response_model=CommercialAssessment, include_in_schema=False)
@app.post("/commercial/assessment", response_model=CommercialAssessment, openapi_extra={
    "requestBody": {"required": True, "content": {"application/json": {
        "schema": {"$ref": "#/components/schemas/CommercialAssessmentRequest"}
    }}}
})
async def commercial_assessment(request: Request) -> CommercialAssessment:
    chunks, size = [], 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > MAX_REQUEST_BYTES:
            raise HTTPException(status_code=413, detail="Assessment request exceeds 1,000,000 bytes")
        chunks.append(chunk)
    body = b"".join(chunks)
    try:
        parse_structured(body.decode("utf-8"), "json")
        validated = CommercialAssessmentRequest.model_validate_json(body)
        return assess_commercial(validated)
    except ValidationError as exc:
        errors = exc.errors(include_url=False, include_input=False, include_context=False)
        for error in errors:
            error["loc"] = ["body", *error["loc"]]
        raise HTTPException(status_code=422, detail=errors) from exc
    except (ValueError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.post("/commercial/decision",response_model=Decision)
def commercial_decision(req: CommercialRequest) -> Decision:
    try: return decide_commercial(req)
    except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.post("/consumer/decision",response_model=Decision)
def consumer_decision(req: ConsumerRequest) -> Decision:
    try: return decide_consumer(req)
    except ValueError as exc: raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.post("/sba/evaluate")
def sba_evaluate(req: SBACase) -> dict:
    try: return evaluate_sba(req,load_size_table())
    except ValueError as exc: raise HTTPException(status_code=422,detail=str(exc)) from exc
