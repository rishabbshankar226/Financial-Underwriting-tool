# Saved commercial comparisons

Retain an entire reviewed [stress preview](STRESS_PREVIEWS.md) as one immutable
comparison. It stays linked to the selected original case/revision/run and its
retained policy. Read it again after restart or later case edits through HTTP
or the browser's **Scenarios** view. The browser lists original comparison
summaries across all revisions of the selected case and opens the selected
original record without recalculation. See [the scenario workflow](WORKSPACE.md#scenario-review-and-original-comparisons).

Use synthetic data. The actor is `prototype-demo-unverified`, matching the local
case prototype. Retention uses the existing calculation definitions and does
not change their [financial limits](MODEL_DOCUMENTATION.md).

## Preview, then retain

In the browser, author 1–10 ordered scenarios with unique generated keys,
trimmed names, required rationales and all four explicit shocks. Presets fill
the name and shocks, leaving the rationale to the analyst. Preview first,
review the selected scenario's server results, and choose **Save reviewed
comparison**. That action consumes the reviewed preview and reserves the
shared write slot before POST. An intentional new batch requires a fresh
draft and explicit preview. Historical baselines do not need the case head's
ETag and never change the original case revision.

The existing `spreadline.pending-write.v1` tab-local journal retains old
`case-write-v1` creation/edit records without changing their body, UUID or
ETag. Comparison records use `scenario-comparison-write-v1`, with the exact
command, UUID, backend and minimal baseline/context identifiers. No full
preview is stored there. Any unresolved operation, invalid tracking,
confirmed-clear failure or saved-edit conflict blocks all new saved writes.
Original reads and read-only previews remain available.

Reload never submits a write. **Retry exact write** sends the original body,
UUID and canonical path; comparison retry sends no `If-Match` and does not
need a live preview. A verified original receipt can contain an unsupported
financial definition: its known storage envelope and original JSON remain
readable without a typed projected outcome. Invalid success receipts,
network/abort errors, 503 errors and unknown/malformed rejections keep the
original operation. `operation_conflict` requires review and explicit discard
instead of retry. Known pre-commit comparison 409 codes clear only the matching
journal after confirmed removal: `preview_changed`, `storage_upgrade_required`,
`baseline_run_mismatch`, `baseline_unsupported`, `baseline_replay_mismatch` and
`baseline_replay_unavailable`. A new save then requires fresh explicit review.

The browser verifies HTTP 201, the strong comparison ETag, the exact relative
Location, the replay header, baseline links, normalized ordered command and
reviewed fingerprint. It constructs original read paths from verified IDs
and never follows arbitrary Location URLs. A late acknowledgment resolves
tracking independently and offers an explicit link while preserving the
current assessment selection. Closing the writer preserves uncertain tracking.

Original detail rendering shows only the selected scenario, creates trace
and guarantor pages of at most 50 rows when opened, and pages original JSON
into at most 64 KiB of UTF-8 text. Comparison list reads request 25 summaries
per page with scoped cursors and cancellation. The optional comparison hint
stores only backend/case/comparison IDs; reload always performs a fresh GET.
No result or ETag is restored from it. Source status and prototype actors
remain explicitly unverified.

Read the selected saved revision and POST the final scenario command to its
preview endpoint. Copy the preview's `fingerprint.value` into the retention
command's `expected_preview_fingerprint`:

```json
{
  "schema_version": "commercial-scenario-comparison-create-v1",
  "baseline_run_id": "<selected original run UUID>",
  "expected_preview_fingerprint": "<64 lowercase hexadecimal characters>",
  "scenarios": [
    {
      "scenario_key": "revenue-down-10",
      "name": "Revenue down 10%",
      "rationale": "Other assumptions held fixed",
      "assumptions": {
        "revenue_change": -0.1,
        "cogs_change": 0,
        "operating_expense_change": 0,
        "proposed_rate_change_bps": 0
      }
    }
  ]
}
```

The placeholders must be replaced with actual values. POST this command to
`/cases/{case_id}/revisions/{revision}/scenario-comparisons` with one UUID
`Idempotency-Key`. No `If-Match` is needed: the baseline is an explicit immutable
revision and may be historical. The server regenerates the preview under the
baseline's recorded policy and verifies the expected fingerprint. Changing
assumptions, names or rationales requires previewing that final command again.

All [preview command limits](STRESS_PREVIEWS.md#request) apply, including all four
required finite shocks, 1–10 distinct keys and trimmed text. Unknown fields,
duplicate JSON keys, malformed UTF-8 and non-finite tokens reject the request.
The stream is limited to **1,000,000 actual bytes**, regardless of
`Content-Length`. Clients cannot submit results, policy, actor, recording
metadata, comparison IDs or timestamps.

## HTTP responses and retries

Canonical paths and trailing-slash aliases behave identically.

| Route | Result |
|---|---|
| `POST /cases/{case_id}/revisions/{revision}/scenario-comparisons` | 201 after commit; original comparison body, strong `ETag`, canonical `Location` and `Idempotency-Replayed: false` |
| `GET /cases/{case_id}/scenario-comparisons/{comparison_id}` | 200 with the original body and ETag; no financial recalculation |
| `GET /cases/{case_id}/scenario-comparisons` | 200 with bounded summary items and `next_cursor`; `limit` defaults to 25 and is at most 100 |

Retain the exact command and operation UUID until the response is known. An
identical committed retry returns the original **201 bytes, ETag and Location**
with `Idempotency-Replayed: true`. It skips new baseline replay/calculation,
including after newer case edits, policy changes or unsupported current
financial definitions. It still validates the original stored receipt/content.
A different successful key intentionally creates another comparison.

Operation UUIDs are global across case creation, edits and comparison retention.
Reusing a successful key with a changed action, case, revision, run, fingerprint
or scenario command returns 409. Failed transactions reserve no key. Allowed
local origins can read `ETag`, `Location`, `Idempotency-Replayed` and `Retry-After`.

Listing order is `(recorded_at DESC, comparison_id DESC)`. Summaries include
baseline identity, scenario count/keys/names, policy version, fingerprint and
stored version labels. They exclude full financial/trace blobs; SQLite extracts
the summary fields before returning them to Python. Pass `next_cursor` as
`after` for the next page. Cursors are versioned, case-scoped and limited to 512
characters. Newer insertions do not shift older pages, but multiple page requests
do not share one database snapshot. Original reads and the verify command check
full record hashes/links; listing checks the bounded summary envelope and receipt.

## Retained evidence and integrity

The outer record uses `commercial-scenario-comparison-v1`,
`scenario-comparison-json-v1` and `persisted: true`, with a server-generated
comparison UUID, UTC recording time, baseline identity, actor, actual recording
metadata, full `preview` and payload hash. The nested preview preserves its
original `persisted: false` value and fingerprint: it describes the calculation
that was reviewed. One batch has one comparison and one operation receipt.
Retention leaves the case head and original run/event/receipt counts unchanged.

The canonical record JSON is also the original receipt body. Hashing uses
compact sorted-key finite UTF-8 JSON with the wrapper
`{serialization_version: "scenario-comparison-json-v1", payload: ...}`. The
payload hash excludes its own field. The strong ETag is
`"scenario-comparison-json-v1:{case_id}:{comparison_id}:{payload_hash}"`.

The complete record, including its payload hash, is capped at **16,777,216 UTF-8
bytes (16 MiB)**. This storage limit is separate from the request limit and does
not change what the preview endpoint can calculate. Both application validation
and SQL enforce it. An oversized record rejects the entire write.

Original reads and verification support the known storage envelope with
unsupported retained calculation/scenario definitions. They verify canonical
JSON, UUIDs/timestamps, payload and command hashes, ETags, baseline/policy links,
scenario commands and the existing fingerprint's content hash. They do not redo
financial arithmetic. Missing receipts, unknown storage serialization and
inconsistent content fail without repair. Hashes and immutability guards detect
inconsistency; they do not authenticate offline edits or people.

## Schema compatibility and explicit copy upgrade

New stores initialized through the case interface use schema v2. Exact v1 stores
continue to support case reads/writes/retries/replay, previews and backup/restore.
Opening them never upgrades them. V1 comparison lists are empty; missing
comparison reads return 404, and new retention returns
`409 storage_upgrade_required`.

Schema v2 preserves v1 case DDL/history and adds two STRICT comparison tables,
a listing index, immutability guards and reciprocal global-operation-key
guards. Case serialization remains `case-json-v1`. Schema version, exact DDL and
metadata identity must agree. The older v1 application refuses v2.

From `backend`, with the pinned Python 3.12 environment active:

```bash
python -m tools.case_store verify --source /absolute/path/source-v1.sqlite3
python -m tools.case_store upgrade --source /absolute/path/source-v1.sqlite3 \
  --destination /absolute/path/fresh-v2.sqlite3
python -m tools.case_store verify --source /absolute/path/fresh-v2.sqlite3
```

Upgrade accepts an exact valid v1 source and exclusively creates a fresh
destination with mode 0600. It uses SQLite backup for a committed snapshot,
verifies the copy, then adds v2 DDL and changes only its schema identity/version
in one transaction. The schema-metadata update guard is removed and restored
only inside that transaction on the copy; all history/delete guards stay active.
Original case rows and receipt bytes must remain equal before commit. Independent
post-commit verification precedes success output.

A failed copy/migration/verification removes only the newly created destination.
Existing files, directories and leaf symlinks are refused. Unknown/corrupt
sources are refused. A v2 source returns `upgrade_not_applicable`; use ordinary
backup for a v2 copy. Copy upgrade has a 30-second overall backup deadline checked
on every progress callback, including successful restarts, and the existing
two-second lock timeout. Repeated commands never overwrite their destination.

For a deliberate application cutover, stop every writer first, verify/back up
the source, create and verify a fresh upgraded file, back it up, then select it
through `SPREADLINE_CASE_DB` and restart. The command does not stop other writers
or automatically replace the active file. Source writes after copying do not
move into the selected target. Preserve the v1 source for recovery before new v2
writes. After new v2 writes, returning to that earlier source would omit them;
retain the v2 data/backup and review recovery. There is no automatic downgrade.

## Errors and verification

| Status | Meaning |
|---|---|
| 400 | Malformed locator/operation UUID, repeated header, invalid cursor/page size |
| 404 | Missing selected case/revision/comparison or a comparison under the wrong case |
| 409 | Baseline support/replay/run guard, `preview_changed`, `operation_conflict`, `storage_upgrade_required` |
| 413 | Actual request stream exceeds 1,000,000 bytes |
| 422 | Strict command or calculation failure, or `comparison_payload_limit` |
| 503 | Unconfigured/missing/busy storage, schema mismatch or failed content verification |

Storage errors retain `{detail: {code, message}}`; busy writes include
`Retry-After: 1`. Comparison routes require an existing store and never initialize
one. No accepted response is returned before commit.

[Verify, backup and restore](CASE_STORAGE.md#verify-backup-and-restore) support
both schemas and preserve both kinds of successful operation UUIDs/receipts.
V1 verification output retains its original counts. V2 adds comparison and
comparison-operation counts, which must agree separately from the unchanged
revision/run/event/case-operation equality. See [verification](VERIFICATION.md)
for the repository checks.
