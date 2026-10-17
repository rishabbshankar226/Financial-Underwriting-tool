from collections.abc import Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.responses import Response

from .assessment import assess_commercial
from .assessment_contracts import CommercialAssessment, CommercialAssessmentRequest
from .authentication import OperatorAuthenticationMiddleware
from .case_routes import install_case_openapi, owns_case_json
from .case_routes import router as case_router
from .cases import CaseStoreError
from .comparison_routes import install_comparison_openapi, owns_comparison_json
from .comparison_routes import router as comparison_router
from .decision import decide_commercial, decide_consumer
from .ingestion import parse_structured
from .json_transport import ContractValidationError, install_contract_openapi, read_contract
from .json_values import JsonObject, canonical_json
from .request_limits import RequestBodyLimitMiddleware
from .sba import evaluate_sba, load_size_table
from .scenario_routes import install_scenario_openapi, owns_scenario_json
from .scenario_routes import router as scenario_router
from .schemas import DISCLAIMER, CommercialRequest, ConsumerRequest, Decision, SBACase, SBAScreenResult

app = FastAPI(title="Spreadline", version="0.1.0", description=DISCLAIMER)


@app.middleware("http")
async def validate_raw_json(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    if (
        request.url.path.rstrip("/")
        in ("/commercial/assessment", "/commercial/decision", "/consumer/decision", "/sba/evaluate")
        or owns_case_json(request.url.path)
        or owns_scenario_json(request.url.path)
        or owns_comparison_json(request.url.path)
    ):
        # This route owns a bounded stream read, before any JSON buffering.
        return await call_next(request)
    # Validate before framework JSON decoding can discard duplicate object keys.
    media_type = request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if request.method == "POST" and (
        not media_type
        or media_type == "application/json"
        or media_type.startswith("application/")
        and media_type.endswith("+json")
    ):
        try:
            parse_structured((await request.body()).decode("utf-8"), "json")
        except (ValueError, UnicodeDecodeError) as exc:
            return JSONResponse(status_code=422, content={"detail": str(exc)})
    return await call_next(request)


app.add_middleware(RequestBodyLimitMiddleware)
app.add_middleware(OperatorAuthenticationMiddleware)

# CORS wraps body limits and validation so rejected requests remain readable.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["ETag", "Idempotency-Replayed", "Retry-After", "Location"],
)

app.include_router(case_router)
app.include_router(scenario_router)
app.include_router(comparison_router)
install_case_openapi(app)
install_scenario_openapi(app)
install_comparison_openapi(app)
install_contract_openapi(app, (CommercialAssessmentRequest, CommercialRequest, ConsumerRequest, SBACase))


@app.exception_handler(CaseStoreError)
async def case_store_error(request: Request, exc: CaseStoreError) -> JSONResponse:
    headers = {"Retry-After": "1"} if exc.code == "storage_busy" else None
    content: JsonObject = {"detail": {"code": exc.code, "message": str(exc)}}
    if exc.errors is not None:
        content["errors"] = exc.errors.model_dump(mode="json")
    return JSONResponse(status_code=exc.status, content=content, headers=headers)


@app.exception_handler(ContractValidationError)
async def contract_validation_error(request: Request, exc: ContractValidationError) -> JSONResponse:
    # `detail` is serialized first and unchanged; `errors` is the additive field-errors-v1 envelope.
    content = {"detail": exc.detail, "errors": exc.field_errors.model_dump(mode="json")}
    return JSONResponse(status_code=exc.status_code, content=content, headers=exc.headers)


@app.get("/health")
def health() -> JsonObject:
    return {"status": "ok"}


@app.post("/commercial/assessment/", response_model=CommercialAssessment, include_in_schema=False)
@app.post(
    "/commercial/assessment",
    response_model=CommercialAssessment,
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {"schema": {"$ref": "#/components/schemas/CommercialAssessmentRequest"}}
            },
        }
    },
)
async def commercial_assessment(request: Request) -> CommercialAssessment:
    validated = await read_contract(request, CommercialAssessmentRequest)
    try:
        return assess_commercial(validated)
    except (ValueError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post(
    "/commercial/decision",
    response_model=Decision,
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/CommercialRequest"}}},
        }
    },
)
async def commercial_decision(request: Request) -> Decision:
    req = await read_contract(request, CommercialRequest, "Commercial")
    try:
        return decide_commercial(req)
    except (ValueError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post(
    "/consumer/decision",
    response_model=Decision,
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ConsumerRequest"}}},
        }
    },
)
async def consumer_decision(request: Request) -> Decision:
    req = await read_contract(request, ConsumerRequest, "Consumer")
    try:
        return decide_consumer(req)
    except (ValueError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post(
    "/sba/evaluate",
    response_model=SBAScreenResult,
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/SBACase"}}},
        }
    },
)
async def sba_evaluate(request: Request) -> SBAScreenResult:
    req = await read_contract(request, SBACase, "SBA")
    try:
        return SBAScreenResult.model_validate_json(canonical_json(evaluate_sba(req, load_size_table())))
    except (ValueError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
