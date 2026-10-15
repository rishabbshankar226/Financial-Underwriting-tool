# Verification evidence

Target: `rishabbshankar226/Financial-Underwriting-tool` only.
Baseline: `1b59a90f715853a41c5791edf6dce03c1a77839e`.
Approved Decimal, authentication and SBA contract changes are implemented.

## Verified implementation and full CI

[GitHub Actions run 38780154052](https://github.com/rishabbshankar226/Financial-Underwriting-tool/actions/runs/38780154052)
completed successfully on implementation commit
`6d9fdcd1b96957b85108721710030b42dad27e88`, October 15, 2026 UTC.
Both job conclusions and complete decoded logs were retrieved and inspected.

| Executed CI check | Observed result |
| --- | --- |
| Backend job `116577938914` | 948 tests passed in 32.78s |
| Python quality in that job | Ruff passed; strict mypy passed all 31 application/CLI/gate source files; pip consistency passed |
| Independent reference gate | 18 values and 2 flags passed; all 7 named mutations killed |
| Original precision probes | All 4 corrected results passed exact assertions |
| Frontend job `116577938427` | Node 22 install, audit, exact decimal tests and strict TypeScript production build passed; 37 Vite modules transformed |
| Dependency audit in that job | npm audit exited 0 and reported zero vulnerabilities |
| Full Chromium Playwright suite | 185 passed in 1.1m: 121 browser-independent contract/recovery checks and 64 real browser interactions |
| Node decimal suite | 5 tests passed, including 3,012 generated signed rounding cases |

The final follow-up updates documentation only. Application, tests, dependency
pins, official workbook and CI files remain identical to this verified commit.
The complete decoded logs accompany the review export. The earlier passing
migration run 38666759875 (768 backend / 168 Playwright) is historical evidence,
not the verification of the final access/SBA implementation.

## Executed local checks

A clean Python 3.12 environment was installed from the exact development
requirements and constraints. CI uses Python 3.12 and Node 22; local Node is
24.19.0. The final implementation produced:

| Executed command | Observed result |
| --- | --- |
| `python -m pip check` | No broken requirements found |
| `python -m ruff check backend/app backend/tools backend/tests gate` | All checks passed |
| `python -m mypy --strict backend/app backend/tools gate/reference_calculator.py` | No issues in 31 source files |
| `python gate/reference_calculator.py --selftest` | 18 values, 2 flags and all 7 mutations passed |
| `python docs/precision_probe.py` | All 4 original defects now pass exact expected results |
| `cd backend && python -m pytest -q --tb=short` | 948 passed in 22.01s |
| `cd frontend && npm run test:decimal` | 5 passed, including 3,012 generated rounding cases |
| `cd frontend && npm run build` | Strict TypeScript and production build passed; 37 modules |
| `cd frontend && npm audit --audit-level=high` | Exit 0; 0 vulnerabilities reported |
| Five contract/recovery spec files through Playwright | 121 passed in 4.4s |
| `cd frontend && npm run test:e2e -- --list` | Collected 185 tests in 10 files |

Local matching Chromium provisioning was unavailable. The 64 real browser
interaction checks are **[Not executed in local runtime]**; they actually ran
and passed in the identified CI job above. Contract tests do not substitute
for browser interaction results.

## Reproduction and regression coverage

Tests first reproduced the defects before implementation: 29 precision failures,
143 authentication failures, and 15 SBA evidence/source failures. Separate
regressions reproduced rejection of legitimate pagination queries, credential
identity equal to the secret, and invalid copied SBA models. They now pass.
Additional trailing-line-terminator rejection tests passed on first execution;
no validator change or reproduced defect is claimed for those checks.

| Suite | Properties and failure modes |
| --- | --- |
| `test_decimal_precision.py` | Large cents/cancellation, exact policy equality, HALF_EVEN, 32 generated independent annuities, weights, thread/context isolation, malformed values and immutable v1 receipt bytes |
| `test_decimal_math.py` | Numeric domains/traps, signed residual ties, maximum rate/term, strict Metric and direct-v2 JSON precision rejection |
| `test_reporting_reconciliation.py` | 120 fixed-seed ledgers / 240 periods, subcent and large inputs; exact reported gross-profit/EBITDA/income identities and additive trace reconciliation without changing accepted inputs |
| `test_numeric_domain_audit.py` | Payment references/domains, zero-rate identity, DTI identities and monotonicity |
| `test_request_budget_audit.py` | Inclusive actual-byte boundary, chunks, misleading lengths, media types, early stop and disconnect |
| `test_storage_permissions.py` | New POSIX store uses 0600 under umask 0; original implementation reproduced 0644 |
| `test_replay_precision_audit.py` | Large-balance cent differences; bounded legacy absolute tolerance |
| `test_authentication.py` | 158 parameterized cases across route families/aliases; headers, configuration, no unauthorized body/calculation/store initialization, CORS, attribution, token rotation and original receipts |
| `test_sba_evidence.py` | 22 cases: official rows and dates, exact boundaries, employee averaging basis, unknown/footnoted/exception/asset measures, strict evidence, tampered source, copied-model domain bypass and exact schema-locked API output |
| API/storage/scenario suites | V2 contracts, immutable originals, original retries, concurrency, backup/restore, policy retention and scenario identities |
| `tests/decimal-checks.mjs` | Independent integer oracle, large balances, HALF_EVEN ties, percentages, exact JSON tokens and unsupported domains |
| `authentication-contracts.spec.ts` | 12 transport checks: strict identifiers, query preservation, origin binding, no override/redirect/cookie/cache leaks, 401 clearing, stale response rejection, timeout/cancel/disconnect exact-write retention |
| `authentication.spec.ts` | 5 real browser workflows: no anonymous API request, invalid-token retry, API-only credential/no storage/reload, disconnect and committed-write exact recovery |
| Other Playwright suites | Runtime guards, frozen archives, saved-case/scenario recovery, original attribution, desktop/mobile layout, keyboard focus and obsolete-response handling |

Generated properties use isolated fixed-seed standard-library generators and
independent Decimal/integer oracles. No property-testing dependency was added.
Accounting identities use exact assertions. Loan-power reference comparisons
use a declared `1e-24` tolerance; policy comparisons use no epsilon.

## Repeatable commands

Use the complete [README setup](../README.md). With the Python environment
active, from the repository root:

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
Browser tests own a temporary store and explicitly configured synthetic
credential; they neither bypass the production guard nor require real secrets.
An installed compatible isolated Chromium can be selected using
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Browser-independent checks can run without Chromium:

```bash
cd frontend
npm run test:e2e -- tests/contracts.spec.ts tests/cases-contracts.spec.ts \
  tests/scenario-contracts.spec.ts tests/scenario-recovery.spec.ts \
  tests/authentication-contracts.spec.ts --reporter=line
```

## Dependency and delivery evidence

Runtime and development requirements have exact constraints. Only the approved
mypy/Ruff direct development dependencies were added; multipart was removed.
The npm lockfile remains the resolved frontend dependency source. An actual OSV
batch query of all 28 pinned Python development packages returned no matched
advisories; [the dated request/response](DEPENDENCY_AUDIT_2026-10-14.json) is
retained. Advisory results are point-in-time, not absence-of-vulnerability proof.

The complete baseline-to-review binary unified diff is checked with
`git apply --check` against a separate clean checkout of the exact baseline.
The review ZIP includes all complete changed-file replacements, the patch,
SHA-256 manifest, complete README/audit and decoded final CI logs. Frozen v1
SQL/provenance and original receipt fixtures remain byte-identical to baseline.

These checks establish supported deterministic software behavior. Predictive
credit-model validation, institutional policy approval, complete SBA eligibility,
and deployment-specific compliance are outside what software tests establish.
See [the audit](AUDIT_2026-10-14.md), [SBA methodology](SBA_SCREENING.md) and
[security deployment requirements](SECURITY_ARCHITECTURE.md).
