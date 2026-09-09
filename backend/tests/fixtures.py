from app.schemas import FinancialYear, ExistingDebt, ProposedLoan, Guarantor, WorkingCapital, CommercialRequest

ALPINE_2025 = FinancialYear(gross_receipts=4_200_000,cogs=2_750_000,operating_expense_excl_dna_interest_comp=640_000,officer_compensation=180_000,depreciation=95_000,amortization=10_000,interest_expense=62_000,section_179=40_000,k1_distribution=300_000)
ALPINE_2024 = FinancialYear(gross_receipts=3_900_000,cogs=2_570_000,operating_expense_excl_dna_interest_comp=607_000,officer_compensation=175_000,depreciation=90_000,amortization=10_000,interest_expense=58_000,section_179=0,k1_distribution=280_000)
ALPINE_EXISTING = ExistingDebt(cpltd_annual=58_000, operating_lease_annual=24_000)
ALPINE_LOAN = ProposedLoan(amount=500_000, annual_rate=.105, term_months=120)
ALPINE_G = Guarantor(name="Dana Alpine",ownership_percentage=1,wages=65_000,interest_dividend_income=3_000,mortgage_pi_annual=28_800,auto_loan_annual=7_200,credit_card_min_annual=3_600)
ALPINE_WC = WorkingCapital(ar_increase=140_000,inventory_increase=60_000,ap_increase=50_000,cash_taxes_paid=95_000)
BRISTLE = FinancialYear(gross_receipts=2_200_000,cogs=1_850_000,operating_expense_excl_dna_interest_comp=180_000,officer_compensation=60_000,depreciation=40_000,amortization=5_000,interest_expense=48_000,section_179=0,k1_distribution=90_000)
BRISTLE_EXISTING = ExistingDebt(cpltd_annual=45_000, operating_lease_annual=18_000)
BRISTLE_LOAN = ProposedLoan(amount=350_000, annual_rate=.115, term_months=120)
BRISTLE_G = Guarantor(name="Synthetic Owner",ownership_percentage=1,wages=42_000,interest_dividend_income=500,mortgage_pi_annual=24_000,auto_loan_annual=6_000,credit_card_min_annual=4_800)
BRISTLE_WC = WorkingCapital(ar_increase=10_000,inventory_increase=5_000,ap_increase=8_000,cash_taxes_paid=15_000)

def alpine_request():
    return CommercialRequest(borrower_name="Alpine Fabrication", geography="60601", years=[ALPINE_2024, ALPINE_2025], existing_debt=ALPINE_EXISTING, proposed_loan=ALPINE_LOAN, guarantors=[ALPINE_G], working_capital=ALPINE_WC)
