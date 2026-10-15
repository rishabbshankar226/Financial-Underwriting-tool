# Dated SBA screening methodology

The endpoint implements selected deterministic screens. It does not approve
SBA eligibility. Passing supported size and configured coverage checks yields
`review_required`; a failed check yields `screen_failed`. Both return
`eligibility_status: incomplete` and explicit unresolved lender requirements.

## Official source and supported rows

The bundled `backend/data/sba-size-standards-2023-03-17.xlsx` contains the exact
official download. `sba_size_standards.json` records its identity and review
dates. The loader verifies its hash before parsing raw spreadsheet numeric
lexemes with standard-library ZIP/XML tools, without float conversion or a new
dependency.

| Provenance | Value |
| --- | --- |
| Effective date | 2023-03-17 |
| Checked on / verified through | 2026-10-15 |
| SHA-256 | `1e0777f83f6cc34767b97957a8e617b951d347f560538687e6bdfef32209bd74` |
| Unique six-digit base NAICS rows | 978 |
| Supported receipts rows | 478 |
| Supported employee rows | 372 |
| Rows requiring manual review | 128 |

Sources: [official workbook](https://data.sba.gov/sites/default/files/distribution/SBA-GCBD-2014-08-001/sba-table-of-size-standards_effective-march-17-2023_v0.xlsx),
[SBA dataset](https://data.sba.gov/dataset/small-business-size-standards), and
[SBA table explanation](https://legacy.sba.gov/document/support-table-size-standards).

Source footnotes, inherited subsector restrictions, industry exception variants,
asset-based measures, mixed measures and nonnumeric thresholds are unsupported.
Their parent rows fail explicitly; exceptions are never flattened into a guessed
threshold. Unknown NAICS codes, altered/missing workbooks and assessments outside
the verified source dates also fail. Updating dates or rows requires a fresh
source review and tests; future assessment dates are not silently projected.
Each result includes the original URL, hash, dates and workbook row.

## Required measurement evidence

`sba-screen-v2` requires `assessment_as_of` and strict `size_evidence`:

| Basis | Supplied value and supported period |
| --- | --- |
| `receipts_three_completed_fiscal_year_average` | Average annual receipts in millions over three complete fiscal years |
| `receipts_five_completed_fiscal_year_average` | Average annual receipts in millions over five complete fiscal years |
| `employees_24_month_pay_period_average_ceiling` | Integer ceiling of the average employee count for each pay period over the latest completed 24 calendar months |

Receipts periods start on a calendar-month boundary and span exactly three or
five complete years. A later completed fiscal year cannot be omitted. Employee
evidence spans the latest completed 24 calendar months. Period end must precede
assessment. Stub periods, 52/53-week fiscal calendars and other unsupported
measurement periods require manual review rather than an inferred adjustment.
The basis must match the selected source measure, with only that measure supplied.

For employee threshold integer `T`, `ceil(average) <= T` is equivalent to
`average <= T`. This contract retains the exact threshold decision without
rounding a fractional average down. The caller attests that the supplied value
was calculated from the required payroll periods. This endpoint does not
aggregate payroll/tax ledgers or independently verify them. `affiliates` must
be `included` or `none`, and a nonblank source reference of at most 500 characters
is required. Classification, aggregation, affiliation and source authenticity
still need lender review.

SBA's official explanation permits a three- or five-year receipts average for
business loans and describes the 24-month pay-period employee average. A single
annual revenue figure or current headcount is not accepted as that evidence.

## SOP and credit-policy boundary

The assessment must select SOP 8 from June 1, 2025 through September 30, 2026,
or SOP 8.1 from October 1, 2026 within the verified source window. Primary source:
[SOP listing and technical updates](https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs).
The October 1 technical-update document used for review has SHA-256
`279c7eee9272ebc9a30edf858c6da5eec3305c55d3a40f9e98dcc76b90e63dde`:
[official technical update](https://legacy.sba.gov/sites/default/files/2026-10/SOP%2050%2010%208.1%20Technical%20Policy%20Updates%20effective%20%2010.1.2026.docx).

The 8.1 helper calculates only supplied liquid resources minus supplied
allowances, bounded below at zero, and reports an indicator against the loan
request. The allowances are supplied evidence, not automatically established
legal entitlements. `credit_elsewhere.passes` is always null. A lender's
credit-elsewhere determination requires broader documented evidence and cannot
be reduced to this arithmetic. SOP 8 skips the limited resource calculation.

Coverage compares exact supplied global DSCR with the configured transaction
floor and reports the policy version/floor. These floors are operator policy
examples; passing them is not regulatory approval. Every result retains
unresolved lender credit-elsewhere, industry/affiliation, alternative size/program
eligibility and approved credit-policy requirements.

## Complete synthetic request

Send this JSON to protected `POST /sba/evaluate` with one Bearer header:

```json
{
  "schema_version": "sba-screen-v2",
  "borrower_name": "Synthetic dated SBA screen",
  "assessment_as_of": "2026-10-14",
  "naics": "541611",
  "annual_receipts_millions": "24.5",
  "requested_loan": "500000",
  "global_dscr": "1.31",
  "sop_version": "8.1",
  "size_evidence": {
    "basis": "receipts_three_completed_fiscal_year_average",
    "period_start": "2023-01-01",
    "period_end": "2025-12-31",
    "affiliates": "included",
    "source_reference": "Synthetic consolidated tax-return review"
  }
}
```

The exact receipts boundary passes size; adding `0.0000000000000000001` million
fails it. Neither outcome establishes complete eligibility. Unknown input/output
fields are forbidden by runtime schemas. V1 synthetic fixtures remain historical
test data; they require explicit v2 date/evidence reconstruction and are not
silently reinterpreted.
