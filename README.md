# Spreadline

Spreadline is a **synthetic-data-only credit underwriting prototype** for commercial, SBA, and consumer workflows. It standardizes financial inputs, computes coverage ratios, applies configurable policy, stores the factors actually used in decisions, and generates explainable memo output.

> Prototype demonstration only. It has not been validated for use in an actual lending decision. Do not enter real PII or financial information. Nothing in this repository is legal or compliance advice.

## Stack

- Backend: Python 3.11+ / FastAPI
- Frontend: TypeScript / React / Vite
- Arithmetic: deterministic pure functions; no hidden randomness
- Data: synthetic fixtures only

## Run backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

## Run tests / gate

```bash
python gate/reference_calculator.py --selftest
cd backend
pytest -q
```

Or from the repository root:

```bash
./scripts/run_all_checks.sh
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

The UI expects the backend at `http://localhost:8000` by default.

## Controls

- The independent gate under `gate/` is not imported by the application.
- Policy values live in `backend/app/config.py`; formulas do not hide policy thresholds.
- SBA size standards are loaded from a dated artifact. The repository intentionally ships source metadata rather than guessed NAICS thresholds because the official current workbook could not be retrieved in the build environment; missing rows fail closed.
- Every decision and memo carries a prototype disclaimer.
- Reason codes are generated from the same stored factors the decision engine evaluated.
- Unconfirmed extracted fields do not cross the arithmetic boundary.

See `docs/MODEL_DOCUMENTATION.md`, `docs/SECURITY_ARCHITECTURE.md`, and `docs/FINAL_REPORT.md` for validation scope and limitations.
