# Local saved dated cases

The backend can persist accepted dated commercial cases in one explicitly
configured SQLite file. Each accepted numeric edit appends a revision, complete
assessment, and server-derived event. The browser's **Save case**, **Saved cases**,
and revision history controls use this contract. See [workspace behavior](WORKSPACE.md)
for original-result reads, conflict review, and exact-write recovery.

Only `commercial-assessment-v1` input is accepted. Legacy, consumer, and SBA
requests remain stateless. Use synthetic data. The recording actor is the fixed
`prototype-demo-unverified` demonstration identity, not a verified person.

## Enable storage

With the pinned Python 3.12 environment active, from `backend`:

```bash
mkdir -p .spreadline-data/backups
export SPREADLINE_CASE_DB="$PWD/.spreadline-data/cases.sqlite3"
python -m uvicorn app.main:app --reload --port 8000
```

The first configured case operation initializes schema v2 in a new/empty file.
Existing exact schema-v1 stores remain supported without automatic migration.
Module import does not create a database. Missing configuration returns
`503 storage_not_configured` from case routes; stateless assessment remains
available. Keep database files, sidecars and backups in the ignored
`.spreadline-data` directory. Custom locations must also stay outside git.

Runtime recording includes actual Python/SQLite/package versions and the SHA-256
of `constraints-py312.txt`. A deployment may supply a forty-hex-character
`SPREADLINE_BUILD_REVISION`; it is recorded as `build_reported`. Otherwise the
source is `development_unverified`, with no guessed revision. This metadata
does not change the existing financial assessment fingerprint.

## HTTP contract

Canonical paths and their trailing-slash aliases have the same behavior.
Every case POST owns a streaming body read capped at **1,000,000 actual bytes**,
including whitespace; `Content-Length` does not determine acceptance. Duplicate
JSON keys, non-finite numeric tokens, unknown fields, and invalid UTF-8 are
rejected. Rationales are strict strings, trimmed, nonblank, and at most 2,000
characters before trimming.

| Route | Request / response |
|---|---|
| `POST /cases` | `{input: dated_assessment_request, rationale: string}` plus one UUID `Idempotency-Key`. Returns 201 and revision 1. |
| `GET /cases` | `limit` defaults to 25, maximum 100; optional `after` cursor. Newest creation first, case UUID breaks timestamp ties. Summary rows exclude financial blobs. |
| `GET /cases/{case_id}` | Latest immutable snapshot and its strong ETag, read consistently with the head. |
| `GET /cases/{case_id}/revisions` | Bounded newest-first revision summaries; `limit`/`after` as above. Cursor is scoped to this case. |
| `GET /cases/{case_id}/revisions/{number}` | The original selected input, assessment, recording metadata and event, plus its ETag. |
| `POST /cases/{case_id}/revisions` | `{field_path: string, new_value: number, rationale: string}`, one UUID `Idempotency-Key`, and one strong `If-Match`. Returns 201 after atomic acceptance. |
| `POST /cases/{case_id}/revisions/{number}/replay` | Empty body or `{}`; returns `matched`, `mismatch`, or `replay_unavailable`. Does not write a revision or run. |

The accepted snapshot includes case/revision/run IDs, parent revision,
server UTC `recorded_at`, normalized input, complete original assessment,
server-derived event, recording metadata, input hash and payload hash.
The assessment retains its full policy, raw facts/comparisons/reasons, and trace.
The caller's logical `assessment_as_of` remains separate from recording time.

Creation example, from the repository root:

```bash
python - <<'PY' > /tmp/spreadline-create.json
import json
from pathlib import Path
print(json.dumps({"input": json.loads(Path("backend/fixtures/alpine_dated.json").read_text()),
                  "rationale": "Initial synthetic example"}))
PY
curl --fail-with-body -i http://localhost:8000/cases \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: 2aeb5db0-1662-46a4-8b4b-5f87e5ab5b59' \
  --data-binary @/tmp/spreadline-create.json
```

For a new write, generate a new UUID. To retry a lost response, retain that
write's UUID, exact normalized command, rationale, and original `If-Match`.
Keys are global to the database, not just a case or endpoint. Only successful
operations reserve them. Failed requests leave no revision or reserved key.
Reusing a successful key with a changed action/case/value/rationale/ETag returns
409. An identical retry returns the **original 201 body and ETag**, even after
another edit or a default-policy change. `Idempotency-Replayed` is `true` for
that retry and `false` for a new acceptance.

An ETag is one quoted value:
`"case-json-v1:{case_id}:{revision}:{payload_hash}"`. Writes, reads and retry
receipts use the same sorted-key, compact UTF-8 JSON representation. The original
retry receipt identifies its old revision; fetch the latest case separately.
The allowed local development origins can read `ETag`, `Idempotency-Replayed`
and `Retry-After` through CORS. [Saved comparisons](SCENARIO_COMPARISONS.md) also
return and expose their canonical `Location`.

