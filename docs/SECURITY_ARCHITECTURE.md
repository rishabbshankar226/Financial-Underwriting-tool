# Security architecture and deployment limits

Reviewed 2026-10-14. This branch is a tested hardening checkpoint. Caller
authentication and verified actor attribution remain open. Keep the application
on loopback with synthetic data pending the
[required contract approval](PRODUCTION_CONTRACT_APPROVAL.md).

## Implemented controls

| Control | Implementation and evidence | Limit |
| --- | --- | --- |
| Request budget | Actual POST/PUT/PATCH bytes capped at 1,000,000 before JSON buffering and database dependencies; chunk/boundary/disconnect tests | Deployment rate limiting remains necessary |
| Structured inputs | Duplicate-key, UTF-8, depth and finite-token checks; extra fields forbidden; boolean money rejected; exact decimal decoding | Does not authenticate financial evidence |
| Numeric bounds | 34 input digits, declared magnitude/rate/term domains, isolated 96-digit contexts with traps | Explicit finite domains |
| Atomic writes | Operation identity, strong ETags, transactions, immutable records and original receipts | Concurrency controls do not identify a caller |
| Archive integrity | Content/command hashes, schema identity, provenance and byte-preserving retained receipts | Hashes are not signatures; host administrators can replace the store |
| File creation | New POSIX stores and backups use 0600; tested under umask 0 | Existing files are not chmodded; encryption remains an operator control |
| SQL input | Bound user values and explicit accepted-field/path allowlists | Host and backup placement still require review |
| Browser recovery | Reviewed command/key/ETag retries; no automatic ambiguous resubmission | Browser storage currently holds synthetic commands |
| Dependencies | Exact pins, pip consistency checks, npm audit and dated OSV response | Advisory lookups are point-in-time evidence |

## Open access boundary

Saved-case and stateless financial routes have no caller guard. Events use a
fixed demonstration actor. CORS restricts browsers, not direct network clients.
Case UUIDs, ETags, operation keys and hashes are not credentials.

The proposed minimum single-operator contract uses environment-loaded Bearer
credentials, constant-time comparison, protection before storage dependencies,
server-derived credential identity and memory-only browser entry. The required
HTTP credential changes need approval. This model does not provide MFA,
multi-user ownership or independently verified human identity.

## Operating controls

A real installation needs reviewed TLS termination, identity/authorization,
protected hosts/stores/backups, encryption and key management, retention,
recovery exercises, monitoring and incident response. The application has no
LLM tool boundary, external OCR service or bureau connection.

The [FTC Safeguards Rule](https://www.ftc.gov/legal-library/browse/rules/safeguards-rule)
is a primary reference for institutions assessing applicability. This document
does not establish compliance or replace the institution's review.
