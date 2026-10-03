# Spreadline correctness fixes — October 3, 2026

This patch addresses verified input, policy and explanation gaps from the current prototype. It preserves synthetic-only use, human confirmation, pure financial arithmetic, existing default fixture outcomes, and prototype disclaimers. It does not implement the full improvement roadmap or validate the tool for real lending.

## Changes

| Reproduction | Result after the fix |
|---|---|
| Duplicate nested JSON keys selected the last value. Browser `JSON.parse` also discarded duplicates before upload. | A pair-aware decoder rejects duplicates before API model decoding; browser imports send original JSON text for server validation. |
| JSON NaN/Infinity and overflowing numeric exponents could enter decoding or cause an HTTP 500 during validation-error serialization. | Non-finite numbers reject with HTTP 422. Validation responses retain the configured browser CORS headers. |
| Duplicate/blank CSV headers and extra/missing cells were accepted. | The one-row CSV contract checks unique headers, row length and strict CSV parsing. |
| Duplicate extracted fields silently overwrote earlier confirmed values. | Evidence remains in the extraction result; promotion rejects duplicate names even if one candidate is unconfirmed. Confidence still requires human confirmation and uses the selected policy. |
| Empty/whitespace audit rationales passed the backend. | Rationale is trimmed and required to be nonblank. |
| Omitted SBA SOP selected version `8`. Size-row dates/thresholds and duplicate rows were insufficiently checked. | SOP selection is mandatory. Row dates, positive thresholds, six-digit NAICS and whole employee thresholds are checked; duplicate rows and marked synthetic rows cannot enter the official loader. Injected test rows are visibly identified. |
| Finite SBA allowances overflowed their sum and yielded a passing resources screen. | Intermediate resources arithmetic is checked for finiteness and rejects before an outcome; API coverage verifies HTTP 422. |
| Invalid/inverted policy configuration instantiated successfully; some decision cutoffs were literal values. | Immutable policy configuration validates numeric values, ordering, evidence keys and version metadata. Commercial decline, UCA and synthetic credit-score cutoffs are configurable with legacy defaults. |
| Rounded factors hid actual boundary comparison values; zero-debt or missing-score reviews could lack explanations. | Factors expose raw values/operators and coverage decline thresholds/triggers. Decisions expose policy version. Unavailable factors have review explanations; internal reason records are not truncated. |

The UCA card displays its returned cash-flow threshold rather than a fixed positive-only label.

## Validation

The unchanged baseline passed 53 backend tests before edits. New tests were run against old behavior to reproduce the failures before the corresponding fixes, including separate browser reproductions for the UCA threshold label and duplicate JSON import.

- Independent reference calculator: all 18 numeric checks and two history flags pass; all seven formula mutations are detected.
- Backend: 117 tests pass, including 64 added cases across intake, API, policy, SBA and reason traceability.
- Frontend: production build passes; npm audit reports zero vulnerabilities.
- Browser: six Playwright tests cover the existing workflow plus configured UCA display and duplicate-import rejection. Local browser execution uses an isolated Chromium 153 binary through the repository's existing executable-path override because the standard browser archive download failed in this environment.

## Compatibility and remaining scope

SBA callers must now explicitly send `sop_version`. Size-row JSON must contain a valid calendar date, including explicitly synthetic test rows; the previous `synthetic-test` sentinel is no longer accepted. Decision response metadata is additive; internal reason lists may be longer and may contain manual-review explanations for unavailable factors.

An empty official size table still fails closed. Calendar-date validation does not establish SOP/table applicability or a complete SBA policy assessment. Confidence remains an uncalibrated parser heuristic. Actor identity/history are not authenticated or durable. Financial-period contracts, richer FCCR/UCA definitions, case revision storage, full replay snapshots, role controls and governed extraction remain subsequent roadmap work.
