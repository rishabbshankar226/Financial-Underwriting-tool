# Excel-first commercial intake

The update will make a versioned `.xlsx` template the primary commercial import. The existing JSON path stays available. Uploading opens a local review; only the analyst's explicit evaluation sends the existing dated assessment request. Saving remains a separate existing action.

## Contract and rollout

The first release supports the commercial-assessment-v2 contract already available through the Streamlit bridge. It supports one to ten complete fiscal years and optional guarantors. Consumer and SBA forms remain available through their current interfaces. General-purpose workbooks with arbitrary layouts will need a later mapping feature.

| Worksheet       | Inputs                                                                        | Existing request fields                          |
| --------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| Borrower        | Borrower name, geography, assessment date                                     | borrower_name, geography, assessment_as_of       |
| Financials      | One column per fiscal year, oldest first                                      | years[] with dates and all nine financial fields |
| Debt and loan   | Loan amount, annual nominal rate, integer months, annual principal and leases | proposed_loan and existing_debt                  |
| Guarantors      | One column per guarantor, all annual amounts                                  | guarantors[]                                     |
| Working capital | Latest-period dates, receivables, inventory, payables and cash taxes          | working_capital                                  |

The Borrower sheet records template version 1 in B4. Every input table has its header in row 7. Field labels identify inputs; no data is inferred from a user's formatting. Entirely blank trailing year/guarantor columns are ignored. A partly populated column produces cell-specific errors. No blank financial input becomes zero. USD dollars and annual nominal rates are explicit. Loan metadata remains fixed, fully amortizing and monthly, matching the existing supported dated interface.

Two downloadable workbooks will use the same contract: a blank intake and a filled Alpine example. Financial and rate inputs use Excel text cells to preserve all entered decimal digits. Dates are real Excel dates displayed as yyyy-mm-dd. Geography stays text to preserve leading zeros. The filled example must round-trip to the existing Alpine fixture, including integer months and decimal strings.

## Parsing and precision

Use pinned read-excel-file 9.3.12 with `parseNumber: value => value`, not its default JavaScript number conversion. Use pinned fflate 0.8.3 directly for archive preflight; this is already the reader's current compression dependency. Review its lockfile and audit before enabling the feature. Do not vendor a spreadsheet parser or depend on a CDN at runtime.

Parse inside a dedicated inline Web Worker that can be terminated on cancellation, a newer selection, disconnect, unmount or a five-second deadline. Keep workbook bytes, raw values, source cells and drafts only in page memory. The workbook is never uploaded to an external conversion service.

Before the general reader runs, inspect the ZIP directory and bounded XML parts. Enforce limits for compressed bytes, actual expanded bytes, entries, worksheets, cell count, text length and dimensions. Initial limits: 2 MB compressed, 8 MB expanded, 128 entries, exactly the five template sheets, 5,000 cells and 2,000 characters per input. Reject encrypted, ZIP64, macro-enabled, legacy binary, duplicate-path, invalid-path and malformed archives with actionable messages. Reject external workbook links and formulas, including formulas with cached values. Import values only; never evaluate Excel formulas or trust their cache. Validate bounds against actual decompressed output, not only the directory's declared sizes.

Preserve numeric cell XML tokens as strings. Apply the existing exact decimal domain: at most 34 significant digits, zero or magnitude 1e-30 through 1e30. Only declared integer fields cross into JavaScript safe integers. Normalize percentage input by an exact decimal-place shift. Preserve explicit zero, negative allowed values, postal-code leading zeros, calendar dates and fiscal periods. Support native Excel dates from both 1900 and 1904 date systems; reject ambiguous text dates and Excel's fictitious 1900-02-29. Surface errors by worksheet/cell and map accepted fields to their existing JSON pointers.

The importer reads what is stored in the workbook. It cannot reconstruct digits already lost by Excel's numeric-cell precision. The template therefore stores financial inputs as text and gives plain instructions to keep that format for high-precision values.

## User flow and state

