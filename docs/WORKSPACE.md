# Analyst workspace

The default synthetic Alpine case uses the dated assessment API. Explicit legacy mode preserves undated intake and the legacy decision route. The browser formats backend values and manages local drafts; Python performs all financial calculations.

## Views

- **Spread:** all nine annual inputs across supplied periods, plus dated OBI, EBITDA, and K-1 ratio. Selecting an earlier period does not change current coverage to historical coverage.
- **Assumptions:** annual existing debt, proposed loan, supplied guarantors, and latest-period working capital. Input amounts are editable with field-specific validation and rationale. Dates, case structure, and repayment conventions are changed through complete JSON import.
- **Details:** backend definitions, expressions, actual operands and references, raw results, K-1 comparison periods, guarantor contributions, raw policy comparisons, and the complete policy snapshot. The content fingerprint does not authenticate documents.
- **Memo:** a narrative from the accepted response's factors and reasons, unavailable while an input is pending/rejected.
- **History:** successfully applied session edits with period-aware paths. Demonstration actors and client timestamps are unverified. Imported overrides are shown separately as unverified supplied history.

## State contract

| Event | Effect |
|---|---|
| Open, cancel, invalid, or unchanged edit | Accepted input/result and applied history remain unchanged. |
| Valid edit or selected import/demo | Clear active results and show evaluating. Keep the prior accepted case explicitly labeled as previous. |
| Successful current response | Adopt input/result together; use server-normalized input for dated mode. Apply one edit event or reset history for case replacement. |
| Rejection, invalid response, or network error | No active result or applied edit. Retry the same submitted draft. |
| Malformed, oversized, or unsupported-version import | No active result; offer explicit re-evaluation of the previous accepted case. |
| Older file read/response | Ignore; cancellation and selection identifiers prevent stale installation. |

Selection identifiers are allocated before asynchronous file reads. Raw import text goes unchanged to the chosen endpoint, preserving duplicate-key rejection. The byte limit is inclusive at 1,000,000 bytes. Response guards validate the nested display contract and structural references; they do not recompute financial arithmetic or validate document authenticity.

Legacy defaults/coercions needed to display accepted input are normalized only after backend success. Legacy annual periods remain ordinal, dated-only trace/spread results remain unavailable, and no dates or explicit units are inferred.

History is local React state. Reload clears it. The browser does not yet call the optional [saved-case backend](CASE_STORAGE.md); save/open and durable-history controls are a later interface stage. This workspace has no authentication, export, or stress engine. Decision scores and policy values remain illustrative prototype settings.

## Verification

Run `./scripts/run_all_checks.sh` from the repository root with backend dependencies active and the frontend dependencies/browser installed. Playwright covers the real dated and legacy interfaces, transactional edits/retry, import errors and limits, stale selection completion, response guards, and keyboard dialog behavior. Desktop and 390px screenshots are written under `frontend/test-results` by the layout scenario. Financial baseline tests and the independent reference gate remain unchanged.
