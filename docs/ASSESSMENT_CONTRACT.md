# Commercial assessment v2

`POST /commercial/assessment` and
`assess_commercial(CommercialAssessmentRequest, policy=DEFAULT_POLICY)` share one
calculation. HTTP callers cannot override server policy. The complete current
example is `backend/fixtures/alpine_dated_v2.json`; the original v1 fixture is
retained for compatibility tests.

## Request and exact values

| Record | Required fields |
| --- | --- |
| Envelope | `schema_version: "commercial-assessment-v2"`, `assessment_as_of`, `borrower_name`, `geography`, `units`, `years`, `existing_debt`, `proposed_loan`, `guarantors`, `working_capital` |
| Units | `currency: "USD"`, `monetary_unit: "dollars"`, `annual_rate_unit: "decimal_nominal"` |
| Annual financials | `period_start`, `period_end`, `gross_receipts`, `cogs`, `operating_expense_excl_dna_interest_comp`, `officer_compensation`, `depreciation`, `amortization`, `interest_expense`, `section_179`, `k1_distribution` |
| Existing debt | `cpltd_annual`, `operating_lease_annual` |
| Proposed loan | `amount`, `annual_rate`, integer `term_months`, `rate_type: "fixed"`, `repayment_type: "fully_amortizing"`, `payment_frequency: "monthly"` |
| Guarantor | `name`, `ownership_percentage`, `wages`, `interest_dividend_income`, `mortgage_pi_annual`, `auto_loan_annual`, `credit_card_min_annual` |
| Working capital | `period_start`, `period_end`, `ar_increase`, `inventory_increase`, `ap_increase`, `cash_taxes_paid` |

Amounts, ratios and rates use decimal strings, without currency symbols or
percentage suffixes. Canonical output removes redundant fractional zeros;
reported amounts preserve their specified scale. A 5.25% nominal rate is
`"0.0525"`. There is no FX conversion or automatic unit scaling.

Input permits 34 significant digits, zero, or absolute values from `1e-30` to
`1e30`. Annual rates lie in `[0,1]`, terms are integer months from 12 to 12,000,
individual ownership lies in `[0,1]`, and ownership totals cannot exceed exactly
one. Debt and interest are nonnegative. Other supplied financial lines retain
signed adjustment meanings. Empty guarantors use the business-only fallback.

HTTP intake preserves unquoted numeric tokens before decoding, for compatibility.
V1 envelopes normalize explicitly to v2. Direct v2 model JSON validation rejects
floating financial tokens: use decimal strings or exact integer values. Direct
Python calculation callers should use `Decimal` or strings; a pre-existing
binary float cannot recover decimal digits already lost by its caller.

There are 1–10 ordered, unique, non-overlapping complete annual periods. Dates
use ISO calendar notation. Each period starts on a month's first day and ends
the day before that month in the next year. Fiscal and leap years are supported;
partial/YTD/52-week calendars are not inferred. Periods cannot end after
`assessment_as_of`; working capital must match the latest period. Gaps produce
insufficient comparable K-1 history rather than invented observations.

Unknown fields, boolean financial values, non-finite values, and unsupported
precision/ranges are rejected.

## Calculations and reporting

`commercial-calculation-v2` uses isolated 96-digit Decimal contexts with explicit
HALF_EVEN rounding and DivisionByZero, InvalidOperation, Overflow and Underflow
traps. Internal exponents cover the supported annuity range; returned numerical
values must be finite with adjusted exponent between -128 and 128.

| Definition | Method |
| --- | --- |
| `gross-profit-v2` | Receipts − COGS |
| `ordinary-business-income-v2` | Gross profit minus operating expense, compensation, depreciation, amortization, existing interest and Section 179 |
| `ebitda-v2` | Ordinary income plus existing interest, depreciation, amortization and Section 179 |
| `amortized-payment-v2` | `P*r/(1-(1+r)^(-n))`, `r=a/12`; zero rate uses `P/n` |
| `annualized-payment-v2` | Twelve unrounded monthly payments, not a dated payment schedule |
| `annual-debt-service-v2` | Existing interest + annual CPLTD + proposed annual service |
| `dscr-v2`, `fccr-v2` | EBITDA / business service; FCCR adds operating lease to service |
| `global-dscr-v2` | Ownership-weighted EBITDA plus outside income / business and personal service |
| `uca-cash-flow-v2` | EBITDA − cash taxes − (AR increase + inventory increase − AP increase) |
| `k1-distribution-ratio-v2` | Distribution / positive ordinary income; otherwise unavailable |
| `k1-history-v2` | Comparable adjacent periods, available ratios and the retained stability band determine the explicit category |

