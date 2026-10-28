# Spreadline

Deterministic underwriting calculations, exact financial reports, and immutable
local assessment records. The FastAPI service calculates commercial and
consumer ratios and policy comparisons. A React workspace opens on a start
screen, explains each decision, and reviews dated spreads, debt capacity,
analyst edits and scenario comparisons. SQLite retains original inputs,
decisions, traces, policies, and retry receipts.

**Open the interactive workspace:** <https://spreadline-testing.onrender.com/>.
It is a public demo on Render for synthetic data only, with no sign-in. Anyone
with the link can see and change saved cases, and a restart deletes them, so do
not enter real borrower information. The free instance sleeps when idle; the
first visit can take about a minute to wake it. The
[Streamlit testing host](docs/STREAMLIT_TESTING.md) guide covers the
deployment, its access boundary and running the same workspace locally.

The supported deployment is one operator credential and one private database.
Financial and storage routes require authentication before processing inputs.
SBA screens use a pinned official workbook and dated measurement evidence;
they explicitly report incomplete eligibility. Default credit rules remain
illustrative and require institutional approval and independent validation
before actual lending. Software regression results do not approve a credit
policy or certify regulatory compliance.

## Architecture

| Module | Responsibility |
| --- | --- |
| `backend/app/finance.py` | Decimal validation, isolated contexts, canonical values, HALF_EVEN reporting and residual allocation |
| `schemas.py`, `assessment_contracts.py`, `scenario_contracts.py` | Strict runtime request and response contracts |
| `core.py`, `decision.py`, `config.py` | Shared calculations, recorded operands, policy comparisons and grounded reasons |
| `assessment.py`, `scenarios.py` | Dated financial reports, hypothetical projections and fingerprints |
| `analysis.py`, `analysis_contracts.py`, `analysis_routes.py` | Read-only analysis: common-size and change spreads, debt capacity, breakevens, cent schedules, coverage grid and decision explanations |
| `field_errors.py`, `contract_errors.py` | Field-mapped validation errors added beside the unchanged `detail` |
| `cases.py`, `comparison_storage.py` | Atomic immutable records, original receipts, integrity verification and pagination |
| `main.py`, route adapters, `request_limits.py` | Bounded HTTP intake, exact numeric-token decoding and error translation |
| `authentication.py` | Environment-loaded Bearer verification and server-derived operator identity before request processing |
| `sba.py`, `backend/data/` | Verified official size rows, dated evidence checks and incomplete eligibility screens |
| `frontend/src/` | Start screen and tabbed views, typed response guards, background analysis, exact editor values, report formatting and explicit write recovery |
| `gate/reference_calculator.py` | Independent Decimal reference formulas and named mutation checks |

The application has no LLM, Monte Carlo model, bureau connection, or OCR
service. Python calculates financial results. Browser BigInt arithmetic handles
decimal-place conversion, validation, and financial presentation; its one other
use sizes Overview chart bars, as drawing geometry that is never shown as a figure.

New commercial evaluations show an assessment preparation animation for at least
five seconds before revealing the recommendation. The calculation starts
immediately; a slower response keeps the pending state visible, and errors
appear without the presentation delay. The transition applies to Excel and
JSON imports, guided forms and examples in both the standalone and Streamlit
workspaces. Unsaved single-field edits recalculate without it, and opening or
saving existing results adds no delay.
Reduced-motion preferences replace the animation with a static indicator.

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
simplified definitions. LTV, debt yield, IRR and NPV are not implemented.

The read-only analysis service adds the following; see the
[analysis contract](docs/ANALYSIS_CONTRACT.md):
- a cent-rounded proposed-loan schedule;
- policy debt capacity;
- breakevens;
- a coverage grid.

Capacity is policy arithmetic, not an approval. See
[model documentation](docs/MODEL_DOCUMENTATION.md).

## Setup

For a temporary Streamlit deployment, see the
[Streamlit testing host](docs/STREAMLIT_TESTING.md). It packages the same React
workspace and invokes the existing backend in-process. It is disabled by
default, asks viewers for a shared access password once enabled unless
`SPREADLINE_PUBLIC_ACCESS` is `true`, uses synthetic data, and labels local
testing records as temporary. `render.yaml` deploys it to Render with public
access on.

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

Configure a cryptographically random operator token obtained from your private
credential manager. It must contain 32–4,096 ASCII bearer characters. The
following Bash input keeps its value out of shell history and command output:

```bash
read -r -s -p 'Operator API token: ' SPREADLINE_API_TOKEN
export SPREADLINE_API_TOKEN
export SPREADLINE_OPERATOR_ID=local-underwriter
```

The operator ID is a non-secret ASCII identifier of 1–128 characters. It must
start with a letter or digit; remaining characters may also include `_.:@-`.
The archived demonstration ID and an ID equal to the token are rejected.
An absent or invalid configuration fails closed with 503 and names the required
environment variable without exposing its value.

Start the backend in that shell with the Python environment active:

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In another terminal:

```bash
cd frontend
VITE_API_URL=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. `VITE_API_URL` sets the API base at frontend
startup/build time; its default is `http://localhost:8000`. Enter the operator
token in **Connect workspace**. The application verifies access before mounting
the financial workspace. Keep credentials out of URLs and the public bundle.
Remote API URLs require HTTPS; HTTP is accepted only on loopback.

