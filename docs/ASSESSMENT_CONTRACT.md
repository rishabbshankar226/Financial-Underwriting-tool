# Commercial assessment v1

`POST /commercial/assessment` produces one complete commercial assessment from
synthetic inputs. The pure Python interface is
`assess_commercial(CommercialAssessmentRequest, policy=DEFAULT_POLICY)`.
The HTTP route uses server policy; clients cannot supply a policy override.

## Request

Use `backend/fixtures/alpine_dated.json` as the complete example. Its 2024/2025
calendar periods and October 6, 2026 assessment date are synthetic demonstration
assumptions, not verified tax-return metadata. The original `alpine.json` stays
undated and is intended for the legacy interface.

Every listed record/field is required. Zero values must be explicit.

| Record | Fields |
|---|---|
| Envelope | `schema_version: "commercial-assessment-v1"`, ISO `assessment_as_of`, `borrower_name`, `geography`, `units`, `years`, `existing_debt`, `proposed_loan`, `guarantors`, `working_capital` |
| Units | `currency: "USD"`, `monetary_unit: "dollars"`, `annual_rate_unit: "decimal_nominal"` |
| Each financial year | ISO `period_start`, `period_end`; `gross_receipts`, `cogs`, `operating_expense_excl_dna_interest_comp`, `officer_compensation`, `depreciation`, `amortization`, `interest_expense`, `section_179`, `k1_distribution` |
| Existing debt | `cpltd_annual`, `operating_lease_annual` |
| Proposed loan | `amount`, `annual_rate`, integer `term_months`; `rate_type: "fixed"`, `repayment_type: "fully_amortizing"`, `payment_frequency: "monthly"` |
| Each guarantor | `name`, `ownership_percentage`, `wages`, `interest_dividend_income`, `mortgage_pi_annual`, `auto_loan_annual`, `credit_card_min_annual` |
| Working capital | ISO `period_start`, `period_end`; `ar_increase`, `inventory_increase`, `ap_increase`, `cash_taxes_paid` |

Financial numbers are finite JSON numbers, including integer money. Booleans,
quoted numbers/percentages, and unknown fields at any nesting level are rejected.
Dates use `YYYY-MM-DD`. There is no FX conversion, thousands scaling, or automatic
annualization. A nominal 10.5% annual rate is `0.105` and uses rate / 12 monthly.
The supported annual rate range is 0–1 and the integer loan term is at least 12
months; these are software limits, not lending-policy thresholds.

Interest, existing debt, proposed principal, and personal debt are nonnegative.
Ownership lies in [0, 1], with combined ownership at most 1 (retaining the legacy
1e-9 summation tolerance). Other financial lines and working-capital movements
retain their signed-input meanings. An explicitly empty guarantor list uses full
business EBITDA and business debt service without outside income/personal debt.

There are 1–10 financial periods, oldest first, unique and non-overlapping.
Each period starts on the first day of a month and ends the day before that same
month starts the following year. Fiscal and leap years are supported; partial,
YTD, and 52/53-week calendars are unsupported. No period ends after the supplied
assessment date. Gaps are allowed. Working capital must reference exactly the
latest period; debt and guarantor figures are annual assumptions as of the
assessment date. The date does not automatically select a policy version.

## Results and definitions

The selected latest period supplies current operating financials. Historical
columns contain supplied lines, OBI, EBITDA, and K-1 distribution ratios. They do
not present proposed-loan coverage as an observed historical result. Current
coverage has `coverage_basis: "current_pro_forma"` and `assumptions_as_of`.

