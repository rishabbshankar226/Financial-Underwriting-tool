# Spreadline

Spreadline is a deterministic underwriting reference application for synthetic
commercial, consumer, and SBA cases. A FastAPI service calculates financial
facts and policy comparisons; a React workspace displays those results and
records explicit analyst edits. Optional SQLite storage retains original dated
commercial assessments, revisions, and reviewed scenario comparisons.

## Operational status

This repository is a development reference implementation. It is not ready for
real borrower information or unattended lending decisions. Current financial
contracts use binary floating-point values, the API has no authentication, and
the bundled SBA size table contains no official rows. Passing regression tests
does not resolve these production blockers or validate the illustrative policy.

The [audit ledger](docs/AUDIT_2026-10-14.md) distinguishes implemented fixes from
remaining findings. The [approval proposal](docs/DECIMAL_MIGRATION_APPROVAL.md)
defines the contract, calculation, and verification changes required next.

## Architecture

| Component | Responsibility |
| --- | --- |
| `backend/app/schemas.py`, `assessment_contracts.py`, `scenario_contracts.py` | Request and response validation; dated periods, units, and scenario bounds |
| `backend/app/core.py` | Shared financial arithmetic and calculation operands |
| `backend/app/decision.py`, `config.py` | Explicit policy comparisons, outcomes, and reason codes |
| `backend/app/assessment.py`, `scenarios.py` | Dated spreads, fingerprints, and hypothetical projections |
| `backend/app/cases.py`, `comparison_storage.py` | Atomic SQLite writes, immutable revisions, original receipts, and integrity checks |
| `backend/app/main.py`, `request_limits.py`, route adapters | HTTP transport, request budgets, validation, and error translation |
| `frontend/src/` | Typed response guards, input editing, saved-write recovery, and financial presentation |
| `gate/reference_calculator.py` | Independent fixture calculations and mutation checks; never imported by the application |

All financial decisions and projections run in Python. There is no LLM,
stochastic model, bureau integration, OCR service, or external financial-data
connection. Browser code formats server facts and normalizes editor inputs.

## Calculation and decision methodology

For each supplied annual period:

- Gross profit = gross receipts − COGS.
- Ordinary business income = gross profit − operating expenses − officer
  compensation − depreciation − amortization − existing interest − Section 179.
- EBITDA = ordinary business income + existing interest + depreciation +
  amortization + Section 179.
- Proposed monthly debt service uses a fully amortizing fixed-rate payment.
  For principal `P`, nominal annual rate `a`, and term `n`, monthly rate `r = a/12`
  and payment `P*r / (1 - (1+r)^(-n))`. At zero rate, payment is `P/n`.
  Annualized service is twelve monthly payments.
- Business debt service = existing interest + annual CPLTD + proposed annualized
  debt service. DSCR = EBITDA / business debt service.
- Simplified FCCR = EBITDA / (business debt service + operating lease).
- Global DSCR uses ownership-weighted business EBITDA plus supplied outside
  income over business and personal debt service. With no guarantors, it uses
  full business EBITDA.
- Simplified UCA cash flow = EBITDA − cash taxes − (increase in receivables +
  increase in inventory − increase in payables).
- Consumer front-end DTI uses housing principal/interest, tax, and insurance;
  back-end DTI adds other monthly debt. Both divide by positive gross income.

Policy comparisons use unrounded calculation values. Decision display values
currently use Python's binary-float rounding; exact decimal reporting is an
open audit finding. The weighted decision score is illustrative and is not a
calibrated probability of default.

Negative coverage denominators, invalid loan terms, and non-finite direct
calculation inputs are rejected. A zero debt-service denominator remains an
explicit not-applicable metric in HTTP assessments and cannot satisfy approval.
Legacy Python coverage helpers retain their existing infinity sentinel until
the approved decimal contract replaces it.

Dated inputs must contain complete, ordered annual periods. Working capital
must match the latest period. K-1 stability requires comparable adjacent annual
periods; missing periods are not inferred. Scenario previews retain observed
history and the original policy while changing only their explicit targets.

The SBA loader fails closed when its required NAICS row is absent. Default
coverage, consumer, and SBA rules are illustrative configuration values, not a
claim that an actual transaction complies with current regulation.

## Prerequisites

- Python 3.12. SQLite commands use Python 3.12's explicit `autocommit` API.
- Node.js 22.12 or later in the Node 22 release line, or a compatible later
  supported release. CI uses Node 22; this audit also built with Node 24.19.0.
- A Chromium executable for browser regression tests. CI installs Playwright's
  matching browser build.
- Free local ports 8000 and 5173 for browser tests.

Direct dependencies are exactly pinned in the manifests. Python's complete
resolution is constrained by `backend/constraints-py312.txt`; npm's complete
resolution is retained in `frontend/package-lock.json`.

## Setup and execution

Run these commands from the repository root:

