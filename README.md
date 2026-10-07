# Spreadline

Spreadline turns synthetic borrower financials into a spread, coverage ratios, a policy assessment, and a credit memo. It covers commercial, SBA, and consumer loan examples. Each decision can be traced back to the inputs, calculations, and policy comparisons that produced it.

> Prototype only. It has not been validated for real lending decisions. Don't enter real PII or financial information. Nothing here is legal or compliance advice.

## Start here

Run the [backend](#run-the-backend) and [frontend](#run-the-frontend), then open the dated Alpine example in the browser. Select a financial period, inspect a coverage calculation, and edit an input with a rationale to see the assessment update.

With local case storage enabled, save the dated example and open **Scenarios**.
Enter explicit shocks and rationales, preview the server's results, and save the
reviewed batch as a separate comparison. Reopening it reads the original record
without changing the case's assessment or revision. See [workspace behavior](docs/WORKSPACE.md#scenario-review-and-original-comparisons).

| To inspect | Read |
|---|---|
| Calculation definitions and model limits | [Model documentation](docs/MODEL_DOCUMENTATION.md) |
| Dated inputs, calculation traces, and response fields | [Assessment contract](docs/ASSESSMENT_CONTRACT.md) |
| Edits, imports, and session history | [Workspace behavior](docs/WORKSPACE.md) |
| Local revisions, replay, and backups | [Case storage](docs/CASE_STORAGE.md) |
| Hypothetical stress calculations against a saved revision | [Stress previews](docs/STRESS_PREVIEWS.md) |
| Immutable reviewed comparisons and copy-only database upgrades | [Saved comparisons](docs/SCENARIO_COMPARISONS.md) |
| Test workflow and dependency pins | [Verification](docs/VERIFICATION.md) |

## What it does

- Commercial spreads: ordinary business income, EBITDA, amortized debt service on the proposed loan, UCA-style cash flow, DSCR, FCCR, global DSCR and K-1 distribution history.
- Consumer front-end and back-end DTI, with an ability-to-repay documentation check.
- SBA checks: the explicitly selected SOP version, a dated NAICS size-standard table, a credit-elsewhere and personal-resources screen, and a configurable global DSCR floor.
- Decisions and reason codes built from the same stored factors.
- JSON and CSV intake, plus field extraction from synthetic text documents. A person has to confirm each extracted field before it reaches the calculations.
- A React workspace with a complete annual spread, current assumptions, server calculation traces and policy comparisons, rationale-based edits, a memo, and session edit history. Dated cases can also be saved, reopened, and reviewed by original revision with durable server-recorded history.
- Optional local storage for dated commercial cases, immutable accepted revisions/results, server-derived events, concurrent-edit preconditions, original retry receipts, replay, and verified backup/restore.
- A commercial scenario browser and read-only preview API for revenue, cost, operating-expense and proposed-rate changes against an explicit saved revision. It displays server-provided coverage, policy headroom, trace links and decision differences while retaining observed history.
- Immutable saved comparison batches, original reads, bounded summaries and exact retries through one shared browser write journal. A separate verified schema-v1-to-v2 copy-upgrade command preserves its source; the browser never runs it automatically.
- A synthetic check that changing only the applicant's geography doesn't change the outcome.

## Stack

- Backend: Python 3.12 verification baseline / FastAPI
- Frontend: TypeScript / React / Vite
- Arithmetic: pure functions with no randomness
- Data: synthetic fixtures only

## Run the backend

Use Python 3.12 for the pinned dependency baseline used by CI.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt -c constraints-py312.txt
python -m uvicorn app.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

To enable saved dated cases, from `backend` create `.spreadline-data`, set
`SPREADLINE_CASE_DB` to an absolute SQLite file path in that directory, and start
the backend. Use **Save case** on an accepted dated assessment, or **Saved cases**
to open an original stored result. See [the case storage contract](docs/CASE_STORAGE.md) for
routes, retry/ETag semantics, and local verify/backup/restore commands. Storage is
optional; the stateless assessment routes work without it.

## Dated commercial assessment API

`POST /commercial/assessment` accepts explicit annual periods, USD/dollar units,
and fixed monthly loan assumptions. It returns the historical spread, current
pro forma coverage, actual calculation operands, decision comparisons, the
policy snapshot, and a deterministic assessment fingerprint.

With the backend running, try the separate synthetic dated example:

```bash
curl --fail-with-body http://localhost:8000/commercial/assessment \
  -H 'Content-Type: application/json' \
  --data-binary @backend/fixtures/alpine_dated.json
```

See [the assessment contract](docs/ASSESSMENT_CONTRACT.md) and the live OpenAPI
documentation at `http://localhost:8000/docs`. The browser opens the dated Alpine
example through this API. The explicit legacy demo and undated imports continue
to use `/commercial/decision`; dates are never inferred.

## Verify the project

From the repository root, create and activate a clean Python 3.12 environment, then install the pinned Python and frontend dependencies and Playwright's Chromium browser. Node 22 is the CI baseline.

```bash
python3.12 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt -c backend/constraints-py312.txt
npm --prefix frontend ci
(cd frontend && npx playwright install --with-deps chromium)
./scripts/run_all_checks.sh
```

The script checks dependencies, the independent reference calculator, backend tests, the frontend dependency audit and build, and browser tests. It stops at the first failure. Stop any existing servers on ports 8000 and 5173 before running it.

For an existing isolated Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its absolute executable path and omit the browser download step. Keep any libraries required by that installation available. CI always installs Playwright's bundled Chromium.

The [verification notes](docs/VERIFICATION.md) explain the reference checks, dependency pins, and baseline update process.

## Run the frontend

```bash
cd frontend
npm ci
npm run dev
```

The UI calls the backend at `http://localhost:8000` by default; set `VITE_API_URL` before starting/building Vite to override it. Start the backend before using the workspace. New assessments and accepted edits use backend calculations; opening a saved revision reads its original result. Failed requests leave no active recommendation.

Import a synthetic dated request (`backend/fixtures/alpine_dated.json`) or legacy request (`backend/fixtures/alpine.json`), at most 1,000,000 bytes. Raw import bytes are preserved for backend JSON checks. An unknown declared schema version is rejected. The browser imports JSON only; CSV and text extraction remain backend library functions.

The spread shows all supplied financial lines and periods. Select a historical column to inspect its facts; coverage always uses the latest period and current pro forma assumptions. Derived financial rows are read-only. Select an input amount to open a labeled dialog with its unit/period and required rationale. Assumption edits include existing debt, proposed loan, supplied guarantors, and working capital. Rate/ownership fields show percentages and convert to decimal API units once. Dates and case structure are changed through complete JSON import.

A valid edit clears the active result while evaluating a submitted draft. Success installs the accepted input/result together and records one session edit. Failure keeps that draft for retry and records no applied edit. Malformed/oversized imports also clear active recommendations. Older file reads and responses cannot overwrite a newer selection. Session edit history resets on reload or successful case replacement; imported legacy history is separately labeled unverified. Neither is an authenticated persistent audit service.

Saved dated cases use a separate server-recorded history. **Save case** assesses the accepted input under the server's current policy and starts revision 1; earlier session edits are not migrated into its events. Only a supported latest revision can be edited. Historical revisions remain read-only, and **Check replay** compares the retained definition/policy without replacing the original result.

Before a saved write, the tab must keep its exact command, operation key, backend identity, and edit ETag in browser session storage. A lost or invalid receipt retains that record. Reload never sends it automatically; **Retry exact write** resends the same operation. A stale edit requires explicit review of the latest field and a fresh submission. A recovered old receipt stays historical if another writer has advanced the case. Closing the tab or discarding tracking can lose the retry record without undoing a committed write.

See [workspace behavior](docs/WORKSPACE.md) for state and interface boundaries.

Browser regression tests (with backend dependencies installed):

```bash
cd frontend
npm ci
npx playwright install chromium
npm run test:e2e
```

Playwright starts both development servers automatically. Ensure the Python environment with the backend requirements is active. Each run owns a fresh temporary case database and backend process; it refuses an existing backend on port 8000 and does not adopt a configured user database.

## Design notes

- Policy values live in `backend/app/config.py`, so no threshold is buried inside a formula.
- Policy configuration validates finite values and threshold ordering. Commercial decline floors, the UCA cash-flow floor, and the synthetic consumer credit-score floor are configurable. Default fixture outcomes and arithmetic definitions are unchanged.
- Decisions carry `policy_version`; factors retain `raw_value`, comparison operators, and commercial coverage decline triggers alongside their rounded display values. Internal reason records include failed and unavailable factors without a four-reason truncation. These records are prototype explanations, not applicant notices.
- `backend/data/sba_size_standards.json` records where the SBA size standards come from but holds no NAICS rows yet, because the current SBA workbook isn't bundled. A missing row fails closed instead of falling back to a guessed threshold.
- Every decision and memo carries a prototype disclaimer.
- Requests reject non-finite values, invalid debt/loan inputs, empty financial histories, and combined ownership above 100%. Overflow returns HTTP 422. Zero debt-service coverage is marked not applicable and cannot satisfy an approval factor.
- JSON intake rejects duplicate object keys and non-finite numeric tokens, including overflowing exponents. Browser imports send the original JSON text for backend validation. CSV intake requires one complete row with unique, nonblank headers. Duplicate extracted fields must be resolved before any payload is promoted.
- Audit rationales are trimmed and must be nonblank on the backend as well as in the browser. Saved case commands have a 2,000-character limit. Session/imported history stays separate from immutable saved events; all actor labels remain unverified prototype demonstrations.
- The prototype consumer documentation checklist requires `income`, `assets`, and `debts`; it is configurable and is not a complete legal ATR checklist. The DTI review boundary is recorded as its own decision factor.
- SBA transaction types are `expansion`, `acquisition`, `buyout`, or `esop`. The caller must select the applicable SOP version; effective-date selection is not automated.
- SBA cases must supply `sop_version`; there is no default. Size rows require a six-digit NAICS code, a positive threshold, and a calendar effective date (ISO `YYYY-MM-DD` in JSON); employee thresholds must be whole numbers. Duplicate NAICS rows and explicitly synthetic rows are rejected by the official table loader. Synthetic test rows can still be injected directly into library tests and are labeled in results. Date validation does not select or prove current policy applicability.
- Reason codes come from the factors the decision engine actually evaluated.
- Extracted fields that nobody has confirmed never reach the calculations.

## Limitations

- FCCR uses a simplified EBITDA / (debt service + operating lease) definition, with no capex or cash-tax adjustment.
- The UCA figure is a simplified working-capital version rather than a full UCA statement.
- The fairness check runs on synthetic data and can't establish disparate impact.
- Extraction is a deterministic parser for the synthetic text fixtures. There is no OCR.
- There are no live bureau, bank, tax or market-data connections.
- The security notes map where production controls would sit. Optional local dated-case storage and its browser workspace have immutable server-derived events and revision checks, but no authentication or verified human actor. Unsaved and imported histories remain separate demonstrations. Nothing is certified.
- The decision score is illustrative and uncalibrated. It is not a probability of default.
- Fixture C sits at exactly 43% back-end DTI. The prototype treats 43% as a review boundary and 50% as an illustrative decline boundary, so fixture C goes to review. The current General QM rule has no fixed DTI cap, so these are policy settings.

See `docs/MODEL_DOCUMENTATION.md`, `docs/SECURITY_ARCHITECTURE.md` and `docs/POLICY_SOURCES.md` for sources and scope.
