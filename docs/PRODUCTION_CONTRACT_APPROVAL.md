# Remaining production contract approval

The Decimal migration and mypy/Ruff dependencies were approved by the user's
continuation after `DECIMAL_MIGRATION_APPROVAL.md`. They are implemented in the
review branch. The changes below are proposed, not implemented.

The user's stop condition is: **"STOP and ask for human approval before deleting
directories, adding any new third-party dependency, or making breaking
schema/API changes."** The earlier Decimal proposal explicitly
excluded a new authentication/session contract. This document makes that next
decision concrete; it does not request approval to advance to another repository.

## 1. Protect the existing single-operator application

The inspected route dependencies select a database without authenticating a
caller. Current events use a fixed unverified actor. ETags, operation UUIDs,
CORS and hashes cannot provide access control.

Proposed smallest contract for a single-operator deployment, using stdlib only:

| Surface | Proposed behavior |
| --- | --- |
| Configuration | Require `SPREADLINE_API_TOKEN` and `SPREADLINE_OPERATOR_ID`; explicit configuration errors name the missing variable without exposing credentials |
| Protected routes | All financial, saved-case, scenario, comparison and schema-documentation routes require one `Authorization: Bearer` credential before database dependencies or arithmetic |
| Public route | `/health` exposes only minimal readiness/liveness information |
| Token validation | Validate bounded credentials; compare with `hmac.compare_digest`; never log, persist, echo or embed a token in a URL/frontend bundle |
| Failure states | Missing/invalid credentials return 401 with a Bearer challenge; unconfigured protection fails closed; duplicate authorization headers are rejected |
| Authorization | One operator credential owns the configured single-operator database; no caller-supplied actor, owner or database selection |
| Event identity | New records use a server-derived operator credential identity; archived demonstration actor strings and original receipt bytes remain readable |
| Browser | Explicit credential entry kept in memory for the current page; send only to the configured API origin; reload requires re-entry and never submits a pending write automatically |
| Recovery | Preserve exact saved command/key/ETag; token rotation/re-entry does not rewrite the operation or old records |

This changes required HTTP credentials and the event actor contract. A shared
operator token identifies a credential, not an independently verified human.
It does not provide multi-user tenancy or MFA. A multi-user institutional
installation instead requires its chosen identity provider/gateway and ownership
model; no provider or dependency is selected without approval.

Acceptance checks: unauthenticated/wrong-token/duplicate-header requests fail
before storage initialization; protected reads cannot bypass the guard; origin
changes never forward a credential; new event identity cannot be spoofed;
original archives/receipts remain byte-identical; token rotation and lost-write
recovery remain explicit; no token appears in logs, storage or built assets.

TLS, private database placement, restrictive file permissions and a reviewed
operating policy remain deployment responsibilities. New POSIX database files
already use 0600; existing files are not silently chmodded.

## 2. Make SBA screens supportable before claiming eligibility

`backend/data/sba_size_standards.json` has no official rows. `sba.py` implements
limited size, coverage and personal-resources screens, not all SBA origination
requirements. The current case contract lacks a dated size-evidence basis and
an explicit distinction between these screens and a complete eligibility result.

Proposed v2 contract changes:

- Require an assessment date and an explicit basis for supplied SBA receipts or
  employee measurements, including treatment of affiliates. Retain exact decimal
  amounts and integer employee counts.
- Load only verified official dated standards with source URL/effective date and
  content hash. Do not flatten ambiguous exceptions or unsupported measures into
  a guessed threshold; reject unsupported rows explicitly.
- Check the selected SOP and standard against the assessment date. Keep policy
  floors identified as approved operator policy, not inferred legal rules.
- Report completed screens and unresolved requirements separately. Three passing
  screens must not present a complete SBA eligibility approval. Missing required
  evidence remains unavailable/review-required.
- Preserve old synthetic fixtures as v1 examples; do not silently reinterpret
  archived results or add guessed official thresholds.

Primary resources inspected on 2026-10-14:

- [SBA size-standards dataset](https://data.sba.gov/dataset/small-business-size-standards): lists the current workbook and reference periods.
- [SBA size-standard explanation](https://legacy.sba.gov/document/support-table-size-standards): describes receipt/employee measures and related businesses.
- [SOP 50 10 versions](https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs): lists version 8.1 and technical updates effective October 1, 2026.

These sources establish where verified policy/data must come from. They do not
supply an approved lender's complete credit policy. Acceptance requires dated
source fixtures, exact measurement-boundary tests, missing/ambiguous-evidence
failures, and an explicit incomplete-eligibility outcome.

Approval requested: implement the single-operator access boundary above and the
stricter SBA evidence/result contract. No new third-party package, directory
deletion, main merge or other repository work is included.
