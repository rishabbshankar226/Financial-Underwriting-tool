# Security architecture and deployment requirements

Reviewed October 15, 2026. Supported scope: one configured operator credential,
one private SQLite store, and the browser workspace. The approved access
contract is implemented; [verification](VERIFICATION.md) records its tests.

## Access boundary

ASGI authentication runs before request buffering, route parsing, calculations
and storage dependencies. Every application route requires one Bearer header
except minimal `GET /health`. Permitted CORS preflight is public; it does not
invoke protected handlers. CORS is not used as authentication. WebSockets are
refused.

`SPREADLINE_API_TOKEN` must be a cryptographically random ASCII bearer secret
of 32–4,096 characters. `SPREADLINE_OPERATOR_ID` is a non-secret ASCII identifier
of 1–128 characters. The demonstration ID and secret-as-ID are forbidden.
Invalid configuration fails closed with 503 naming the variable; missing,
malformed, wrong or repeated credentials return 401 with a Bearer challenge.
Comparison uses `hmac.compare_digest`. Application errors do not echo secrets.
Protected responses use `no-store` and `nosniff`.

New case/comparison events record the authenticated credential's configured
operator ID. Commands cannot supply identity or database placement. Original
archives, hashes and committed retry receipts retain their original identity
and bytes after credential rotation. Shared credentials do not independently
identify a person. Direct Python store use and the storage CLI rely on host
permissions; their compatibility defaults cannot bypass the HTTP guard.

## Browser credential and data handling

The workspace mounts only after explicit credential verification. The token
stays in module memory, never a URL, persistent browser storage, pending-write
journal or built asset. Requests attach it only to the configured API origin,
refuse caller authorization overrides and redirects, omit cookies and referrers,
disable response caching, and have a 30-second deadline. Remote origins require
HTTPS; loopback HTTP is supported for local operation.

Reload, disconnect or 401 requires re-entry. Disconnect aborts active requests
and unmounts financial views; obsolete responses cannot restore a session or
result. An interrupted write may already have committed. Its exact command,
UUID and ETag remain in tab-local session storage for explicit review/retry;
credential entry never submits it automatically. That journal can contain
financial data. Disconnect does not erase it, and shared-browser use requires
an appropriate host/browser-session policy. A compromised same-origin script,
browser extension or host can read page memory and data; authentication does
not defend against a compromised client or host.

## Implemented controls

| Control | Implementation | Scope |
| --- | --- | --- |
| Request budget | Actual POST/PUT/PATCH bytes capped at 1,000,000 before buffering; early stop/disconnect tests | Reverse-proxy rate/concurrency limits remain deployment controls |
| Structured input | Duplicate-key, UTF-8, depth and finite-token checks; extra fields forbidden; boolean money rejected | Supplied financial evidence is not authenticated |
| Numeric domains | 34 input digits; isolated 96-digit contexts/traps; finite rates/terms/results | Explicit supported mathematical domains |
| Atomic writes | Operation identity, strong ETags, transactions, immutable records and original receipts | Single-host local store |
| Archive integrity | Content/command hashes, schema identity and byte-preserving receipts | Consistency checks, not signatures against a hostile administrator |
| File creation | New POSIX stores/backups use 0600, including under umask 0 | Existing files retain permissions; disk encryption is external |
| SQL input | Bound values and explicit editable-field/path allowlists | Store/backup placement remains operator-controlled |
| SBA source | Exact pinned workbook hash and dated provenance; ambiguous rows refused | Limited screens; no complete eligibility attestation |
| Dependencies | Exact pins, pip consistency, npm audit and dated OSV evidence | Advisory results are point-in-time |

## Deployment controls

Serve through reviewed TLS termination and trusted network boundaries. Review
the existing CORS origin allowlist for the deployment; credentials are never
part of an origin or URL. Configure request/rate limits, protect logs from
header/body capture, rotate tokens through the deployment environment, and
use the non-secret operator ID for new accepted events. Restrict host, store,
backup and CLI access; review existing file permissions, encryption/key
management, retention, recovery, monitoring and incident response.

The application provides no multi-user tenant separation, MFA, external OCR
service, bureau connection or LLM tool boundary. Credit-policy approval,
independent validation and applicable institutional privacy/security obligations
remain the institution's responsibility. The
[FTC Safeguards Rule](https://www.ftc.gov/legal-library/browse/rules/safeguards-rule)
is a primary reference for applicability review; this document is not a
compliance certification.
