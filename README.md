# Spreadline

Deterministic underwriting calculations, exact financial reports, and immutable
local assessment records. The FastAPI service calculates commercial and
consumer ratios and policy comparisons. A React workspace reviews dated
spreads, analyst edits, and scenario comparisons. SQLite retains original
inputs, decisions, traces, policies, and retry receipts.

Production hardening remains incomplete. Caller authentication and verified
actor attribution require the [next contract approval](docs/PRODUCTION_CONTRACT_APPROVAL.md).
The SBA dataset contains source metadata and no official thresholds; SBA
eligibility remains unavailable. Default credit rules are illustrative and
require independent approval for actual lending. Use synthetic inputs until
these controls and operating policies are implemented and validated.

## Architecture

| Module | Responsibility |
| --- | --- |
| `backend/app/finance.py` | Decimal validation, isolated contexts, canonical values, HALF_EVEN reporting and residual allocation |
| `schemas.py`, `assessment_contracts.py`, `scenario_contracts.py` | Strict runtime request and response contracts |
| `core.py`, `decision.py`, `config.py` | Shared calculations, recorded operands, policy comparisons and grounded reasons |
| `assessment.py`, `scenarios.py` | Dated financial reports, hypothetical projections and fingerprints |
| `cases.py`, `comparison_storage.py` | Atomic immutable records, original receipts, integrity verification and pagination |
| `main.py`, route adapters, `request_limits.py` | Bounded HTTP intake, exact numeric-token decoding and error translation |
| `frontend/src/` | Typed response guards, exact editor values, report formatting and explicit write recovery |
| `gate/reference_calculator.py` | Independent Decimal reference formulas and named mutation checks |

The application has no LLM, Monte Carlo model, bureau connection, or OCR
service. Python calculates financial results. Browser BigInt arithmetic handles
decimal-place conversion, validation, and financial presentation.

## Precision and reporting

Financial calculations use string-initialized `Decimal` with 96 significant
digits in fresh local contexts. DivisionByZero, InvalidOperation, Overflow,
and Underflow traps are enabled. Intermediate exponent capacity supports the
full declared loan range; returned results have an explicit finite range.
Ambient process/thread rounding cannot change the calculations.

Financial input supports up to 34 significant digits, zero, or a nonzero
magnitude from `1e-30` through `1e30`. Annual nominal rates lie in `[0, 1]`.
Dated loan terms are integer months from 12 through 12,000; the legacy payment
helper also supports shorter positive terms. Unsupported values are rejected.

Canonical JSON financial values are decimal strings. Term months, revisions,
indexes, employee counts, and credit-score inputs remain integers. Existing
HTTP numeric input is decoded from its original token before binary float
conversion. Direct Python callers should use `Decimal` or decimal strings;
new v2 model JSON validation rejects floating financial tokens rather than
silently rounding them. Existing v1 intake is explicitly normalized.

Raw intermediates remain separate from reported amounts. Reporting applies
`ROUND_HALF_EVEN`: monetary figures use cents and ratios use four places.
`reported_financials` reconciles annual source rows to gross profit, EBITDA,
and ordinary income. Guarantor reported contributions reconcile to their
reported aggregates. Additive traces include contextual reported operands
whose signed sum equals the reported total. Residual cents go to the largest
signed rounding residual, with input order breaking ties. Raw values and
accepted inputs remain unchanged; reporting allocations never determine policy.

## Methodology

- Gross profit = receipts − COGS. Ordinary income subtracts operating expenses,
  officer compensation, depreciation, amortization, existing interest, and
  Section 179. EBITDA adds back interest, depreciation, amortization, and
  Section 179.
- For principal `P`, annual nominal rate `a`, and months `n`, monthly rate
  `r = a/12` and level payment is `P*r/(1-(1+r)^(-n))`. A zero rate uses `P/n`.
  Annual proposed service uses twelve unrounded monthly payments; the displayed
  monthly amount is an indicative rounded amount, not an amortization schedule.
- Business service = existing interest + annual CPLTD + proposed annual service.
  DSCR = EBITDA / business service. Simplified FCCR adds operating leases to
  the denominator.
- Global DSCR uses ownership-weighted EBITDA plus outside income over business
  and personal service. Empty guarantors use full business EBITDA. K-1
  distributions are not added to EBITDA again.
- Simplified UCA = EBITDA − cash taxes − (AR increase + inventory increase − AP
  increase). Consumer DTI divides housing and total monthly debt by positive
  gross monthly income.

Zero coverage denominators return an explicit unavailable result and cannot
pass a policy factor. Negative denominators, negative consumer debt, and
non-finite values are rejected. Financial periods must be complete, ordered,
non-overlapping years; working capital must match the latest period. K-1
stability uses comparable adjacent periods and does not invent missing history.
Scenario projections retain observed history and the saved policy.

The weighted-rule score is not a probability of default. FCCR and UCA are
simplified definitions. LTV, debt yield, IRR, NPV, and payment schedules are not
implemented. See [model documentation](docs/MODEL_DOCUMENTATION.md).

## Setup

Prerequisites: Python 3.12, Node.js 22.12 or later in the supported Node 22 line,
SQLite from Python 3.12, and free ports 8000/5173 for browser tests. CI uses
Python 3.12 and Node 22.

