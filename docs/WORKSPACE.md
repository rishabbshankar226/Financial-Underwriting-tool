# Analyst workspace

The default synthetic Alpine case uses the dated assessment API. Explicit legacy mode preserves undated intake and the legacy decision route. The browser formats backend values and manages local drafts; Python performs all financial calculations.

## Views

- **Spread:** all nine annual inputs across supplied periods, plus dated OBI, EBITDA, and K-1 ratio. Selecting an earlier period does not change current coverage to historical coverage.
- **Assumptions:** annual existing debt, proposed loan, supplied guarantors, and latest-period working capital. Input amounts are editable with field-specific validation and rationale. Dates, case structure, and repayment conventions are changed through complete JSON import.
- **Details:** backend definitions, expressions, actual operands and references, raw results, K-1 comparison periods, guarantor contributions, raw policy comparisons, and the complete policy snapshot. The content fingerprint does not authenticate documents.
- **Memo:** a narrative from the accepted response's factors and reasons, unavailable while an input is pending/rejected.
- **History:** unsaved cases show successfully applied session edits with period-aware paths and separately labeled imported overrides. Saved cases show immutable server-recorded revision summaries and the selected original event, including its unit, period/as-of date, guarantor context, rationale, actor and recording time. All demonstration actors remain unverified.
- **Scenarios:** author and review explicit current shocks against a supported saved dated revision, retain a reviewed batch as a separate original comparison, and reopen case-wide comparison summaries. The selected underwriting result remains unchanged.
- **Review:** summarize a current ready saved original and download its full parsed JSON evidence, optionally including an explicitly selected matching retained comparison. Display original identity, period, units, backend facts and unverified recording metadata; unsupported financial definitions permit original JSON only. [Review exports](REVIEW_EXPORTS.md) specifies eligibility, linkage, representation and limits.

## State contract

| Event | Effect |
|---|---|
| Open, cancel, invalid, or unchanged edit | Accepted input/result and applied history remain unchanged. |
| Valid edit or selected import/demo | Clear active results and show evaluating. Keep the prior accepted case explicitly labeled as previous. |
| Successful current response | Adopt input/result together; use server-normalized input for dated mode. Apply one edit event or reset history for case replacement. |
| Stateless rejection, invalid response, or network error | No active result or applied edit. Retry the same submitted draft. |
| Malformed, oversized, or unsupported-version import | No active result; offer explicit re-evaluation of the previous accepted case. |
| Older file read/response | Ignore; cancellation and selection identifiers prevent stale installation. |
| Open a saved case/revision | Clear active results while reading. Adopt the original normalized input and assessment together; do not call the stateless assessment route. |
| Accepted saved write | Verify the receipt and install its original input/result/event. Read the head separately to confirm whether it is still latest. |
| Uncertain saved write | Retain the exact operation for explicit retry; do not accept the proposal locally or invent an event. |
| Stale saved edit (412) | Preserve the proposal for review against a freshly read latest field. A fresh write needs explicit review and submission. |
| Older saved read or receipt | An older read cannot replace a newer selection. A late write receipt resolves its tracking and offers a separate link to the acknowledged revision. |
| Scenario draft edit, add/remove or baseline change | Invalidate the live preview even if the draft returns to equal values; cancel and ignore obsolete responses. |
| Reviewed comparison save | Reserve the shared write journal and consume the current preview. Verify and display the original comparison separately from the case assessment. |
| Original comparison open/reload | Read the original record by verified case/comparison IDs; do not recalculate or change the active case revision. |

Selection identifiers are allocated before asynchronous file reads. Raw import text goes unchanged to the chosen endpoint, preserving duplicate-key rejection. The byte limit is inclusive at 1,000,000 bytes. Response guards validate the nested display contract and structural references; they do not recompute financial arithmetic or validate document authenticity.

Legacy defaults/coercions needed to display accepted input are normalized only after backend success. Legacy annual periods remain ordinal, dated-only trace/spread results remain unavailable, and no dates or explicit units are inferred.

