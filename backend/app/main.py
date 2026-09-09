from fastapi import FastAPI

DISCLAIMER = "Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice."

app = FastAPI(title="Spreadline", version="0.1.0", description=DISCLAIMER)

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "prototype": True, "disclaimer": DISCLAIMER}