Each metric contains raw and reported values, identity, unit, display precision,
status and explanation. An unavailable metric has null raw/reported values and
an explanation. Zero service cannot satisfy an approval factor. Negative service
is invalid. Numeric metrics cannot carry category text or missing report values.

Reporting quantizes money to cents and ratios to four places. Annual
`reported_financials` reconcile to `gross_profit`, EBITDA and ordinary income.
Guarantor contribution groups reconcile to their reported aggregates. Additive
trace operands have contextual `reported_value` allocations so their signed sum
equals the row's reported total. Residual cents are assigned by largest signed
rounding residual, ties by supplied order. Contextual operand allocations may
differ by a cent from independently rounded shared facts. Raw operands and
accepted inputs remain unchanged; policy uses raw values.

## Trace and identity

Historical spreads contain observed source financials and reconciled reports.
Current coverage is explicitly `current_pro_forma`, under the latest period and
`assumptions_as_of`. A trace operand identifies an input JSON Pointer, derived
fact ID, or policy JSON Pointer. These references establish calculation lineage,
not document authenticity.

Decision factors, comparisons, and reasons consume the same raw facts. Numeric
reason text uses canonical decimal representation so input scale cannot change
replay. The weighted score is an illustrative rule score, not a probability.

Versions are `commercial-assessment-v2`, `commercial-calculation-v2`, and
`assessment-json-v2`. The content fingerprint hashes sorted, compact, finite,
UTF-8 JSON containing normalized input, retained policy and these versions. It
excludes runtime timestamps/run IDs. Stored numeric v1 records remain original;
unsupported v1 replay is explicitly unavailable and never relabelled as v2.

## HTTP transport

All write requests are bounded at 1,000,000 actual bytes before framework
buffering and storage dependencies, regardless of Content-Length. Duplicate keys,
invalid UTF-8, non-finite tokens and excessive nesting are rejected. Canonical
paths and their slash aliases share the handler. Errors are 413 for oversized
bodies and 422 for invalid contracts/calculations. Configured local CORS origins
can read both errors. OpenAPI describes the complete typed contracts.

### Field-mapped errors (`field-errors-v1`)

Every 422 contract rejection keeps its original `detail` byte-for-byte. It also
adds an `errors` envelope: `{"version": "field-errors-v1", "items": [...],
"truncated": bool}`.

**Each item contains:**
- `pointer`: an RFC 6901 JSON Pointer into the submitted document, for example
  `/years/1/gross_receipts`. An empty pointer refers to the whole document, for
  example malformed JSON.
- `code`: a stable code (listed below).
- `message`: a plain message that never repeats submitted values.
- `limit`: the violated bound, as a decimal string, when one applies.

**Codes:**

| Group | Codes |
| --- | --- |
| Required, unknown or wrong type | `required`, `unknown_field`, `invalid_type`, `invalid_choice` |
| Numbers and dates | `invalid_decimal`, `too_many_digits`, `out_of_range`, `too_small`, `too_large`, `invalid_date` |
| Periods and assumptions | `period_shape`, `period_order`, `period_after_as_of`, `working_capital_period`, `ownership_total` |
| Lists and text | `too_few_items`, `too_many_items`, `text_too_short`, `text_too_long`, `invalid_format`, `blank_text` |
| Request body | `duplicate_key`, `non_finite_number`, `nesting_too_deep`, `invalid_json`, `invalid_encoding` |
| Fallback | `invalid_value` |

**Where errors point:**
- Cross-field checks point at the most specific field, for example the first
  out-of-order `period_start`. Ownership totals point at `/guarantors`.
- Saved-case creation nests its pointers under `/input`.
- Rejected saved edits point into the case input, the same namespace as
  `field_path`.
- Failing scenarios point at `/scenarios/{index}/assumptions`.

**Limits:** the envelope holds at most 200 items and sets `truncated` when it
omits any. Other storage error bodies are unchanged.
