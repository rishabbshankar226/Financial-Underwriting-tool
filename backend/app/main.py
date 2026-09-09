from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import CommercialRequest, ConsumerRequest, Decision, DISCLAIMER, SBACase
from .decision import decide_commercial, decide_consumer
from .sba import load_size_table, evaluate_sba

app = FastAPI(title="Spreadline", version="0.1.0", description=DISCLAIMER)
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:5173"],allow_credentials=False,allow_methods=["*"],allow_headers=["*"])

@app.get("/health")
def health() -> dict:
    return {"status":"ok","prototype":True,"disclaimer":DISCLAIMER}

@app.post("/commercial/decision",response_model=Decision)
def commercial_decision(req: CommercialRequest) -> Decision:
    return decide_commercial(req)

@app.post("/consumer/decision",response_model=Decision)
def consumer_decision(req: ConsumerRequest) -> Decision:
    return decide_consumer(req)

@app.post("/sba/evaluate")
def sba_evaluate(req: SBACase) -> dict:
    try: return evaluate_sba(req,load_size_table())
    except ValueError as exc: raise HTTPException(status_code=422,detail=str(exc)) from exc