1. Download a blank template or the filled synthetic example.
2. Select a workbook. Keep the current accepted case and pending-write journal intact while parsing.
3. Show borrower, fiscal periods, all mapped inputs, units and source cells. Show every structural/field error with a link that focuses the relevant review control.
4. Allow correction in review or replacement/cancellation. Never mix cells from two files. A later selection invalidates earlier asynchronous results.
5. Evaluate only on an explicit action through the existing submit/evaluate path. Map server field errors back to workbook cells and preserve corrections.
6. Save only through the current reviewed saved-write mechanism. Preserve existing operation UUID/ETag recovery, authentication, deadlines and conflict handling.

The new Excel action becomes the primary intake choice. Preserve existing JSON import labels/test selectors and its behavior. Keep controls keyboard accessible, visibly labelled and at least 44 px. Use framed tables that scroll internally at 375 px and 1280 px. Template download bytes must work in the installed Streamlit component without extra asset routes.

## Test gates

Write failing tests before changing import behavior. Use the existing Playwright framework and fixtures; do not introduce a second test stack or weaken existing assertions.

| Layer             | Required evidence                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Workbook assets   | Every sheet rendered and inspected; blank/example reopen; no formulas/external links/macros; source values match the fixture                                                                                                         |
| Pure validation   | Exact decimals and limits, percentages, zero/missing, signed amounts, integer months, leading-zero geography, dates, partial years/guarantors, duplicate/missing sheets/labels, period order and working-capital mismatch            |
| Parser boundary   | Actual `.xlsx` fixtures, native dates in both systems, formulas/cached errors, malformed/encrypted/oversized archives, sparse huge dimensions, duplicate entries, timeout and cancellation                                           |
| Browser           | Upload does not evaluate/save; preview/corrections; explicit evaluation; source-mapped 422; cancellation/newer file/disconnect; existing case and pending-write state preserved; JSON regression; no console errors or page overflow |
| Streamlit package | Download and import the real bundled template, evaluate, save/reload/reopen a synthetic case; same worksheet/decimal checks as standalone                                                                                            |
| Repository        | TypeScript, decimal tests, production build, unchanged full gate, dependency audit, asset manifest/stamp check, host tests and packaged browser tests                                                                                |

Before merging, compare the actual POST payload with the existing fixture. Existing financial formulas, HTTP contracts, backend files, SQLite schemas, credentials, retention semantics and old test assertions remain unchanged.

## Scope checkpoint

The owner approved the pinned reader/preflight dependencies, frontend package manifest/lock and generated Streamlit bundle/manifest/requirements stamp on October 19, 2026, by continuing after the explicit scope question. Backend code, HTTP contracts, schemas, existing assertions and repository scripts remain outside the change scope. The implementation is undergoing the verification gates above.

## Preparation evidence (before implementation)

- Both five-sheet workbooks were created, reopened and visually inspected on every sheet. The blank workbook contains no example financial values. Neither workbook contains formulas, macros or external workbook parts.
- Five new asset regression tests passed using the repository's existing Playwright runner. The filled workbook reconstructs the complete existing Alpine request without changing a value or JSON type.
- An isolated reader probe checked all 43 supplied input cells against the existing fixture, including all native dates. Both text and numeric XML cells preserved `10000000000000000.01` with the proposed exact-string reader configuration.
- The isolated dependency lock for the two proposed pinned packages passed `npm audit --omit=dev --audit-level=moderate`: zero reported advisories.
- Frontend TypeScript checking passed. Existing application code, dependency manifests/locks, generated Streamlit assets and backend files remain unchanged.
- The preparation commit supplied the template contract and assets. Subsequent implementation adds the bounded inline worker, editable review form and explicit evaluation, with final verification recorded in the pull request.

## References checked October 19, 2026

- read-excel-file documentation: https://github.com/catamphetamine/read-excel-file — exact `parseNumber` override, native dates and cached-formula behavior.
- fflate 0.8.3 changelog: https://github.com/101arrowz/fflate/blob/master/CHANGELOG.md — corrected ZIP64 handling.
- Current npm metadata verified read-excel-file 9.3.12 and fflate 0.8.3. The isolated preparation environment is not a repository dependency change.
