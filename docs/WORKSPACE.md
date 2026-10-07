# Analyst workspace

The default synthetic Alpine case uses the dated assessment API. Explicit legacy mode preserves undated intake and the legacy decision route. The browser formats backend values and manages local drafts; Python performs all financial calculations.

## Views

- **Spread:** all nine annual inputs across supplied periods, plus dated OBI, EBITDA, and K-1 ratio. Selecting an earlier period does not change current coverage to historical coverage.
- **Assumptions:** annual existing debt, proposed loan, supplied guarantors, and latest-period working capital. Input amounts are editable with field-specific validation and rationale. Dates, case structure, and repayment conventions are changed through complete JSON import.
- **Details:** backend definitions, expressions, actual operands and references, raw results, K-1 comparison periods, guarantor contributions, raw policy comparisons, and the complete policy snapshot. The content fingerprint does not authenticate documents.
- **Memo:** a narrative from the accepted response's factors and reasons, unavailable while an input is pending/rejected.
- **History:** unsaved cases show successfully applied session edits with period-aware paths and separately labeled imported overrides. Saved cases show immutable server-recorded revision summaries and the selected original event, including its unit, period/as-of date, guarantor context, rationale, actor and recording time. All demonstration actors remain unverified.

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

Selection identifiers are allocated before asynchronous file reads. Raw import text goes unchanged to the chosen endpoint, preserving duplicate-key rejection. The byte limit is inclusive at 1,000,000 bytes. Response guards validate the nested display contract and structural references; they do not recompute financial arithmetic or validate document authenticity.

Legacy defaults/coercions needed to display accepted input are normalized only after backend success. Legacy annual periods remain ordinal, dated-only trace/spread results remain unavailable, and no dates or explicit units are inferred.

Unsaved history is local React state and reload clears it. Saved history belongs to the optional [saved-case backend](CASE_STORAGE.md), with original results read from the database. This workspace has no authentication, export, or stress engine. Decision scores and policy values remain illustrative prototype settings.

## Save, reopen and revise

**Save case** is enabled only for an accepted unsaved dated input when this tab has no unresolved saved operation or conflict. Its dialog requires a nonblank rationale of at most 2,000 Unicode characters before trimming. Saving evaluates that input under the server's current policy and adopts the returned revision 1. Earlier session events are not imported into server history. Legacy cases remain unsaved; no dates or units are invented.

**Saved cases** lists 25 creation-ordered metadata rows per page, with explicit loading, empty, unavailable, refresh and load-more states. Opening a row reads the latest stored snapshot. A small tab-local locator can reopen the selected case after reload; it contains only the backend identity, case ID and requested revision. The browser never restores a result or ETag from this hint.

The selected view labels its case, revision, run, recording time and assessment as-of date. **Latest when fetched** means the latest accepted head at that read; another writer may advance it afterward. Only a supported latest selection is editable. Each numeric edit uses the selected strong ETag, a fresh UUID operation key and the server's command allowlist. Rate/ownership display percentages are converted once to decimal API units. The server derives the event and evaluates the accepted revision; the browser performs no financial arithmetic.

Historical revisions and acknowledged receipts whose latest status cannot be confirmed remain read-only. **Open latest** is explicit. A recovered original receipt can be older than today's head; its result is preserved and labeled historical rather than replaced with the newer run. Opening a revision, reloading it, and checking replay do not recalculate or migrate it. Unsupported retained assessment definitions show read-only original JSON and recording metadata instead of a typed decision.

## Exact-write recovery and conflicts

Before any case POST, this tab must write and read back one versioned session-storage record containing the serialized command, UUID key and backend identity. Edit records also keep the exact old ETag, base revision and review context. The command is frozen before transmission. Missing storage, quota errors or a failed readback stop the POST and preserve the accepted input/result. Saved reads and unsaved editing remain usable without recovery storage.

There is at most one unresolved saved write per tab. Network/abort errors, unreadable responses, malformed successful receipts, key conflicts (409), and storage failures (503) retain the record. Reload restores the proposal for review but never sends a POST automatically. **Retry exact write** uses the same body, key and ETag; it never invents a new key. A 409 blocks retry and requires reviewing saved cases before any explicit discard. The server's `Retry-After` is shown for a retryable failure; there is no hidden retry loop.

Definite command rejections (400/404/412/413/422/428) clear matching tracking only after storage confirms removal. A 412 retains the proposal separately, reads the latest original snapshot, and compares the field's server context. **Review proposed edit** opens a prefilled dialog against the latest value; only **Save revision** submits a fresh UUID and latest ETag. Canceling sends no write. A rejected saved selection offers an original stored read, never stateless re-evaluation as a saved-case recovery action.

Invalid, oversized, changed-backend, or unsupported recovery envelopes block new saved writes and show an explicit recovery message. **Review discarding tracking** requires a modal action with a keep option; Escape preserves the record. Discarding or closing the tab can lose an exact retry key without undoing a server commit. Recovery data and actor labels are prototype conveniences, not authentication or evidence of a human identity. Switching to another selection does not imply that an in-flight write was rolled back.

## Read-only replay and metadata

**Check replay** compares the selected stored run using its retained calculation definition and policy. Matched, mismatch and unavailable results display separately and cannot overwrite the original assessment, event, run or policy. Replay responses and paginated reads are scoped to the selected resource, so delayed completion cannot cross into a newer selection. Metadata exposes original hash identifiers, storage version, actual runtime packages, and the recorded source status. Local hashes detect consistency problems; they do not authenticate documents, people or offline database edits.

## Verification

Run `./scripts/run_all_checks.sh` from the repository root with backend dependencies active and the frontend dependencies/browser installed. Playwright covers the existing dated/legacy workspace plus real saved create/edit/reload, original-history reads, two-context conflicts, lost responses, old retry receipts after head advancement, malformed successful responses, incompatible stored definitions, pagination, storage preflight failure, stale reads, text escaping, keyboard focus and mobile layout. Desktop and 390px screenshots are written under `frontend/test-results`. Each run owns a fresh temporary database and backend process, refuses a running backend on port 8000, and does not use an inherited application database. Financial baseline tests and the independent reference gate remain unchanged.