From the repository root:

```bash
python3.12 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements-dev.txt -c backend/constraints-dev-py312.txt
npm --prefix frontend ci
```

Runtime-only installations use `backend/requirements.txt` with
`backend/constraints-py312.txt`. Development requirements add the existing test
packages and pinned mypy/Ruff. All direct versions and transitive resolutions
are pinned; npm uses `frontend/package-lock.json`.

Start the backend with the Python environment active:

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In another terminal:

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. `VITE_API_URL` sets the API base at frontend
startup/build time; its default is `http://localhost:8000`. Keep credentials out
of that URL and the public frontend bundle. `/health` reports process health.

Submit the complete v2 example:

```bash
curl --fail-with-body http://127.0.0.1:8000/commercial/assessment \
  -H 'Content-Type: application/json' \
  --data-binary @backend/fixtures/alpine_dated_v2.json
```

## Contracts and storage

| Interface | Behavior |
| --- | --- |
| `POST /commercial/decision` | Undated commercial rules and reasons |
| `POST /commercial/assessment` | Dated v2 spread, raw/reported facts, policy and trace |
| `POST /consumer/decision` | DTI and configured policy/documentation checks |
| `POST /sba/evaluate` | Limited size/coverage screens; missing official rows fail closed |
| `/cases` | Dated case creation, original reads, revisions and replay |
| `/cases/{id}/revisions/{revision}/scenarios/preview` | Read-only shocks under the selected saved policy |
| `/cases/{id}/revisions/{revision}/scenario-comparisons` | Immutable reviewed comparison retention |

POST/PUT/PATCH bodies are limited to 1,000,000 actual bytes before framework
buffering and store dependencies. JSON rejects duplicates, non-finite tokens,
invalid UTF-8 and nesting above 128 containers. Unknown model fields and
boolean-as-money values are rejected. Oversized requests return 413; invalid
financial input returns 422. Storage errors use `{detail: {code, message}}`.

Current financial versions are `commercial-assessment-v2`,
`commercial-calculation-v2`, `assessment-json-v2`, and the v2 scenario versions.
The SQL schema and storage wrappers remain unchanged. Archived numeric v1
records, hashes, and original receipts are preserved. They remain readable as
original JSON; their unsupported calculator returns `replay_unavailable`.
Archived numeric assessments are read-only. Current v2 replay compares exact
financial strings under the retained policy.

Enable local storage from `backend`, with the server stopped:

```bash
mkdir -p .spreadline-data/backups
export SPREADLINE_CASE_DB="$PWD/.spreadline-data/cases.sqlite3"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

New database files and backup copies use private mode 0600 on POSIX systems.
Existing stores are not chmodded or upgraded automatically. Review permissions
on existing files before use. Missing `SPREADLINE_CASE_DB` leaves stateless
routes available and returns 503 from saved-case routes.

Saved writes require one operation UUID; edits also require the selected strong
ETag. Original committed retries retain their receipts. New operations, stale
ETags, conflicting keys, and unresolved browser tracking have explicit states.
Neither an ETag nor an operation UUID authenticates a caller.

From `backend`:

```bash
python -m tools.case_store verify --source .spreadline-data/cases.sqlite3
python -m tools.case_store backup --source .spreadline-data/cases.sqlite3 \
  --destination .spreadline-data/backups/review.sqlite3
python -m tools.case_store restore --source .spreadline-data/backups/review.sqlite3 \
  --destination .spreadline-data/restored.sqlite3
```

Destinations must be fresh. See [storage](docs/CASE_STORAGE.md),
[scenario retention](docs/SCENARIO_COMPARISONS.md), and
[workspace recovery](docs/WORKSPACE.md). Environment files and local databases
are ignored by git.

## Verification

With the Python environment active, from the repository root:

```bash
python -m pip check
python -m ruff check backend/app backend/tools backend/tests gate
python -m mypy --strict backend/app backend/tools gate/reference_calculator.py
python gate/reference_calculator.py --selftest
python docs/precision_probe.py
(cd backend && python -m pytest -q)
(cd frontend && ./node_modules/.bin/tsc --noEmit)
npm --prefix frontend run test:decimal
npm --prefix frontend audit --audit-level=high
npm --prefix frontend run build
(cd frontend && npx playwright install --with-deps chromium)
./scripts/run_all_checks.sh
```

The backend includes exact threshold/cancellation tests, independent 80-digit
annuity references, fixed-seed generated accounting identities, reporting
reconciliation, context/thread isolation, strict failures, body budgets, storage
permissions, immutable archives, retry identity and scenario invariants. Node
checks exact browser formatting and JSON-token preservation. Playwright checks
contracts and real desktop/mobile workflows against an owned temporary store.

[Verification evidence](docs/VERIFICATION.md) distinguishes executed checks from
blocked browser provisioning. The [audit ledger](docs/AUDIT_2026-10-14.md) records
root causes, patches, results and open production gates. An OSV query of the 28
pinned development-environment packages returned no matched advisories; its
[dated response](docs/DEPENDENCY_AUDIT_2026-10-14.json) is a point-in-time lookup,
not proof that software has no vulnerabilities.
