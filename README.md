# Spreadline

Spreadline is a credit underwriting prototype for commercial, SBA and consumer loans, built on synthetic data only. It spreads tax-return figures, computes coverage ratios, checks them against configurable policy, records the factors behind each decision and writes a short credit memo explaining it.

> Prototype only. It has not been validated for real lending decisions. Don't enter real PII or financial information. Nothing here is legal or compliance advice.

## What it does

- Commercial spreads: ordinary business income, EBITDA, amortized debt service on the proposed loan, UCA-style cash flow, DSCR, FCCR, global DSCR and K-1 distribution history.
- Consumer front-end and back-end DTI, with an ability-to-repay documentation check.
- SBA checks: the explicitly selected SOP version, a dated NAICS size-standard table, a credit-elsewhere and personal-resources screen, and a configurable global DSCR floor.
- Decisions and reason codes built from the same stored factors.
- JSON and CSV intake, plus field extraction from synthetic text documents. A person has to confirm each extracted field before it reaches the calculations.
- A React workspace for picking a fixture, reviewing the spread, overriding a value (a rationale is required), and reading the memo and audit trail.
- A synthetic check that changing only the applicant's geography doesn't change the outcome.

## Stack

- Backend: Python 3.11+ / FastAPI
- Frontend: TypeScript / React / Vite
- Arithmetic: pure functions with no randomness
- Data: synthetic fixtures only

## Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

## Run the tests

```bash
python gate/reference_calculator.py --selftest
cd backend
pytest -q
```

Or from the repository root:

```bash
./scripts/run_all_checks.sh
```

`gate/reference_calculator.py` is a second implementation of the core formulas, with pinned results for three synthetic borrowers. The application never imports it, and the backend tests compare their results against its numbers.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI calls the backend at `http://localhost:8000` by default; set `VITE_API_URL` before starting/building Vite to override it. Start the backend before using the workspace. Decisions, coverage, and memos are recalculated after every accepted edit; failed requests clear the previous results.

Import a complete synthetic commercial request as JSON (see `backend/fixtures/alpine.json`, maximum 1 MB). Supply `years` in chronological order, oldest first. The browser imports JSON only; CSV and text extraction remain backend library functions, not browser upload formats. Override history is held in browser memory and is lost on reload.

Browser regression tests (with backend dependencies installed):

```bash
cd frontend
npm ci
npx playwright install chromium
npm run test:e2e
```

Playwright starts both development servers automatically. Ensure the Python environment with the backend requirements is active.

## Design notes

- Policy values live in `backend/app/config.py`, so no threshold is buried inside a formula.
- `backend/data/sba_size_standards.json` records where the SBA size standards come from but holds no NAICS rows yet, because the current SBA workbook isn't bundled. A missing row fails closed instead of falling back to a guessed threshold.
- Every decision and memo carries a prototype disclaimer.
- Requests reject non-finite values, invalid debt/loan inputs, empty financial histories, and combined ownership above 100%. Overflow returns HTTP 422. Zero debt-service coverage is marked not applicable and cannot satisfy an approval factor.
- The prototype consumer documentation checklist requires `income`, `assets`, and `debts`; it is configurable and is not a complete legal ATR checklist. The DTI review boundary is recorded as its own decision factor.
- SBA transaction types are `expansion`, `acquisition`, `buyout`, or `esop`. The caller must select the applicable SOP version; effective-date selection is not automated.
- Reason codes come from the factors the decision engine actually evaluated.
- Extracted fields that nobody has confirmed never reach the calculations.

## Limitations

- FCCR uses a simplified EBITDA / (debt service + operating lease) definition, with no capex or cash-tax adjustment.
- The UCA figure is a simplified working-capital version rather than a full UCA statement.
- The fairness check runs on synthetic data and can't establish disparate impact.
- Extraction is a deterministic parser for the synthetic text fixtures. There is no OCR.
- There are no live bureau, bank, tax or market-data connections.
- The security notes map where each control would sit in production. Apart from an in-memory audit log, the prototype doesn't implement them, and nothing is certified.
- The decision score is illustrative and uncalibrated. It is not a probability of default.
- Fixture C sits at exactly 43% back-end DTI. The prototype treats 43% as a review boundary and 50% as an illustrative decline boundary, so fixture C goes to review. The current General QM rule has no fixed DTI cap, so these are policy settings.

See `docs/MODEL_DOCUMENTATION.md`, `docs/SECURITY_ARCHITECTURE.md` and `docs/POLICY_SOURCES.md` for sources and scope.