| Fact / definition ID | Arithmetic |
|---|---|
| `ordinary-business-income-v1` | Gross receipts − COGS − operating expenses excluding D&A/interest/compensation − officer compensation − depreciation − amortization − existing interest − Section 179, in that order. |
| `ebitda-v1` | OBI + existing interest + depreciation + amortization + Section 179, in that order. |
| `amortized-payment-v1` | For positive principal/rate, monthly payment = principal × (r / −expm1(−n × log1p(r))), r = annual rate / 12. Zero principal gives zero; zero/underflowed r uses principal / n. |
| `annualized-payment-v1` | Monthly proposed payment × 12. Includes principal and interest and is not a dated first-year payment schedule. |
| `annual-debt-service-v1` | Latest existing interest + annual CPLTD + annualized proposed payment. Proposed interest is not added again. |
| `dscr-v1` | Latest EBITDA / current debt service. |
| `fccr-v1` | Latest EBITDA / (current debt service + annual operating lease). This is the existing simplified FCCR. |
| `global-dscr-v1` | (Ownership-weighted business EBITDA + outside income) / (business debt service + personal debt). Each guarantor contribution is exposed; an empty list uses the business-only fallback. |
| `uca-cash-flow-v1` | EBITDA − cash taxes − (AR increase + inventory increase − AP increase), preserving that grouping and signed movements. |
| `k1-distribution-ratio-v1` | Distribution / OBI, unavailable for nonpositive OBI. |
| `k1-stability-difference-v1` | Absolute difference of two comparable, available distribution ratios; otherwise explicitly unavailable. |
| `k1-history-v1` | Fewer than two comparable latest periods: `insufficient_history`. Otherwise any unavailable ratio: `unstable`; absolute ratio difference ≤ the configured band: `stable`; otherwise `unstable`. |

Only adjacent latest full annual periods on the same fiscal basis enter the
two-year history check. `k1_history_periods` explicitly identifies the selected
window. A gap or changed fiscal basis produces insufficient history without
erasing a current coverage decline. Historical UCA is not invented for periods
without their own working-capital inputs.

Each metric contains `fact_id`, `raw_value`, `unit`, `display_precision`, `status`,
and an optional explanation. Defined zero-denominator coverage has
`status: "not_applicable"`, a null raw value, and an unavailable factor comparison
that requires review. Nonpositive OBI also gives a null K-1 ratio. Supported
results never contain NaN/Infinity; numerical overflow is rejected with 422.

## Trace, decision, policy, and identity

The response includes normalized input, selected period, historical spread,
typed current facts, individual guarantor contributions, calculation trace,
decision, and the complete policy snapshot actually used. Each trace row names
its definition, operation order/expression, and actual operand values.
An operand references an input JSON Pointer, a derived fact ID, or a policy
snapshot JSON Pointer. Input paths identify supplied values; they do not verify
document provenance. Definition constants, such as 12 payments per year, appear
in the expression.

Decision factors and trace rows consume the same computed facts. Factors expose
raw comparisons, approval thresholds, decline floors, operators, and reasons.
The existing weighted-rule score is illustrative, not a probability. Display
rounding never controls approval/decline comparisons. Financial arithmetic stays
on the backend; consumers format the supplied result.

Versions are `commercial-assessment-v1`, `commercial-calculation-v1`, and
`assessment-json-v1`. The fingerprint is SHA-256 of UTF-8 Python JSON containing
normalized input, the complete policy snapshot, and all three versions, using
sorted object keys, compact separators, literal Unicode, and finite JSON values.
Integers accepted as monetary inputs normalize to model floats before hashing.
Wall-clock time and random run IDs are excluded. This specifies v1 serialization,
not universal cross-language canonicalization or authenticated/tamper-proof
storage. A changed engine definition must receive a new calculation version.

## HTTP errors and limits

The route reads at most 1,000,000 actual bytes before JSON parsing, counting
streamed chunks independently of `Content-Length`. It bypasses the legacy JSON
middleware's unrestricted pre-buffering. The trailing-slash alias uses the same
bounded handler. No private request-body cache attributes are used.

| Status | Meaning |
|---|---|
| 200 | Complete validated assessment. |
| 413 | More than 1,000,000 received bytes, even if the JSON is malformed. |
| 422 | Invalid UTF-8/JSON, duplicate keys, non-finite JSON tokens/exponents, invalid dated contract, or unsupported calculation range. |

Validation errors include field paths where available. CORS headers wrap both
413 and 422 responses for configured browser origins. JSON decoding is guarded
regardless of the incoming content-type header. The OpenAPI request and response
schemas are typed. Legacy commercial, consumer, and SBA endpoints retain their
existing request contracts; the current UI continues using the legacy endpoint.

Phase 1B adds no saved cases, audit service, stress scenarios, or export workflow.
