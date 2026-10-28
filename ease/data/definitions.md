# Definition sources (the only allowed basis for on-screen definitions)

Every plain-language definition a row adds must restate one of these server definitions. Each is cited by
`file:line` at `<base>` `2fbfdef`. The Calculation details section of History & Audit shows the same definition
IDs and expressions to the analyst. A term with no row here is QUEUED, never defined from memory.

| Term on screen | Server definition (verbatim expression) | Source |
| --- | --- | --- |
| Gross profit | `gross_receipts - cogs` (`gross-profit-v2`) | `backend/app/core.py:137-138` |
| OBI (ordinary business income) | `gross_profit - operating_expense_excl_dna_interest_comp - officer_compensation - depreciation - amortization - interest_expense - section_179` (`ordinary-business-income-v2`) | `backend/app/core.py:162-163` |
| EBITDA | `ordinary_business_income + interest_expense + depreciation + amortization + section_179` (`ebitda-v2`) | `backend/app/core.py:174-175` |
| Proposed monthly payment | `amount * (annual_rate / 12) / (1 - (1 + annual_rate / 12) ** -term_months)`; zero rate: `amount / term_months` (`amortized-payment-v2`) | `backend/app/core.py:501-502` |
| Proposed annual payment | `proposed_monthly_payment * 12` (`annualized-payment-v2`) | `backend/app/core.py:509-510` |
| Annual debt service | `existing_interest + cpltd_annual + proposed_annual_payment` (`annual-debt-service-v2`) | `backend/app/core.py:519-520` |
| Fixed charge service | `debt_service + operating_lease_annual` (`fixed-charge-service-v2`) | `backend/app/core.py:533-534` |
| Business DSCR | `numerator / denominator` with numerator `ebitda`, denominator `debt_service`; zero denominator is not applicable (`dscr-v2`) | `backend/app/core.py:627-637` |
| FCCR | `numerator / denominator` with numerator `ebitda`, denominator `fixed_charge_service` (`fccr-v2`) | `backend/app/core.py:627-637` |
| Global DSCR | `numerator / denominator` with numerator `global_cash_flow`, denominator `global_debt_service` (`global-dscr-v2`) | `backend/app/core.py:627-637` |
| Global cash flow | `global_business_ebitda + global_outside_income` (`global-cash-flow-v2`) | `backend/app/core.py:612-613` |
| Global debt service | `debt_service + global_personal_debt` (`global-debt-service-v2`) | `backend/app/core.py:620-621` |
| Ownership-weighted EBITDA | `ebitda * ownership_percentage` | `backend/app/core.py:551-552` |
| Guarantor outside income | `wages + interest_dividend_income` | `backend/app/core.py:561-562` |
| Guarantor personal debt | `mortgage_pi_annual + auto_loan_annual + credit_card_min_annual` | `backend/app/core.py:573-574` |
| Net working capital increase | `ar_increase + inventory_increase - ap_increase` (`net-working-capital-v2`) | `backend/app/core.py:649-650` |
| UCA cash flow | `ebitda - cash_taxes_paid - net_working_capital_increase` (`uca-cash-flow-v2`) | `backend/app/core.py:660-661` |
| K-1 distribution ratio | `k1_distribution / ordinary_business_income; nonpositive income is not applicable` (`k1-distribution-ratio-v2`) | `backend/app/core.py:369-370` |
| Housing DTI / Total DTI | `(pi + tax_ins) / income` and `(pi + tax_ins + other) / income` | `backend/app/core.py:673-687` |

Plain readings (each a restatement of the row above, never wider):

- **Business DSCR**: EBITDA divided by annual debt service (existing interest, annual CPLTD, and the proposed loan's annual payments).
- **FCCR**: EBITDA divided by annual debt service plus annual operating leases.
- **Global DSCR**: owner-weighted business EBITDA plus guarantors' wages and interest or dividend income, divided by business debt service plus guarantors' mortgage, auto and card payments.
- **UCA cash flow**: EBITDA minus cash taxes paid minus the net increase in working capital (receivables plus inventory minus payables).
- **EBITDA**: ordinary business income with interest, depreciation, amortization and Section 179 added back.
- **OBI**: gross profit minus operating expenses, officer compensation, depreciation, amortization, interest and Section 179.
- **DTI**: monthly housing payments (and, for Total DTI, other monthly debt) divided by gross monthly income.

Terms with no server definition found yet (QUEUED if a row needs one): an expansion of CPLTD (the repo uses the
abbreviation only: `assessment_contracts.py:92`, `scenarios.py:52`), "illustrative score", "binding constraint".
"Cushion" has only the sign rule "A negative cushion means the constraint is already breached." (`docs/ANALYSIS_CONTRACT.md:90`)
and the approval and decline cushion fields (`backend/app/analysis.py:774-775`).