| Condition | Result |
|---|---|
| Missing edit `If-Match` | 428 `precondition_required`. |
| Weak/wildcard/multiple/malformed `If-Match` or repeated header | 400. |
| Stale ETag for a new operation | 412 `stale_revision`; no records added. |
| Changed command under a committed key | 409 `operation_conflict`. |
| Missing/malformed operation UUID, case UUID, cursor or page size | 400. |
| Unknown case/revision | 404. Nonpositive revision numbers return 400; noninteger path parameters return framework 422. |
| Oversized actual body | 413. |
| Invalid JSON, unsupported/unchanged edit, invalid value/rationale, or non-finite calculation | 422. |
| SQLite lock/commit contention after bounded wait | 503 `storage_busy`, `Retry-After: 1`; retry the identical operation. |
| Unconfigured storage, unknown schema, invalid stored content, or I/O failure | 503 with `storage_not_configured`, `storage_schema`, `storage_integrity`, or `storage_error`. |

Storage errors use `{detail: {code, message}}`. Request-validation errors retain
the assessment API's detail format. Errors never return a newly accepted receipt
before its transaction commits.

## Edits and original history

Allowed paths use zero-based indexes resolved against the stored base revision:

| Path prefix | Editable numeric fields |
|---|---|
| `/years/{index}/` | gross_receipts, cogs, operating_expense_excl_dna_interest_comp, officer_compensation, depreciation, amortization, interest_expense, section_179, k1_distribution |
| `/existing_debt/` | cpltd_annual, operating_lease_annual |
| `/proposed_loan/` | amount, annual_rate, term_months |
| `/guarantors/{index}/` | ownership_percentage, wages, interest_dividend_income, mortgage_pi_annual, auto_loan_annual, credit_card_min_annual |
| `/working_capital/` | ar_increase, inventory_increase, ap_increase, cash_taxes_paid |

Values are USD dollars, decimal rate/ownership fractions, and integer term
months. Booleans, strings and non-finite values are rejected. The entire dated
input is validated after an edit; combined ownership and every existing
assessment constraint still apply. The server derives previous/accepted values,
annual or working-capital period dates, as-of date, guarantor identity/index and
unit from the stored base. Dates, names, period/guarantor structure, and repayment
conventions require a new complete dated case. Client history/actor/timestamp/
result/policy fields are forbidden in commands.

Connections enable foreign keys and use explicit SQL transactions with Python
`autocommit=True`. `BEGIN IMMEDIATE` serializes writers; the default lock timeout
is two seconds. The successful-operation lookup precedes the current-head ETag
check. Assessment, revision, run, event, receipt and head update commit once;
any failure, including a busy commit, rolls back. Calculation occurs inside
this short local transaction with no external calls. Connections stay in the
worker thread that owns the operation. The journal is SQLite's default rollback
journal; this is a local-file prototype, not a shared multi-host database.

## Replay and content checks

Reads return the stored result without recalculation. Supported replay dispatches
the retained `commercial-assessment-v1` / `commercial-calculation-v1` /
`assessment-json-v1` definition with **stored policy values**. An unsupported
definition remains readable and returns `replay_unavailable`.

Decision, policy, normalized input, fingerprint and policy trace operands match
exactly, including raw comparisons, threshold/operators, flags, reasons and score.
Other numeric financial/trace values use `rel_tol=1e-12`, `abs_tol=1e-8`.
Structure, periods, units and references match exactly. Differences return paths
without altering or replacing the original run.

Input, payload and command hashes use SHA-256 over a sorted-key compact UTF-8
JSON wrapper `{serialization_version: "case-json-v1", payload: value}` with
finite numbers. The snapshot payload omits its own `payload_hash` for hashing.
This is a versioned local serialization, not universal JSON canonicalization.
Hashes and database immutability triggers detect inconsistency/application
mistakes; they do not authenticate documents, users, or offline database edits.

## Verify, backup and restore

From `backend` with the same environment active:

```bash
python -m tools.case_store verify --source .spreadline-data/cases.sqlite3
python -m tools.case_store backup --source .spreadline-data/cases.sqlite3 \
  --destination .spreadline-data/backups/review.sqlite3
python -m tools.case_store restore --source .spreadline-data/backups/review.sqlite3 \
  --destination .spreadline-data/restored.sqlite3
```

Commands emit JSON counts/schema version and exit nonzero on failure. Sources
must already exist. Backup uses SQLite's connection backup API for a consistent
committed snapshot, then validates schema, integrity, foreign keys, every stored
payload/receipt, revision sequence and command/event links. Restore follows the
same verified-copy contract. A failed target verification removes only the new
destination; source bytes and existing destinations are preserved.

Every destination must be **fresh**. There is no live HTTP restore or overwrite
of an active file. Stop the app, select the verified restored file through
`SPREADLINE_CASE_DB`, restart, and read/replay the original revisions. Idempotency
keys and original receipts survive the restore.

Schema v2 initialization is transactional. Existing schema metadata, actual DDL
and `PRAGMA user_version` must match exactly, including immutability triggers.
Unknown/newer schemas and nonempty version-zero files are refused without
modification. V1 verification retains its original output shape; v2 adds separate
comparison and comparison-operation counts. Opening a valid v1 file preserves
its schema and original receipts. The explicit
[v1-to-v2 copy upgrade](SCENARIO_COMPARISONS.md#schema-compatibility-and-explicit-copy-upgrade)
preserves the source and requires a fresh destination; selecting that upgraded
file for application use is a deliberate operational step.