```bash
python3.12 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt -c backend/constraints-py312.txt
npm --prefix frontend ci
```

Start the backend in one terminal with the Python environment active:

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. `VITE_API_URL` sets the backend URL at frontend
startup/build time; its default is `http://localhost:8000`. It must not contain
credentials. `GET /health` returns process health, not model-validation status.

Submit the separate dated synthetic fixture:

```bash
curl --fail-with-body http://127.0.0.1:8000/commercial/assessment \
  -H 'Content-Type: application/json' \
  --data-binary @backend/fixtures/alpine_dated.json
```

## HTTP contracts and local storage

| Route family | Behavior |
| --- | --- |
| `POST /commercial/decision` | Legacy undated commercial assessment |
| `POST /commercial/assessment` | Dated spread, current pro forma facts, policy comparisons, trace, and fingerprint |
| `POST /consumer/decision` | Consumer DTI and configured documentation/policy checks |
| `POST /sba/evaluate` | SBA evaluation using an explicitly selected SOP and loaded size row |
| `/cases` | Optional local dated-case creation, original reads, revisions, and replay |
| `/cases/{id}/revisions/{revision}/scenarios/preview` | Read-only shocks against an explicit original saved baseline |
| `/cases/{id}/revisions/{revision}/scenario-comparisons` | Retain a reviewed batch using its fingerprint and operation UUID |

All POST, PUT, and PATCH request bodies are bounded at 1,000,000 actual bytes
before framework decoding and route dependencies. Acceptance does not trust
`Content-Length`. JSON intake rejects duplicate keys, non-finite tokens, invalid
UTF-8, and container nesting above 128 levels. Dated and saved commands reject
unknown fields; legacy models retain their documented compatibility behavior.
Oversized requests return 413; invalid arithmetic returns 422. Local development
CORS origins can read these error responses.

To enable storage, with the backend stopped and the Python environment active:

```bash
cd backend
mkdir -p .spreadline-data/backups
export SPREADLINE_CASE_DB="$PWD/.spreadline-data/cases.sqlite3"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

`SPREADLINE_CASE_DB` is optional for stateless assessment. Missing configuration
returns 503 from storage routes. New empty stores initialize schema v2;
supported schema-v1 stores are not upgraded automatically. Revisions, receipts,
and comparison records are immutable. Numeric edits require `If-Match` and an
operation UUID; exact retries return the original committed receipt. The fixed
demonstration actor label is not an authenticated human identity.

See [case storage](docs/CASE_STORAGE.md) for verify/backup/restore commands and
[saved comparisons](docs/SCENARIO_COMPARISONS.md) for the explicit copy upgrade.
Keep databases and backups in ignored `.spreadline-data` directories or outside
the repository. `.env` files are ignored; do not commit credentials.

## Verification

With the Python environment active:

```bash
python -m pip check
python gate/reference_calculator.py --selftest
(cd backend && python -m pytest -q)
(cd frontend && ./node_modules/.bin/tsc --noEmit)
npm --prefix frontend run build
npm --prefix frontend audit --audit-level=high
```

TypeScript enables strict checking and rejects unused local variables and
parameters. The backend regression suite includes deterministic generated
payment/DTI identities, non-finite/negative-input failures, actual streamed-body
budgets, and cent discrepancies in replay. These checks still use the v1 float
contract; they do not prove exact decimal accounting.

For browser verification:

```bash
(cd frontend && npx playwright install --with-deps chromium)
./scripts/run_all_checks.sh
```

Alternatively, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing isolated
Chromium installation and keep its system libraries available. Tests own a new
temporary database and both local servers; they do not adopt a configured user
database. Browser checks require a working executable; a build alone does not
verify browser behavior.

Python linting and strict type checking require approval to add Ruff and mypy
as development dependencies. They are not currently installed or part of the
verification script. Their intended commands are:

```bash
python -m ruff check backend/app backend/tools backend/tests gate
python -m mypy --strict backend/app backend/tools
```

See [verification notes](docs/VERIFICATION.md) and the dated audit for executed
results and blocked checks.

## Security and model limits

Bind the development services to loopback. CORS, ETags, operation UUIDs, and
payload hashes do not authenticate callers. An externally reachable deployment
requires an approved access-control boundary, TLS, verified actor attribution,
and operational monitoring before real financial information is handled.

FCCR and UCA are simplified definitions. The repository does not implement LTV,
debt yield, IRR, NPV, or an amortization schedule. Synthetic geography checks do
not establish disparate impact. The deterministic text extractor is not OCR,
and each promoted field requires explicit confirmation. The official SBA table
must be loaded and its applicability reviewed before SBA eligibility is used.

Further definitions and limits are in [model documentation](docs/MODEL_DOCUMENTATION.md),
[assessment contracts](docs/ASSESSMENT_CONTRACT.md),
[policy sources](docs/POLICY_SOURCES.md), and
[security architecture](docs/SECURITY_ARCHITECTURE.md).