Unsaved history is local React state and reload clears it. Saved history belongs to the optional [saved-case backend](CASE_STORAGE.md), with original results read from the database. Scenario stress arithmetic runs in Python under the retained policy. The saved-run JSON exporter uses guarded originals without recalculation or changes to recovery. This workspace has no authentication, CSV export, downloadable memo or print/PDF workflow. Decision scores and policy values remain illustrative prototype settings.

## Save, reopen and revise

**Save case** is enabled only for an accepted unsaved dated input when this tab has no unresolved saved operation or conflict. Its dialog requires a nonblank rationale of at most 2,000 Unicode characters before trimming. Saving evaluates that input under the server's current policy and adopts the returned revision 1. Earlier session events are not imported into server history. Legacy cases remain unsaved; no dates or units are invented.

**Saved cases** lists 25 creation-ordered metadata rows per page, with explicit loading, empty, unavailable, refresh and load-more states. Opening a row reads the latest stored snapshot. A small tab-local locator can reopen the selected case after reload; it contains only the backend identity, case ID and requested revision. The browser never restores a result or ETag from this hint.

The selected view labels its case, revision, run, recording time and assessment as-of date. **Latest when fetched** means the latest accepted head at that read; another writer may advance it afterward. Only a supported latest selection is editable. Each numeric edit uses the selected strong ETag, a fresh UUID operation key and the server's command allowlist. Rate/ownership display percentages are converted once to decimal API units. The server derives the event and evaluates the accepted revision; the browser performs no financial arithmetic.

Historical revisions and acknowledged receipts whose latest status cannot be confirmed remain read-only. **Open latest** is explicit. A recovered original receipt can be older than today's head; its result is preserved and labeled historical rather than replaced with the newer run. Opening a revision, reloading it, and checking replay do not recalculate or migrate it. Unsupported retained assessment definitions show read-only original JSON and recording metadata instead of a typed decision.

## Exact-write recovery and conflicts

Before any saved-case or comparison POST, this tab must write and read back one versioned session-storage record containing the serialized command, UUID key and backend identity. Edit records also keep the exact old ETag, base revision and review context. Comparison records keep minimal baseline/context identifiers and the reviewed fingerprint in their exact command, without a cached preview. The command is frozen before transmission. Missing storage, quota errors or a failed readback stop the POST and preserve the accepted input/result. Saved reads, read-only previews and unsaved editing remain usable without recovery storage.

There is at most one unresolved saved write per tab. Network/abort errors, unreadable responses, malformed successful receipts, uncertain key conflicts (409), and storage failures (503) retain the record. Reload restores the proposal for review but never sends a POST automatically. **Retry exact write** uses the same body and key, with the same ETag for case edits and no `If-Match` for comparisons; it never invents a new key. A case-write 409 or uncertain comparison 409 blocks retry and requires reviewing saved records before any explicit discard. Documented pre-commit comparison 409 codes clear only confirmed matching tracking and require a fresh explicit preview. The server's `Retry-After` is shown for a retryable failure; there is no hidden retry loop.

Definite command rejections (400/404/412/413/422/428) clear matching tracking only after storage confirms removal. A 412 retains the proposal separately, reads the latest original snapshot, and compares the field's server context. **Review proposed edit** opens a prefilled dialog against the latest value; only **Save revision** submits a fresh UUID and latest ETag. Canceling sends no write. A rejected saved selection offers an original stored read, never stateless re-evaluation as a saved-case recovery action.

Invalid, oversized, changed-backend, or unsupported recovery envelopes block new saved writes and show an explicit recovery message. **Review discarding tracking** requires a modal action with a keep option; Escape preserves the record. Discarding or closing the tab can lose an exact retry key without undoing a server commit. Recovery data and actor labels are prototype conveniences, not authentication or evidence of a human identity. Switching to another selection does not imply that an in-flight write was rolled back.

## Scenario review and original comparisons

