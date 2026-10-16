# Saved-run JSON review packages

The **Review** workspace summarizes one explicitly selected saved commercial
revision. It can download a deterministic JSON review package, optionally
including one explicitly selected retained comparison whose full baseline
matches that revision. It uses already loaded originals; downloading does not
assess, preview, replay, fetch a newer head, write a record or resolve recovery.

## Use

Save or open a dated commercial case, then choose Review. Identity, recorded
time, financial versions and unverified recording status remain visible. A
supported assessment also shows its operating period, assumptions date,
original outcome, policy and backend metrics. These are current pro forma
coverage, not observed historical coverage. Unsaved/legacy inputs, incomplete
reads/evaluations and failed transitions cannot supply an export, even if old
objects remain in memory.

To include a comparison, open a retained original in Scenarios and return to
Review. Inclusion is unchecked by default. The panel identifies its full batch,
baseline, recording time and fingerprint. Match case/revision/run in the inner
and outer links, baseline input/payload hashes and the full embedded baseline
assessment. A same-case archive original may refer to another revision; open
that explicit baseline through the offered action before inclusion. A live
preview, archive summary or pending command is not a retained original.

Choose **Download JSON review package** to prepare one file. A visible
**Download prepared JSON** link remains available until superseded or the
Review view closes. The browser handles saving; the application does not
confirm filesystem persistence. A source/inclusion change or unmount cancels
preparation and releases existing object URLs. Late worker completions cannot
offer an obsolete file. One active preparation blocks repeated clicks.

Pending recovery may coexist with a current ready original; the panel labels
pending work as excluded. Export leaves the journal, body/key/ETag and exact
retry behavior untouched. It never sends a POST or automatically retries,
discards tracking, upgrades/selects a database or changes the original decision.

## File contract

The wrapper uses `spreadline-review-package-v1`, serialization
`review-package-json-v1`, and scope `saved_case_revision`. Its exact keys are:

| Key | Content |
|---|---|
| `schema_version` | Export wrapper version above |
| `serialization_version` | Export serialization version above |
| `scope` | `saved_case_revision` |
| `case` | `etag` and the full parsed original `snapshot` |
| `comparison` | `null`, or `etag` and one full parsed original `record` |
| `provenance` | `representation: browser_parsed_json`, `actor_status: prototype_unverified`, `integrity_status: recorded_hashes_not_verified_by_export` |
| `disclaimer` | Existing workspace prototype disclaimer |

The originals retain all their fields: normalized inputs/guarantors,
assessment/policy/trace/reasons, event and recording metadata, original hashes,
and every scenario in retained order when included. The case event describes
one revision, not complete revision history. No live export timestamp, random
export ID, current-head status, session history, replay result, backend URL,
browser locator, idempotency key or pending/draft command is added.

Known storage with unsupported financial definitions can export original JSON
without typed conclusions. Unknown storage or malformed supported contracts
fail closed. Review bounds its metadata and does not render the entire original
JSON in the DOM. The existing case-original viewer remains in the other views;
this change does not add a byte/DOM cap to that older viewer or the case-read API.

## Serialization, provenance and limits

The exporter recursively sorts object keys by JavaScript UTF-16 code units,
preserves array order, writes two-space indentation and UTF-8/LF with one final
LF, and uses finite JavaScript JSON numbers without financial rounding.
Special imported keys and text remain data, never executable HTML or object
configuration. Getters, non-plain objects, sparse arrays, cycles, symbols,
hidden/undefined values and non-finite numbers are rejected.

For the same original records and inclusion choice, bytes and filenames are
identical. Names/rationales are not used in filenames:
`spreadline-case-<caseUUID>-r<revision>-<runUUID>.json`, optionally adding
`-comparison-<comparisonUUID>` before `.json`.

This is the browser-parsed representation, not the original server bytes.
Whitespace, key order, numeric spellings and negative zero may differ. Future
numeric definitions may exceed browser-number precision. Recorded hashes are
carried unchanged but are not independently verified, authenticated or hashes
of this new file. The exporter does not implement Python canonicalization or
recompute a fingerprint. This is neither a database backup/import request nor
verified tax-document provenance.

A dedicated worker owns plain-JSON capture, original guards and bounded
serialization. Existing source-depth limits remain case 64/comparison 100;
the export wrapper accounts for its fixed additional nesting. The complete
file, including indentation/wrapper/final LF, is limited to **16,777,216 actual
UTF-8 bytes inclusive**. Encoding stops before accumulating bytes over that
cap; no truncated file is offered. Worker buffers are transferred to the UI to
create a local Blob. No export payload is uploaded or persistently cached.

A valid source may exceed the export cap, especially when combined or pretty
printed. The error preserves the selected original and explicit inclusion. If
desired, uncheck inclusion and request a case-only file explicitly. The
export cap is separate from the existing comparison-read cap; existing case
reads have no new streamed response cap. Worker startup, malformed completion,
decoding and preparation failures produce a visible error and allow an explicit
new attempt. Completion checks the active selection and expected filename.

CSV, downloadable memo, print/PDF output, byte-exact archival, authentication,
real applicant data and deployment are separate work. Verified browser download
behavior is Chromium; wider browser support requires its own evidence. All
financial calculation and policy decisions remain in Python.
