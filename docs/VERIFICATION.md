# Verification evidence

Target: `rishabbshankar226/Financial-Underwriting-tool` only.
Baseline: `1b59a90f715853a41c5791edf6dce03c1a77839e`.
The approved Decimal migration is implemented. Authentication, SBA evidence and
independent operating-policy approval remain open production gates.

## Executed local checks

Verified 2026-10-15 UTC, following the audit begun 2026-10-14. A clean Python
3.12 environment was installed from the exact development requirements and
constraints. CI uses Python 3.12 and Node 22; local Node is 24.19.0.

| Executed command | Observed result |
| --- | --- |
| `python -m pip check` | No broken requirements found |
| `python -m ruff check backend/app backend/tools backend/tests gate` | All checks passed |
| `python -m mypy --strict backend/app backend/tools gate/reference_calculator.py` | No issues in 30 source files |
| `python gate/reference_calculator.py --selftest` | 18 values and 2 flags passed; all 7 named mutations killed |
| `python docs/precision_probe.py` | Four original defects pass exact expected results |
| `cd backend && python -m pytest -q` | 768 passed in 20.10s |
| `cd frontend && npm run test:decimal` | 5 passed, including 3,012 generated signed rounding cases |
| `cd frontend && ./node_modules/.bin/tsc --noEmit` | Passed |
| `cd frontend && npm run build` | Passed; Vite 8.3.1, 35 transformed modules |
| `cd frontend && npm audit --audit-level=high` | Exit 0; 0 vulnerabilities reported |
| Three contract spec files via Playwright | 103 passed in 3.3s |
| `tests/scenario-recovery.spec.ts` via Playwright | 6 passed in 1.9s |

Published-tree CI results are recorded after verification below. A blocked
launch is never counted as a passing browser interaction test.

## Regression and property checks

The new precision suite first reproduced 29 failures and 5 passes on the
pre-migration implementation. Current tests preserve the original accounting
identities, thresholds and failure assertions.

| Suite | Properties and failures verified |
| --- | --- |
| `test_decimal_precision.py` | Cancellation/large cents, threshold equality, HALF_EVEN, 32 generated independent annuities, policy weights, context/thread isolation, malformed inputs and immutable v1 receipt bytes |
| `test_decimal_math.py` | Numeric bounds/traps, residual ties, maximum rate/term, Metric validation and direct-v2 JSON precision rejection |
| `test_reporting_reconciliation.py` | 120 fixed-seed ledgers / 240 periods, including subcent and large values; exact reported gross-profit/EBITDA/income identities, unchanged inputs and additive trace reconciliation |
| `test_storage_permissions.py` | New store is 0600 under umask 0; reproduced 0644 before the fix |
| `test_numeric_domain_audit.py` | Payment domains/references, zero-rate identity, DTI identities and monotonicity |
| `test_request_budget_audit.py` | Actual bytes, inclusive boundary, media types, misleading lengths, chunks, early stop and HTTP failures |
| `test_replay_precision_audit.py` | Cent discrepancies at large balances; bounded legacy absolute tolerance |
| API/storage/scenario suites | Exact v2 contracts, immutable archives, original retries, concurrency, restore, scenario identities and policy retention |
| `tests/decimal-checks.mjs` | Independent integer rounding oracle, exact large balances, ties, percentages, raw numeric tokens and unsupported domains |
| Playwright suites | Runtime guards, frozen opaque archives, command recovery and real desktop/mobile workflows |

Generated checks use isolated fixed-seed standard-library generators and
independent Decimal/integer oracles. No property-testing package was added.
Accounting identities use exact assertions. Loan-power comparisons use a
declared `1e-24` reference tolerance; policy comparisons use no epsilon.

## Repeatable commands

Use the complete [README](../README.md) setup. With the environment active,
from the repository root:

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

The aggregate script stops on the first failure. Ports 8000/5173 must be free.
An existing isolated compatible Chromium can be selected with
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Browser provisioning and CI

Local matching Chromium downloads were truncated or stalled. A selected
workspace test reached browser launch and failed because the headless executable
was absent. The 59 browser interaction tests are therefore
**[Not executed in local runtime]**. Contract checks run without a browser:

```bash
cd frontend
npm run test:e2e -- tests/contracts.spec.ts tests/cases-contracts.spec.ts \
  tests/scenario-contracts.spec.ts tests/scenario-recovery.spec.ts --reporter=line
```

The full suite collects 168 tests: 109 contracts and 59 browser interactions.
Initial migration CI run
[38666492601](https://github.com/rishabbshankar226/Financial-Underwriting-tool/actions/runs/38666492601)
on commit `4898b453a3240404637d46c5a1e09a73f751c423` passed the backend
job: 768 tests in 29.99s, Ruff, strict mypy, reference gate and all four
precision probes. The frontend job passed install, audit, decimal tests and
build, then reported 167 passing Playwright tests and one stale percentage
format assertion. `assessment.spec.ts:324` expected `12.5%`; the application
correctly displayed the new fixed-precision `12.50%`. That expected display
was corrected without relaxing API-unit, history, recovery or math assertions.
Full-suite success requires verified results from the follow-up run. The older
717-backend/161-browser run predates this migration and does not verify it.

## Dependency evidence and limits

Runtime requirements and `constraints-py312.txt` pin runtime packages.
Development requirements and `constraints-dev-py312.txt` add existing tests and
approved mypy/Ruff. The clean environment has no multipart dependency. The npm
lockfile remains the resolved frontend source.

An actual OSV batch query for all 28 pinned Python development packages returned
no matched advisories. Its dated request/response is in
[the dependency audit](DEPENDENCY_AUDIT_2026-10-14.json). Advisory lookups do not
prove absence of vulnerabilities.

Software tests establish synthetic regression behavior, not predictive validity,
legal compliance, complete SBA eligibility or production access control. See
the [audit](AUDIT_2026-10-14.md) and
[remaining proposal](PRODUCTION_CONTRACT_APPROVAL.md).
