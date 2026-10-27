# Analyst workspace

After connecting, the workspace opens on a start screen and evaluates nothing until the analyst chooses **Try the example case** (the synthetic dated Alpine case), **Open saved case** or **Import case file (JSON)**. A tab with an unconfirmed saved write, or a remembered saved selection, skips the start screen and restores that state instead. Explicit legacy mode preserves undated intake and the legacy decision route. The browser formats backend values and manages local drafts; Python performs all financial calculations.

## Access

Enter the configured operator token in **Connect workspace**. The workspace
mounts only after a protected authentication check. The token stays in page
memory and is sent only to the configured API origin; remote URLs require HTTPS.
Reload, disconnect or a 401 requires re-entry. Requests have a 30-second deadline.
**Disconnect workspace** (in **More**) cancels requests and clears visible financial data without deleting
exact pending-write tracking. Reconnecting never submits a write automatically.
The tab-local journal may contain financial inputs and requires an appropriate
browser/host policy. See [security requirements](SECURITY_ARCHITECTURE.md).

## Layout

- **Brand bar:** **Open case** lists saved cases, **Save case** saves an accepted unsaved dated case, and **More** holds **Edit complete draft** (for an accepted commercial case), the dated and legacy example cases, **Import case file (JSON)**, the **Dark theme** toggle and **Disconnect workspace**. More is a disclosure: Escape closes the panel and returns focus to its button, a click outside it closes the panel, and the theme toggle leaves it open.
- **Case header:** the borrower name (the view's only h1), the mode badge (**Dated assessment** or **Legacy · undated input**), the saved state (**Draft — not saved**, **Saved · revision N · latest**, **Saved · revision N · latest unconfirmed**, **Historical revision N (read-only)** or an inactive previous revision) and the source file or saved case.
- **Prototype notice:** a short disclaimer that stays on screen, with the full text one click away.
- **Decision bar:** the illustrative outcome and the server's one-line reason, taken from the matching analysis. While a draft edit recalculates, the bar reads CALCULATING and shows the replaced outcome as **Previous result: … (inactive)**.
- **KPI tiles:** Business DSCR, Global DSCR, FCCR, UCA cash flow, EBITDA and annual debt service for the latest period. Each tile shows its policy line, the server's status and its cushion; cushions, the EBITDA breakeven and the payment capacity arrive with the analysis. Ratios keep enough places to compare honestly with both the approval minimum and the decline floor (1.0004x beside a 1.00x floor). The debt service tile reads **Within capacity** only when the server's principal headroom is zero or more; a negative headroom reads as a principal shortfall.
- **Views** are WAI-ARIA tabs with a roving tab stop: Left and Right arrows move between tabs and select them, Home and End jump to the ends, and only the selected view is rendered. A freshly evaluated dated case opens on **Overview**, its explanation, unless another view is chosen while it evaluates. Legacy cases, edits, saved cases and saves keep the current view.

## Views

- **Spread:** all nine annual inputs across supplied periods, plus reconciled gross profit, OBI, EBITDA, and K-1 ratio. Selecting an earlier period does not change current coverage to historical coverage.
- **Overview:** the decision explanation (headline, the outcome rule applied, its four conditions, each factor's status, summary and cushions, and the illustrative score), debt capacity at the policy approval minimums (binding constraint, maximum principal at the proposed rate and term, headroom or shortfall, and revenue cushions), and gross-receipts and EBITDA trends by period. Chart bars are sized by exact BigInt scaling of server values, used only as drawing geometry; each chart's text alternative lists the formatted values. Legacy decisions have no Overview analysis.
- **Debt & Loan:** annual existing debt, the proposed loan and latest-period working capital. Input amounts are editable with field-specific validation and rationale. Dates, case structure and repayment conventions are changed through complete JSON import.
- **Global Cash Flow:** supplied guarantors' ownership, outside income and personal debt, editable like Debt & Loan, or the business-only fallback when there are none.
- **Stress Tests:** author and review explicit current shocks against a supported saved dated revision, retain a reviewed batch as a separate original comparison, and reopen case-wide comparison summaries. The selected underwriting result remains unchanged.
- **Credit Memo:** a narrative from the accepted response's factors and reasons, unavailable while an input is pending/rejected.
- **History & Audit:** three stacked sections.
  - *History:* unsaved cases show successfully applied session edits with period-aware paths and separately labeled imported overrides. Saved cases show immutable server-recorded revision summaries and the selected original event, including its unit, period/as-of date, guarantor context, rationale, actor and recording time. New saved events display the configured credential identity; archived demonstration actors retain their original unverified label.
  - *Calculation details:* backend definitions, expressions, actual operands and references, raw results, K-1 comparison periods, guarantor contributions, raw policy comparisons and the complete policy snapshot. The content fingerprint does not authenticate documents.
  - *Review package:* summarize a current ready saved original and download its full parsed JSON evidence, optionally including an explicitly selected matching retained comparison. Display original identity, period, units, backend facts and unverified recording metadata; unsupported financial definitions permit original JSON only. [Review exports](REVIEW_EXPORTS.md) specifies eligibility, linkage, representation and limits.

An unsupported stored definition opens on History & Audit; its original JSON is shown in pages of at most 64 KiB of UTF-8 text.

## Analysis

The workspace asks the read-only [analysis service](ANALYSIS_CONTRACT.md) to explain each ready dated assessment: an unsaved draft through `POST /commercial/analysis` under the current policy, a saved revision through `POST /cases/{id}/revisions/{revision}/analysis` under its retained policy. The request runs in the background after the assessment is accepted, one at a time; the last four results are kept for the session, keyed by their source and the assessment fingerprint. A result is shown only when its fingerprint and periods match the assessment on screen. A mismatch or an unknown analysis version is refused with a plain notice, and a server without the routes shows **Analysis unavailable on this server**; the assessment, KPI values and decision stay available. A saved case or comparison write cancels any background analysis before it is sent, and no analysis starts while a write is in flight. Analysis never changes the decision, stored records or recovery tracking.

## Display, theme and value entry

The workspace opens in a light theme. **Dark theme** in the **More** menu switches to the dark colour roles; the choice is a display preference kept in this browser (see [security](SECURITY_ARCHITECTURE.md#browser-credential-and-data-handling)), and a browser that refuses storage keeps the page light. Both themes meet WCAG AA contrast for text, controls and focus indicators. Text is at least 12px, figures use tabular numerals, and read-only amounts keep full contrast. Alternate supplied spread rows carry a faint band and calculated rows sit under a subtotal rule. Browser printing always uses the light roles on white paper, hides workspace controls and keeps the prototype disclaimers. A reduced-motion setting removes the short hover transitions.

Edits accept amounts as analysts type them: an optional `$`, thousands commas grouped in threes, and a negative written as `-1,250,000` or `(1,250,000)`. Unit suffixes such as K or M, exponents, `%` in an amount, spaces inside the number, more than 34 digits, and nonzero magnitudes outside 1e-30 to 1e30 are each rejected with a specific message. Rate and ownership fields take a percentage with an optional `%` sign (`12.5` or `12.5%` becomes 0.125 once); loan terms take whole months. Range messages use display units, for example "Value is outside the allowed range: 0% to 100%." Scenario percentage shocks use the same percentage grammar, including `(10%)`; basis-point shocks take plain signed numbers.

## State contract

| Event | Effect |
|---|---|
| Connect with nothing to restore | Idle start screen. No request until the analyst chooses an example, a saved case or an import. Unreadable recovery tracking stays visible there. |
| Connect with an unconfirmed saved case write | Show its recovery state first: exact retry only, never an automatic send. |
| Connect with a remembered saved selection | Read that original directly; the start screen is skipped. |
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
| Analysis response | Adopt it only if its fingerprint and periods match the current assessment; a superseded or late response is discarded. |
| Saved write starts while analysis is in flight | Cancel the analysis before sending the write; request it again after the receipt or failure. |

Rejections and failures read in plain language: field-mapped server errors name the field and its period or guarantor, without echoing the submitted value. Unreachable, timed-out and unreadable responses say that nothing was recalculated, an incomplete response says it was not used, and a request the workspace could not send (for example a busy embedded host) keeps that reason.

Selection identifiers are allocated before asynchronous file reads. Raw import text goes unchanged to the chosen endpoint, preserving duplicate-key rejection. The byte limit is inclusive at 1,000,000 bytes. Response guards validate the nested display contract and structural references; they do not recompute financial arithmetic or validate document authenticity.

Legacy financial values are explicitly normalized only after backend success; booleans are rejected. V2 inputs, edits, percentage conversions and reporting use decimal strings and BigInt operations. Import presentation preserves original numeric tokens while the unmodified body goes to the backend. Legacy annual periods remain ordinal, dated-only trace/spread results remain unavailable, and no dates or explicit units are inferred.

Unsaved history is local React state and reload clears it. Saved history belongs to the optional [saved-case backend](CASE_STORAGE.md), with original results read from the database. Scenario stress arithmetic runs in Python under the retained policy. The access gate authenticates the configured operator credential; the saved-run JSON exporter uses guarded originals without recalculation or changes to recovery. The workspace has no CSV export or downloadable memo; browser printing uses the print rules above, but there is no dedicated memo print workflow. Decision scores and policy values remain illustrative settings requiring institutional approval.

`App.tsx` is the composition root: it owns the workspace hooks, the selected view and period, the single file input and the dialogs. Views in `frontend/src/views/` receive state derived by `selectWorkspaceView` plus callbacks, and never call the workspace hook themselves; `frontend/src/components/` holds the tabs, disclosure menu and paged JSON viewer. `analysisContracts.ts`, `analysisApi.ts` and `useAnalysis.ts` guard, fetch and cache analyses; `requestPriority.ts` lets writes cancel background reads, and `errorCopy.ts` words failures. Field labels, edit paths and units come from `fieldCatalog.ts`, display formatting from `format.ts`, and exact decimal parsing and formatting from the import-free `decimal.ts`. `ThemeRoot.tsx` applies the theme; `transport.ts` is the only module that touches Web Storage.

## Save, reopen and revise

**Save case** is enabled only for an accepted unsaved dated input when this tab has no unresolved saved operation or conflict. Its dialog requires a nonblank rationale of at most 2,000 Unicode characters before trimming. Saving evaluates that input under the server's current policy and adopts the returned revision 1. Earlier session events are not imported into server history. Legacy cases remain unsaved; no dates or units are invented.

**Open case** (or **Open saved case** on the start screen) lists 25 creation-ordered metadata rows per page, with explicit loading, empty, unavailable, refresh and load-more states. Opening a row reads the latest stored snapshot. A small tab-local locator can reopen the selected case after reload; it contains only the backend identity, case ID and requested revision. The browser never restores a result or ETag from this hint.

The selected view labels its case, revision, run, recording time and assessment as-of date. **Latest when last refreshed** means the latest accepted head at that read; another writer may advance it afterward. Only a supported latest selection is editable. Each numeric edit uses the selected strong ETag, a fresh UUID operation key and the server's command allowlist. Rate/ownership display percentages are converted once to decimal API units. The server derives the event and evaluates the accepted revision; the browser performs no financial arithmetic.

Historical revisions and acknowledged receipts whose latest status cannot be confirmed remain read-only. **Open latest** is explicit. A recovered original receipt can be older than today's head; its result is preserved and labeled historical rather than replaced with the newer run. Opening a revision, reloading it, and checking replay do not recalculate or migrate it. Unsupported retained assessment definitions show read-only original JSON and recording metadata instead of a typed decision.

## Exact-write recovery and conflicts

Before any saved-case or comparison POST, this tab must write and read back one versioned session-storage record containing the serialized command, UUID key and backend identity. Edit records also keep the exact old ETag, base revision and review context. Comparison records keep minimal baseline/context identifiers and the reviewed fingerprint in their exact command, without a cached preview. The command is frozen before transmission. Missing storage, quota errors or a failed readback stop the POST and preserve the accepted input/result. Saved reads, read-only previews and unsaved editing remain usable without recovery storage.

There is at most one unresolved saved write per tab. Network/abort errors, unreadable responses, malformed successful receipts, uncertain key conflicts (409), and storage failures (503) retain the record. Reload restores the proposal for review but never sends a POST automatically. **Retry exact write** uses the same body and key, with the same ETag for case edits and no `If-Match` for comparisons; it never invents a new key. A case-write 409 or uncertain comparison 409 blocks retry and requires reviewing saved records before any explicit discard. Documented pre-commit comparison 409 codes clear only confirmed matching tracking and require a fresh explicit preview. The server's `Retry-After` is shown for a retryable failure; there is no hidden retry loop.

Definite command rejections (400/404/412/413/422/428) clear matching tracking only after storage confirms removal. A 412 retains the proposal separately, reads the latest original snapshot, and compares the field's server context. **Review proposed edit** opens a prefilled dialog against the latest value; only **Save revision** submits a fresh UUID and latest ETag. Canceling sends no write. A rejected saved selection offers an original stored read, never stateless re-evaluation as a saved-case recovery action.

Invalid, oversized, changed-backend, or unsupported recovery envelopes block new saved writes and show an explicit recovery message. **Review discarding tracking** requires a modal action with a keep option; Escape preserves the record. Discarding or closing the tab can lose an exact retry key without undoing a server commit. Recovery data does not authenticate requests. The Bearer boundary authenticates the configured credential; actor labels do not independently verify a human identity. Switching to another selection does not imply that an in-flight write was rolled back.

## Scenario review and original comparisons

Select **Stress Tests** after saving a dated assessment or opening an explicit
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
text renders as text. Source/runtime metadata retains its recorded verification
status. New actors identify the configured credential; archived demonstration
actors retain their original labels. The copy-upgrade workflow is operator-driven;
the browser explains `storage_upgrade_required` without choosing or upgrading
a database.

## Read-only replay and metadata

**Replay this revision (read-only)** compares the selected stored run using its retained calculation definition and policy. Matched, mismatch and unavailable results display separately and cannot overwrite the original assessment, event, run or policy. Replay responses and paginated reads are scoped to the selected resource, so delayed completion cannot cross into a newer selection. Metadata exposes original hash identifiers, storage version, actual runtime packages, and the recorded source status. Local hashes detect consistency problems; they do not authenticate documents, people or offline database edits.

## Verification

Run `./scripts/run_all_checks.sh` from the repository root with backend dependencies active and the frontend dependencies/browser installed. Playwright covers the start screen, tabs and More menu, the dated/legacy workspace and saved-case workflow, analysis pairing, cancellation and fallbacks, scenario authoring, immutable comparison retention/original reads, archive pagination, shared recovery, bounded responses and rendering, delayed responses, unsupported definitions, keyboard focus, mobile layout, field metadata and formatting, plain-language errors, and the theme preference. See [verification coverage](VERIFICATION.md#reproduction-and-regression-coverage). Desktop and 390px screenshots are written under `frontend/test-results`. Each run owns a fresh temporary database and backend process, refuses a running backend on port 8000, and does not use an inherited application database. V2 financial tests include exact transport, reporting allocation and immutable numeric-v1 compatibility; the independent reference gate uses a separate Decimal implementation.
