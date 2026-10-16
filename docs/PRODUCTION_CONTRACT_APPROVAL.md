# Approved authentication and SBA contract record

Target: `rishabbshankar226/Financial-Underwriting-tool` only.

The user continued after the concrete authentication/SBA proposal, approving
the required HTTP credential and stricter SBA evidence/result contracts. These
changes are implemented. The earlier Decimal migration and pinned mypy/Ruff
approval remains recorded in [DECIMAL_MIGRATION_APPROVAL.md](DECIMAL_MIGRATION_APPROVAL.md).
No additional dependency, directory deletion, main merge or other repository
work forms part of this approval.

## Implemented access contract

| Surface | Behavior |
| --- | --- |
| Configuration | Require `SPREADLINE_API_TOKEN` and `SPREADLINE_OPERATOR_ID`; bounded ASCII values; reserved actor and secret-as-actor rejected |
| Protected routes | Financial, saved-case, scenario, comparison and schema/documentation routes require one Bearer header before body consumption, arithmetic or database initialization |
| Public routes | Minimal `GET /health`; permitted CORS preflight grants no application access |
| Verification | `hmac.compare_digest`; malformed, wrong or duplicate credentials return 401; invalid server configuration returns 503 without exposing values |
| Authorization | One operator credential accesses the configured single-operator database; commands cannot supply an actor, owner or database |
| Event identity | New events use the server-derived operator ID; archived demonstration actors and committed receipts remain unchanged |
| Browser | Manual entry; page-memory credentials; API-origin binding; HTTPS except loopback; no redirects/cookies; bounded request deadlines |
| Recovery | Reload/disconnect/401 clears access; exact command/key/ETag tracking remains for explicit review; no automatic resubmission |

This model identifies a credential, not an independently verified human. It
does not provide multiple tenants or MFA. A multi-user deployment needs its
own reviewed identity/ownership design. Host CLI operations rely on host
access controls. TLS termination, private store placement, backup protection,
rate limits and an approved lending policy are deployment responsibilities.

## Implemented SBA contract

`sba-screen-v2` requires an assessment date and strict `size_evidence` specifying
the complete measurement period, supported receipts/payroll-average basis,
affiliate treatment and evidence reference. Employee inputs remain integer
ceilings of the supplied average; financial inputs remain exact decimals.

The packaged official workbook is hash-pinned and effective March 17, 2023,
verified through October 15, 2026. Supported rows retain their URL, hash, dates
and workbook row. Footnotes, exceptions and unsupported measures fail explicitly.
The selected SOP must apply on the assessment date.

The strict `sba-screen-result-v2` separates completed size/coverage screens
from unresolved lender determinations. It always reports incomplete eligibility.
Limited supplied-resource arithmetic cannot pass credit elsewhere. Default
coverage floors remain identified as configured operator policy. The complete
source/methodology and a valid input are in [SBA_SCREENING.md](SBA_SCREENING.md).
Old synthetic examples remain historical fixtures and are not relabeled as
official source data or complete eligibility decisions.

## Acceptance evidence

Authentication tests first reproduced 143 failures on the unguarded service.
Current tests cover every protected route family, aliases, malformed/duplicate
headers, configuration failures, no unauthorized body reads/calculations/store
creation, token rotation, immutable retries, event attribution and no credential
in stored receipts. SBA tests reproduced missing-source/contract failures and
now verify exact boundaries, source/date/evidence failures and incomplete
outcomes. Browser contracts cover origin confinement, cancellation, deadlines,
401 re-entry and exact pending-write retention. Real browser checks cover
manual entry, reload, disconnect and committed-write recovery.

[CI run 38780154052](https://github.com/rishabbshankar226/Financial-Underwriting-tool/actions/runs/38780154052)
verified implementation commit `6d9fdcd1b96957b85108721710030b42dad27e88`:
948 backend tests and 185 Playwright tests passed. Exact commands and logs are
recorded in [VERIFICATION.md](VERIFICATION.md). These checks establish supported
software behavior; they do not provide credit-policy approval or legal certification.