Select **Scenarios** after saving a dated assessment or opening an explicit
original revision. Historical revisions are valid baselines; the current head
and spread-column selection do not replace them. The composer identifies the
case, revision, run, payload hash, latest operating period, assumption date and
retained policy. Unsaved dated input requires **Save baseline case** first;
legacy input cannot be saved or assigned invented dates. An unsupported saved
baseline exposes summaries and original JSON, with new preview unavailable.

Author 1–10 scenarios with generated unique keys and all four explicit shocks,
including zero. Name and required rationale limits are 120 and 2,000 Unicode
code points after Python-compatible whitespace trimming. Percentage controls
convert −10 to −0.1 once; proposed-rate controls pass fractional basis points
unchanged. Empty, malformed, nonfinite or below −100% percentages are rejected
before preview. The backend remains responsible for projected financial
inputs, feasible resulting rates and arithmetic overflow. Five presets fill
name and shocks only: revenue −10%, COGS +10%, operating expense +10%, combined
downside and proposed rate +200 basis points.

**Preview scenarios** sends the ordered normalized command to the selected
baseline. Any draft edit, including text, row addition/removal or changes back
to equal values, requires a fresh preview. Obsolete responses cannot install.
The read-only review displays server baseline/projected values, raw deltas,
policy headroom, operators and decline floors, factor/outcome/reason changes,
projected inputs and trace links. Observed K-1 history stays fixed. No projected
result becomes the case decision, historical spread or memo.

**Save reviewed comparison** consumes the current preview and verifies one
immutable batch receipt. The saved original displays separately. Opening an
archive record ends the active preview review; **Start another comparison**
begins a fresh draft before another save. Opening the original baseline
revision is always explicit. A late recovered receipt resolves tracking and
offers its original separately if a newer case or draft is selected.

The archive reads 25 summary rows per page across all baselines of the current
case, with explicit refresh/load-more/error/empty states and scoped cursor
checks. Detail GETs never call preview or assessment. Reload uses only an
optional backend/case/comparison locator, then reads the original afresh.
Known storage with unsupported financial definitions remains read-only JSON;
unknown storage or malformed known responses are rejected.

Browser comparison requests retain the 1,000,000-byte command limit. Each
comparison response is bounded by 16,777,216 actual streamed bytes and finite
JSON depth 100; existing case guards retain depth 64. The browser limit does
not cap the backend preview response contract. Only the selected scenario's
detail is rendered, trace/guarantor rows are created on opening and paged in
groups of 50, and original JSON text pages are at most 64 KiB UTF-8. All returned
text renders as text. Source/runtime recording metadata and actor identity
remain explicitly unverified. The copy-upgrade workflow is operator-driven;
the browser explains `storage_upgrade_required` without choosing or upgrading
a database.

## Read-only replay and metadata

**Check replay** compares the selected stored run using its retained calculation definition and policy. Matched, mismatch and unavailable results display separately and cannot overwrite the original assessment, event, run or policy. Replay responses and paginated reads are scoped to the selected resource, so delayed completion cannot cross into a newer selection. Metadata exposes original hash identifiers, storage version, actual runtime packages, and the recorded source status. Local hashes detect consistency problems; they do not authenticate documents, people or offline database edits.

## Verification

Run `./scripts/run_all_checks.sh` from the repository root with backend dependencies active and the frontend dependencies/browser installed. Playwright covers the existing dated/legacy workspace and saved-case workflow, plus scenario authoring, immutable comparison retention/original reads, archive pagination, shared recovery, bounded responses and rendering, delayed responses, unsupported definitions, keyboard focus and mobile layout. See [verification coverage](VERIFICATION.md#browser-scenario-and-shared-recovery-coverage). Desktop and 390px screenshots are written under `frontend/test-results`. Each run owns a fresh temporary database and backend process, refuses a running backend on port 8000, and does not use an inherited application database. Financial baseline tests and the independent reference gate remain unchanged.