Credentials remain in page memory. Reload, disconnect or a 401 requires re-entry.
Disconnect cancels in-flight requests and clears the view. Requests have a
30-second deadline, do not follow redirects, omit cookies, and send the token
only to the configured API origin. Pending writes remain available for explicit
review and exact retry; reconnecting never submits them automatically.

Submit the complete v2 example:

```bash
curl --fail-with-body http://127.0.0.1:8000/commercial/assessment \
  --header @- --data-binary @backend/fixtures/alpine_dated_v2.json <<HEADERS
Authorization: Bearer $SPREADLINE_API_TOKEN
Content-Type: application/json
HEADERS
```

All application routes, including `/openapi.json`, `/docs` and `/redoc`, require
one Bearer header. Missing, invalid or duplicate authorization returns 401 with
a Bearer challenge. `GET /health` returns only `{"status":"ok"}` publicly;
permitted CORS preflight is public and grants no application access. Protected
responses use `Cache-Control: no-store`. See [security architecture](docs/SECURITY_ARCHITECTURE.md)
for TLS, browser storage and host operating requirements.

## Contracts and storage

| Interface | Behavior |
| --- | --- |
| `POST /commercial/decision` | Undated commercial rules and reasons |
| `POST /commercial/assessment` | Dated v2 spread, raw/reported facts, policy and trace |
| `POST /commercial/analysis` | Read-only `commercial-analysis-v1` of a dated v2 request: spreads, debt capacity, breakevens, schedule, coverage grid and explanation |
| `POST /consumer/decision` | DTI and configured policy/documentation checks |
| `POST /sba/evaluate` | Dated `sba-screen-v2` input and strict `sba-screen-result-v2`; completed screens and unresolved eligibility requirements |
| `/cases` | Dated case creation, original reads, revisions, replay, and listing search (`q`, `outcome`, `sort`) |
| `/cases/{id}/revisions/{revision}/analysis` | Read-only analysis of a stored revision under its retained policy after exact replay |
| `/cases/{id}/revisions/{revision}/scenarios/preview` | Read-only shocks under the selected saved policy |
| `/cases/{id}/revisions/{revision}/scenario-comparisons` | Immutable reviewed comparison retention |

POST/PUT/PATCH bodies are limited to 1,000,000 actual bytes before framework
buffering and store dependencies. JSON rejects duplicates, non-finite tokens,
invalid UTF-8 and nesting above 128 containers. Unknown model fields and
boolean-as-money values are rejected. Oversized requests return 413; invalid
financial input returns 422. Storage errors use `{detail: {code, message}}`.

Contract rejections and rejected saved edits keep that `detail` unchanged. They
also add a `field-errors-v1` `errors` envelope, in which each item names:
- the submitted field, as a JSON Pointer;
- a stable code;
- a plain message;
- any violated limit.

See the [assessment contract](docs/ASSESSMENT_CONTRACT.md#field-mapped-errors-field-errors-v1).

The bundled SBA workbook is effective March 17, 2023 and was verified through
October 15, 2026. Its bytes, URL, hash and row references are checked. The loader
supports 850 unambiguous receipts/employee rows and refuses 128 rows with
footnotes, industry exceptions or unsupported measures. Inputs require a
completed three- or five-fiscal-year receipts average, or the integer ceiling
of a 24-month pay-period employee average, with dates, affiliate treatment and
a source reference. Unsupported periods or assessment dates fail explicitly.
Passing size and configured coverage screens returns `review_required` with
`eligibility_status: incomplete`; owner-resource arithmetic never establishes
credit elsewhere. See the complete [SBA methodology and example](docs/SBA_SCREENING.md).

Current financial versions are:
- `commercial-assessment-v2`, `commercial-calculation-v2` and `assessment-json-v2`;
- the v2 scenario versions;
- the additive read-only `commercial-analysis-v1`, `field-errors-v1` and
  `case-listing-v2` contracts, approved in the
  [usability record](docs/ANALYST_USABILITY_APPROVAL.md).
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
New events record the server-configured operator ID, identifying the credential
used. Archived actors and original committed receipts remain unchanged after
token/operator rotation. This model provides no separate human verification,
multi-user tenancy or MFA. Local storage CLI access relies on host permissions.

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

The workspace's **History & Audit** view downloads a [deterministic JSON review package](docs/REVIEW_EXPORTS.md)
for a saved original, optionally with one matching retained comparison. It
preserves the parsed originals and recorded hashes with explicit unverified
provenance; it does not claim original server bytes or independently verified
hashes.

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

[Verification evidence](docs/VERIFICATION.md) records executed local checks and
real browser CI. The [audit ledger](docs/AUDIT_2026-10-14.md) records root causes,
remediation and compatibility. The [contract approval record](docs/PRODUCTION_CONTRACT_APPROVAL.md)
documents the authorized authentication/SBA migration. An OSV query of the 28
pinned development-environment packages returned no matched advisories; its
[dated response](docs/DEPENDENCY_AUDIT_2026-10-14.json) is a point-in-time lookup,
not proof that software has no vulnerabilities.
