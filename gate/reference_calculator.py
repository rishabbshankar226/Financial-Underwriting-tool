#!/usr/bin/env python3
"""Independent reference calculator for the credit-underwriting control prompt.

This file ships OUTSIDE the tree the built system lives in, and the built
system must not import it. It exists so a claim like "our DSCR engine is
correct" can be checked against numbers computed by a second, independent
implementation, written before the built system existed, from a synthetic
borrower package that never touches real financial data.

Three borrower fixtures, five things pinned about each:

  A. Alpine Fabrication, Inc. (1120-S, 100% owner-guarantor) -- a clear
     approve: DSCR, FCCR and Global DSCR all comfortably above the 1.15x-1.25x
     range commercial and SBA policy commonly cites. Also carries a UCA-style
     cash-flow figure well below its EBITDA (working capital is absorbing
     cash) and a two-year K-1 distribution history that is stable.
  B. Bristlecone Logistics, LLC (1065, 100% owner-guarantor) -- a clear
     decline: all three coverage ratios below 1.0x. Only one year of K-1 data
     is supplied for this fixture on purpose, to exercise the
     "insufficient-history" flag rather than the "stable" one.
  C. A standalone consumer applicant, engineered to land at exactly 43%
     back-end DTI -- the historical Qualified-Mortgage general DTI ceiling --
     to exercise threshold/boundary handling rather than a clear pass or fail.
     This fixture pins the DTI numbers only. It does NOT pin an approve or
     decline decision: see CREDIT_UNDERWRITING_CONTROL_PROMPT.md section 7 for
     why that is a deliberate, named gap rather than an oversight.

This gate exercises the commercial and consumer verticals. It carries no
SBA-specific fixture (no NAICS size-standard check, no credit-elsewhere test,
no SOP-version switch); the control prompt's Phase 2 asks the builder to
construct that coverage independently, and section 7 says so explicitly
rather than leaving the gap implicit.

Every number below was computed by running this script, not typed from
memory. Re-run it before trusting any figure quoted about it elsewhere.

    python3 reference_calculator.py            # prints all fixture results
    python3 reference_calculator.py --selftest # asserts pinned values + kills mutants

Formula definitions used here are stated explicitly in each function's
docstring, with the convention they follow. They are defensible, commonly
used variants, not a claim that a single universal formula exists industry
wide. A production system must make these definitions a configurable,
versioned, citable policy setting -- never a silent constant -- per
CREDIT_UNDERWRITING_CONTROL_PROMPT.md section 2.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass, field

TOLERANCE = 0.005  # ratios must match to within 0.005x; dollars to within $1

# --------------------------------------------------------------------------
# Fixture A: Alpine Fabrication, Inc. -- 1120-S, Dana Alpine, 100% owner
# --------------------------------------------------------------------------

ALPINE_2025 = dict(
    gross_receipts=4_200_000,
    cogs=2_750_000,
    operating_expense_excl_dna_interest_comp=640_000,
    officer_compensation=180_000,
    depreciation=95_000,
    amortization=10_000,
    interest_expense=62_000,
    section_179=40_000,
    k1_distribution=300_000,
)

ALPINE_2024 = dict(
    gross_receipts=3_900_000,
    cogs=2_570_000,
    operating_expense_excl_dna_interest_comp=607_000,
    officer_compensation=175_000,
    depreciation=90_000,
    amortization=10_000,
    interest_expense=58_000,
    section_179=0,
    k1_distribution=280_000,
)

ALPINE_EXISTING_DEBT = dict(cpltd_annual=58_000, operating_lease_annual=24_000)
ALPINE_PROPOSED_LOAN = dict(amount=500_000, annual_rate=0.105, term_months=120)
ALPINE_GUARANTOR = dict(
    wages=65_000,
    interest_dividend_income=3_000,
    mortgage_pi_annual=28_800,
    auto_loan_annual=7_200,
    credit_card_min_annual=3_600,
)

# Working-capital movement for 2025, used only by uca_cash_flow(). A growing
# borrower: receivables and inventory are both building, which is exactly the
# gap between EBITDA and real cash that UCA is supposed to catch.
ALPINE_WORKING_CAPITAL = dict(
    ar_increase=140_000,
    inventory_increase=60_000,
    ap_increase=50_000,
    cash_taxes_paid=95_000,
)

# --------------------------------------------------------------------------
# Fixture B: Bristlecone Logistics, LLC -- 1065, same guarantor structure,
# thinner margins and heavier debt, engineered to decline.
# --------------------------------------------------------------------------

BRISTLECONE_2025 = dict(
    gross_receipts=2_200_000,
    cogs=1_850_000,
    operating_expense_excl_dna_interest_comp=180_000,
    officer_compensation=60_000,
    depreciation=40_000,
    amortization=5_000,
    interest_expense=48_000,
    section_179=0,
    k1_distribution=90_000,
)

BRISTLECONE_EXISTING_DEBT = dict(cpltd_annual=45_000, operating_lease_annual=18_000)
BRISTLECONE_PROPOSED_LOAN = dict(amount=350_000, annual_rate=0.115, term_months=120)
BRISTLECONE_GUARANTOR = dict(
    wages=42_000,
    interest_dividend_income=500,
    mortgage_pi_annual=24_000,
    auto_loan_annual=6_000,
    credit_card_min_annual=4_800,
)

BRISTLECONE_WORKING_CAPITAL = dict(
    ar_increase=10_000,
    inventory_increase=5_000,
    ap_increase=8_000,
    cash_taxes_paid=15_000,
)

# --------------------------------------------------------------------------
# Fixture C: consumer applicant, engineered to 43.00% back-end DTI exactly.
# --------------------------------------------------------------------------

CONSUMER_C = dict(
    gross_monthly_income=9_000,
    proposed_housing_pi=2_200,
    proposed_housing_tax_ins=470,
    other_monthly_debt=1_200,
)


# --------------------------------------------------------------------------
# Formulas
# --------------------------------------------------------------------------


def ordinary_business_income(year: dict) -> float:
    """Reconstructs 1120-S/1065 ordinary business (trade or business) income
    from its component lines, in the order those lines actually net on the
    return: gross profit, less operating expense, less officer compensation
    or guaranteed payments, less depreciation and amortization, less interest
    expense, less any Section 179 election taken that year."""
    gross_profit = year["gross_receipts"] - year["cogs"]
    after_opex = gross_profit - year["operating_expense_excl_dna_interest_comp"]
    after_comp = after_opex - year["officer_compensation"]
    after_dna = after_comp - year["depreciation"] - year["amortization"]
    after_interest = after_dna - year["interest_expense"]
    return after_interest - year.get("section_179", 0)


def ebitda(year: dict) -> float:
    """EBITDA-analog for a pass-through return: ordinary business income with
    interest, depreciation, amortization and any Section 179 election added
    back. Section 179 is added back alongside depreciation because it is the
    same non-cash capital-cost election accelerated into one year, the
    standard tax-return-spreading add-back (see control prompt section 2)."""
    obi = ordinary_business_income(year)
    return (
        obi
        + year["interest_expense"]
        + year["depreciation"]
        + year["amortization"]
        + year.get("section_179", 0)
    )


def amortized_annual_debt_service(principal: float, annual_rate: float, term_months: int) -> float:
    """Standard fixed-rate amortization: level monthly payment times 12.
    Used for the proposed loan, which has no existing amortization schedule
    to read a payment from."""
    r = annual_rate / 12
    n = term_months
    monthly = principal * r / (1 - (1 + r) ** -n)
    return monthly * 12


def uca_cash_flow(year: dict, working_capital: dict) -> float:
    """A simplified UCA-style Net Cash After Operations figure: EBITDA less
    cash taxes paid, less the net increase in working capital investment
    (accounts-receivable growth plus inventory growth, net of
    accounts-payable growth that frees up cash). This is the number section 2
    means when it says UCA catches what EBITDA alone misses: a borrower whose
    EBITDA is strong but whose receivables and inventory are absorbing the
    cash. Real UCA analysis builds several more subtotals (Gross Cash Flow,
    Net Cash Income, financing requirement) from a full balance-sheet
    comparison across two periods; this fixture set supplies only the net
    working-capital movement directly, as a deliberate simplification, not a
    claim that this is the complete UCA method."""
    net_working_capital_increase = (
        working_capital["ar_increase"] + working_capital["inventory_increase"] - working_capital["ap_increase"]
    )
    return ebitda(year) - working_capital["cash_taxes_paid"] - net_working_capital_increase


def k1_distribution_ratio(year: dict) -> float:
    """Ratio of a K-1's cash distribution to that year's ordinary business
    income -- the basis for judging whether a K-1 income claim has a stable,
    comparable distribution history, per control prompt section 2."""
    obi = ordinary_business_income(year)
    if obi <= 0:
        return float("inf")
    return year["k1_distribution"] / obi


def k1_history_flag(years: list[dict], stability_band: float = 0.15) -> str:
    """Returns 'insufficient_history' when fewer than two years of K-1 data
    are supplied, 'stable' when the distribution-to-income ratio across the
    two most recent years differs by no more than stability_band (an
    absolute fraction), otherwise 'unstable'. Mirrors control prompt
    section 2's flag-do-not-silently-pass rule for K-1 income: a built
    system that always reports 'stable' regardless of history, or that never
    checks at all, should fail against this fixture set."""
    if len(years) < 2:
        return "insufficient_history"
    ratios = [k1_distribution_ratio(y) for y in years[-2:]]
    if abs(ratios[0] - ratios[1]) <= stability_band:
        return "stable"
    return "unstable"


def dscr(year: dict, existing_debt: dict, proposed_loan: dict) -> float:
    """DSCR = EBITDA / Total Debt Service, where Total Debt Service is the
    existing interest expense (already on the P&L) plus the existing current
    portion of long-term debt (principal only, the CPLTD line) plus the full
    principal-and-interest debt service of the proposed loan. Interest is
    counted once: it is added back into EBITDA and then charged once, in
    full, in the denominator. Counting interest once, in the denominator, is
    the piece of RMA/UCA convention this formula borrows (see control prompt
    section 2); it is not itself a UCA cash-flow figure, and is not an
    SBA-specific formula. See uca_cash_flow() above for the actual
    UCA-style figure."""
    total_debt_service = (
        year["interest_expense"] + existing_debt["cpltd_annual"] + proposed_loan["debt_service"]
    )
    return ebitda(year) / total_debt_service


def fccr(year: dict, existing_debt: dict, proposed_loan: dict) -> float:
    """FCCR, as used in this fixture set = EBITDA / (Total Debt Service, as
    in dscr() above, plus the existing operating lease payment). No unfinanced
    capex or cash-tax adjustment is modeled in this simplified fixture; a real
    system must expose those as explicit, separately-sourced line items
    rather than assuming zero, and must cite whichever FCCR definition its
    credit policy adopts (several coexist industry-wide; see control prompt
    section 2)."""
    total_debt_service = (
        year["interest_expense"]
        + existing_debt["cpltd_annual"]
        + proposed_loan["debt_service"]
        + existing_debt["operating_lease_annual"]
    )
    return ebitda(year) / total_debt_service


def global_dscr(year: dict, existing_debt: dict, proposed_loan: dict, guarantor: dict) -> float:
    """Global DSCR for a guarantor who owns 100% of the borrowing entity:
    numerator is business EBITDA plus the guarantor's income from sources
    outside the business (wages, interest/dividends); denominator is the
    business's total debt service (as in dscr()) plus the guarantor's
    personal debt service. K-1 distributions are NOT added on top of EBITDA:
    for a wholly-owned pass-through, EBITDA already represents the full
    economic earnings available to that owner, and adding distributions on
    top would double count the same dollars. For an entity with more than
    one owner, pro-rate EBITDA by the guarantor's ownership percentage before
    combining -- this fixture does not exercise that case because both
    guarantors here own 100%."""
    business_tds = year["interest_expense"] + existing_debt["cpltd_annual"] + proposed_loan["debt_service"]
    personal_debt_service = (
        guarantor["mortgage_pi_annual"] + guarantor["auto_loan_annual"] + guarantor["credit_card_min_annual"]
    )
    global_cash_flow = ebitda(year) + guarantor["wages"] + guarantor["interest_dividend_income"]
    global_total_debt_service = business_tds + personal_debt_service
    return global_cash_flow / global_total_debt_service


def consumer_dti(applicant: dict) -> tuple[float, float]:
    """Returns (front_end_dti, back_end_dti). Front-end is proposed housing
    payment (P&I + tax/insurance escrow) over gross monthly income; back-end
    adds all other monthly debt obligations. Whether 43% back-end is a hard
    ceiling depends on which Reg Z / QM category applies and is a policy
    parameter, not a constant -- see control prompt section 2."""
    housing = applicant["proposed_housing_pi"] + applicant["proposed_housing_tax_ins"]
    front = housing / applicant["gross_monthly_income"]
    back = (housing + applicant["other_monthly_debt"]) / applicant["gross_monthly_income"]
    return front, back


# --------------------------------------------------------------------------
# Pinned expected values -- computed by running the functions above once,
# 2026-09-08, and hardcoded here so a later edit to a formula is caught by
# comparing against a number nobody re-derives from the same code.
# --------------------------------------------------------------------------


def _proposed(loan: dict) -> dict:
    out = dict(loan)
    out["debt_service"] = amortized_annual_debt_service(loan["amount"], loan["annual_rate"], loan["term_months"])
    return out


EXPECTED = {
    "alpine_obi_2025": 423_000.0,
    "alpine_obi_2024": 390_000.0,
    "alpine_ebitda_2025": 630_000.0,
    "alpine_ebitda_2024": 548_000.0,
    "alpine_proposed_debt_service": 80_961.0,
    "alpine_dscr": 3.135,
    "alpine_fccr": 2.800,
    "alpine_global_dscr": 2.902,
    "alpine_uca_cash_flow": 385_000.0,
    "bristlecone_obi": 17_000.0,
    "bristlecone_ebitda": 110_000.0,
    "bristlecone_proposed_debt_service": 59_050.09,
    "bristlecone_dscr": 0.723,
    "bristlecone_fccr": 0.647,
    "bristlecone_global_dscr": 0.816,
    "bristlecone_uca_cash_flow": 88_000.0,
    "consumer_c_front_dti": 0.2967,
    "consumer_c_back_dti": 0.4300,
}

EXPECTED_FLAGS = {
    "alpine_k1_history_flag": "stable",
    "bristlecone_k1_history_flag": "insufficient_history",
}


@dataclass
class Check:
    name: str
    got: float
    expected: float
    tolerance: float = TOLERANCE

    @property
    def passed(self) -> bool:
        return abs(self.got - self.expected) <= self.tolerance


@dataclass
class FlagCheck:
    name: str
    got: str
    expected: str

    @property
    def passed(self) -> bool:
        return self.got == self.expected


def run_fixtures() -> list[Check]:
    alpine_loan = _proposed(ALPINE_PROPOSED_LOAN)
    bristlecone_loan = _proposed(BRISTLECONE_PROPOSED_LOAN)
    front_c, back_c = consumer_dti(CONSUMER_C)

    checks = [
        Check("alpine_obi_2025", ordinary_business_income(ALPINE_2025), EXPECTED["alpine_obi_2025"], 0.01),
        Check("alpine_obi_2024", ordinary_business_income(ALPINE_2024), EXPECTED["alpine_obi_2024"], 0.01),
        Check("alpine_ebitda_2025", ebitda(ALPINE_2025), EXPECTED["alpine_ebitda_2025"], 0.01),
        Check("alpine_ebitda_2024", ebitda(ALPINE_2024), EXPECTED["alpine_ebitda_2024"], 0.01),
        Check(
            "alpine_proposed_debt_service",
            alpine_loan["debt_service"],
            EXPECTED["alpine_proposed_debt_service"],
            1.0,
        ),
        Check("alpine_dscr", dscr(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan), EXPECTED["alpine_dscr"]),
        Check("alpine_fccr", fccr(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan), EXPECTED["alpine_fccr"]),
        Check(
            "alpine_global_dscr",
            global_dscr(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan, ALPINE_GUARANTOR),
            EXPECTED["alpine_global_dscr"],
        ),
        Check(
            "alpine_uca_cash_flow",
            uca_cash_flow(ALPINE_2025, ALPINE_WORKING_CAPITAL),
            EXPECTED["alpine_uca_cash_flow"],
            0.01,
        ),
        Check("bristlecone_obi", ordinary_business_income(BRISTLECONE_2025), EXPECTED["bristlecone_obi"], 0.01),
        Check("bristlecone_ebitda", ebitda(BRISTLECONE_2025), EXPECTED["bristlecone_ebitda"], 0.01),
        Check(
            "bristlecone_proposed_debt_service",
            bristlecone_loan["debt_service"],
            EXPECTED["bristlecone_proposed_debt_service"],
            1.0,
        ),
        Check(
            "bristlecone_dscr",
            dscr(BRISTLECONE_2025, BRISTLECONE_EXISTING_DEBT, bristlecone_loan),
            EXPECTED["bristlecone_dscr"],
        ),
        Check(
            "bristlecone_fccr",
            fccr(BRISTLECONE_2025, BRISTLECONE_EXISTING_DEBT, bristlecone_loan),
            EXPECTED["bristlecone_fccr"],
        ),
        Check(
            "bristlecone_global_dscr",
            global_dscr(BRISTLECONE_2025, BRISTLECONE_EXISTING_DEBT, bristlecone_loan, BRISTLECONE_GUARANTOR),
            EXPECTED["bristlecone_global_dscr"],
        ),
        Check(
            "bristlecone_uca_cash_flow",
            uca_cash_flow(BRISTLECONE_2025, BRISTLECONE_WORKING_CAPITAL),
            EXPECTED["bristlecone_uca_cash_flow"],
            0.01,
        ),
        Check("consumer_c_front_dti", front_c, EXPECTED["consumer_c_front_dti"], 0.0005),
        Check("consumer_c_back_dti", back_c, EXPECTED["consumer_c_back_dti"], 0.0005),
    ]
    return checks


def run_flag_checks() -> list[FlagCheck]:
    return [
        FlagCheck(
            "alpine_k1_history_flag",
            k1_history_flag([ALPINE_2024, ALPINE_2025]),
            EXPECTED_FLAGS["alpine_k1_history_flag"],
        ),
        FlagCheck(
            "bristlecone_k1_history_flag",
            k1_history_flag([BRISTLECONE_2025]),
            EXPECTED_FLAGS["bristlecone_k1_history_flag"],
        ),
    ]


# --------------------------------------------------------------------------
# Mutation self-test: proves the checks above are sensitive to the formulas
# they claim to test, not just asserting a number against itself. Each
# mutation reimplements one function with a specific, named defect and
# asserts the mutated result misses its pinned expected value by more than
# tolerance. A mutation that still matches means the check above cannot
# actually catch that defect in a built system, and is not evidence of
# anything.
# --------------------------------------------------------------------------


def _mutant_dscr_omits_addback(year: dict, existing_debt: dict, proposed_loan: dict) -> float:
    """Defect: uses ordinary business income instead of EBITDA (forgets to
    add back interest/D&A/179) -- a common real mistake when a build reads
    net income off a P&L line without reconstructing cash flow."""
    obi = ordinary_business_income(year)
    total_debt_service = year["interest_expense"] + existing_debt["cpltd_annual"] + proposed_loan["debt_service"]
    return obi / total_debt_service


def _mutant_fccr_omits_lease(year: dict, existing_debt: dict, proposed_loan: dict) -> float:
    """Defect: computes FCCR identically to DSCR, dropping the lease
    payment from the denominator -- the single line that is supposed to
    distinguish the two ratios."""
    total_debt_service = year["interest_expense"] + existing_debt["cpltd_annual"] + proposed_loan["debt_service"]
    return ebitda(year) / total_debt_service


def _mutant_global_dscr_double_counts_distribution(
    year: dict, existing_debt: dict, proposed_loan: dict, guarantor: dict
) -> float:
    """Defect: adds K-1 distributions on top of EBITDA for a wholly-owned
    entity, double counting the same economic earnings once as business
    EBITDA and once as a personal cash receipt."""
    business_tds = year["interest_expense"] + existing_debt["cpltd_annual"] + proposed_loan["debt_service"]
    personal_debt_service = (
        guarantor["mortgage_pi_annual"] + guarantor["auto_loan_annual"] + guarantor["credit_card_min_annual"]
    )
    global_cash_flow = ebitda(year) + year["k1_distribution"] + guarantor["wages"] + guarantor["interest_dividend_income"]
    global_total_debt_service = business_tds + personal_debt_service
    return global_cash_flow / global_total_debt_service


def _mutant_uca_omits_working_capital(year: dict, working_capital: dict) -> float:
    """Defect: subtracts cash taxes but never touches the working-capital
    lines at all, so this mutant is indistinguishable from a build that
    read "UCA" as just "EBITDA minus taxes" and never traced the
    balance-sheet movement the whole method exists to catch."""
    return ebitda(year) - working_capital["cash_taxes_paid"]


def _mutant_amortization_simple_interest(principal: float, annual_rate: float, term_months: int) -> float:
    """Defect: straight-line principal plus flat first-year interest on the
    full original balance, instead of a compounding amortization schedule --
    a plausible mistake for a build that never implements true amortization
    and instead approximates it."""
    annual_principal = principal / (term_months / 12)
    annual_interest = principal * annual_rate
    return annual_principal + annual_interest


def _mutant_dti_swaps_front_back(applicant: dict) -> tuple[float, float]:
    """Defect: returns (back_end, front_end) in place of
    (front_end, back_end) -- the two are numerically distinct in this
    fixture specifically so a swap cannot hide by coincidence."""
    front, back = consumer_dti(applicant)
    return back, front


def _mutant_k1_always_stable(years: list[dict]) -> str:
    """Defect: a reason-code or spreading engine that always reports a K-1
    income claim as having a stable, sufficient history, regardless of how
    many years of data actually exist -- the silent-pass failure mode
    section 2 explicitly forbids."""
    return "stable"


def run_mutations() -> list[tuple[str, bool]]:
    alpine_loan = _proposed(ALPINE_PROPOSED_LOAN)
    results = []

    mutated = _mutant_dscr_omits_addback(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan)
    killed = abs(mutated - EXPECTED["alpine_dscr"]) > TOLERANCE
    results.append(("dscr_omits_addback", killed))

    mutated = _mutant_fccr_omits_lease(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan)
    killed = abs(mutated - EXPECTED["alpine_fccr"]) > TOLERANCE
    results.append(("fccr_omits_lease", killed))

    mutated = _mutant_global_dscr_double_counts_distribution(
        ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan, ALPINE_GUARANTOR
    )
    killed = abs(mutated - EXPECTED["alpine_global_dscr"]) > TOLERANCE
    results.append(("global_dscr_double_counts_distribution", killed))

    mutated = _mutant_uca_omits_working_capital(ALPINE_2025, ALPINE_WORKING_CAPITAL)
    killed = abs(mutated - EXPECTED["alpine_uca_cash_flow"]) > TOLERANCE
    results.append(("uca_omits_working_capital", killed))

    mutated = _mutant_amortization_simple_interest(
        ALPINE_PROPOSED_LOAN["amount"], ALPINE_PROPOSED_LOAN["annual_rate"], ALPINE_PROPOSED_LOAN["term_months"]
    )
    killed = abs(mutated - EXPECTED["alpine_proposed_debt_service"]) > 1.0
    results.append(("amortization_simple_interest", killed))

    mutated_front, mutated_back = _mutant_dti_swaps_front_back(CONSUMER_C)
    killed = abs(mutated_front - EXPECTED["consumer_c_front_dti"]) > 0.0005
    results.append(("dti_swaps_front_back", killed))

    mutated = _mutant_k1_always_stable([BRISTLECONE_2025])
    killed = mutated != EXPECTED_FLAGS["bristlecone_k1_history_flag"]
    results.append(("k1_always_stable", killed))

    return results


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--selftest",
        action="store_true",
        help="assert pinned values and confirm mutation kills; exit nonzero on any failure",
    )
    args = parser.parse_args(argv)

    checks = run_fixtures()
    flag_checks = run_flag_checks()
    failed = [c for c in checks if not c.passed]
    failed_flags = [f for f in flag_checks if not f.passed]

    for c in checks:
        status = "PASS" if c.passed else "FAIL"
        print(f"{status}  {c.name:40s} got={c.got:.4f}  expected={c.expected:.4f}  tol={c.tolerance}")
    for f in flag_checks:
        status = "PASS" if f.passed else "FAIL"
        print(f"{status}  {f.name:40s} got={f.got!r:20s} expected={f.expected!r}")

    if args.selftest:
        mutations = run_mutations()
        print()
        for name, killed in mutations:
            print(f"{'KILLED' if killed else 'SURVIVED (bad)':16s} mutation: {name}")
        if any(not killed for _, killed in mutations):
            print("\nSELFTEST FAIL: at least one mutation survived; a check above cannot see that defect.")
            return 1
        if failed or failed_flags:
            print("\nSELFTEST FAIL: pinned fixture values do not match the formulas as written.")
            return 1
        print(
            f"\nSELFTEST PASS: {len(checks)} fixture values and {len(flag_checks)} flags "
            f"pinned correctly, all {len(mutations)} mutations killed."
        )
        return 0

    return 1 if (failed or failed_flags) else 0


if __name__ == "__main__":
    sys.exit(main())
