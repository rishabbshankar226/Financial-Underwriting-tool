#!/usr/bin/env python3
"""Independent 80-digit reference calculations and named defect mutations.

This program does not import application modules. The annuity implementation
uses the accumulated-value formula, independently of the application's
inverse-power formula. All inputs and pinned outputs use decimal strings.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from decimal import (
    ROUND_HALF_EVEN,
    Context,
    Decimal,
    DivisionByZero,
    InvalidOperation,
    Overflow,
    localcontext,
)
from functools import wraps
from typing import ParamSpec, TypeVar

Input = Mapping[str, Decimal | int | str | float]
TOLERANCE = Decimal("1e-24")
ZERO = Decimal("0")
ONE = Decimal("1")
MONTHS = Decimal("12")
P = ParamSpec("P")
T = TypeVar("T")


def reference(function: Callable[P, T]) -> Callable[P, T]:
    @wraps(function)
    def evaluate(*args: P.args, **kwargs: P.kwargs) -> T:
        context = Context(prec=80, rounding=ROUND_HALF_EVEN)
        for trap in (DivisionByZero, InvalidOperation, Overflow):
            context.traps[trap] = True
        with localcontext(context):
            return function(*args, **kwargs)

    return evaluate


def number(value: Decimal | int | str | float) -> Decimal:
    if isinstance(value, bool):
        raise ValueError("Boolean financial input is unsupported")
    result = Decimal(str(value))
    if not result.is_finite():
        raise ValueError("Financial input must be finite")
    return result


def amounts(value: Input) -> dict[str, Decimal]:
    return {key: number(item) for key, item in value.items()}


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
ALPINE_PROPOSED_LOAN: dict[str, Decimal | int | str | float] = dict(
    amount=500_000, annual_rate="0.105", term_months=120
)
ALPINE_GUARANTOR = dict(
    wages=65_000,
    interest_dividend_income=3_000,
    mortgage_pi_annual=28_800,
    auto_loan_annual=7_200,
    credit_card_min_annual=3_600,
)

ALPINE_WORKING_CAPITAL = dict(
    ar_increase=140_000,
    inventory_increase=60_000,
    ap_increase=50_000,
    cash_taxes_paid=95_000,
)


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
BRISTLECONE_PROPOSED_LOAN: dict[str, Decimal | int | str | float] = dict(
    amount=350_000, annual_rate="0.115", term_months=120
)
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


CONSUMER_C = dict(
    gross_monthly_income=9_000,
    proposed_housing_pi=2_200,
    proposed_housing_tax_ins=470,
    other_monthly_debt=1_200,
)


@reference
def ordinary_business_income(year: Input) -> Decimal:
    y = amounts(year)
    expenses = (
        "cogs",
        "operating_expense_excl_dna_interest_comp",
        "officer_compensation",
        "depreciation",
        "amortization",
        "interest_expense",
        "section_179",
    )
    return y["gross_receipts"] - sum((y.get(key, ZERO) for key in expenses), ZERO)


@reference
def ebitda(year: Input) -> Decimal:
    y = amounts(year)
    return y["gross_receipts"] - sum(
        (y[key] for key in ("cogs", "operating_expense_excl_dna_interest_comp", "officer_compensation")), ZERO
    )


@reference
def amortized_annual_debt_service(
    principal: Decimal | int | str | float, annual_rate: Decimal | int | str | float, term_months: int
) -> Decimal:
    amount, annual = number(principal), number(annual_rate)
    if (
        type(term_months) is not int
        or not 0 < term_months <= 12000
        or amount < ZERO
        or not ZERO <= annual <= ONE
    ):
        raise ValueError("Unsupported fixed-rate loan")
    if annual == ZERO:
        return amount * MONTHS / Decimal(str(term_months))
    rate = annual / MONTHS
    accumulated = (ONE + rate) ** term_months
    return amount * rate * accumulated / (accumulated - ONE) * MONTHS


@reference
def uca_cash_flow(year: Input, working_capital: Input) -> Decimal:
    wc = amounts(working_capital)
    return (
        ebitda(year)
        - wc["cash_taxes_paid"]
        - wc["ar_increase"]
        - wc["inventory_increase"]
        + wc["ap_increase"]
    )


@reference
def k1_distribution_ratio(year: Input) -> Decimal | None:
    obi = ordinary_business_income(year)
    return number(year["k1_distribution"]) / obi if obi > ZERO else None


@reference
def k1_history_flag(years: list[Input], stability_band: Decimal | str | float = Decimal("0.15")) -> str:
    if len(years) < 2:
        return "insufficient_history"
    first, second = (k1_distribution_ratio(year) for year in years[-2:])
    return (
        "stable"
        if first is not None and second is not None and abs(first - second) <= number(stability_band)
        else "unstable"
    )


def _service(year: Input, existing_debt: Input, proposed_loan: Input) -> Decimal:
    return (
        number(year["interest_expense"])
        + number(existing_debt["cpltd_annual"])
        + number(proposed_loan["debt_service"])
    )


def _coverage(numerator: Decimal, denominator: Decimal) -> Decimal | None:
    if denominator < ZERO:
        raise ValueError("Negative coverage denominator")
    return numerator / denominator if denominator != ZERO else None


@reference
def dscr(year: Input, existing_debt: Input, proposed_loan: Input) -> Decimal | None:
    return _coverage(ebitda(year), _service(year, existing_debt, proposed_loan))


@reference
def fccr(year: Input, existing_debt: Input, proposed_loan: Input) -> Decimal | None:
    return _coverage(
        ebitda(year),
        _service(year, existing_debt, proposed_loan) + number(existing_debt["operating_lease_annual"]),
    )


@reference
def global_dscr(year: Input, existing_debt: Input, proposed_loan: Input, guarantor: Input) -> Decimal | None:
    g = amounts(guarantor)
    numerator = ebitda(year) + g["wages"] + g["interest_dividend_income"]
    denominator = _service(year, existing_debt, proposed_loan) + sum(
        (g[key] for key in ("mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual")), ZERO
    )
    return _coverage(numerator, denominator)


@reference
def consumer_dti(applicant: Input) -> tuple[Decimal, Decimal]:
    a = amounts(applicant)
    housing = a["proposed_housing_pi"] + a["proposed_housing_tax_ins"]
    if a["gross_monthly_income"] <= ZERO or min(housing, a["other_monthly_debt"]) < ZERO:
        raise ValueError("Unsupported consumer income/debt")
    return housing / a["gross_monthly_income"], (housing + a["other_monthly_debt"]) / a[
        "gross_monthly_income"
    ]


def _proposed(loan: Input) -> dict[str, Decimal]:
    result = amounts(loan)
    result["debt_service"] = amortized_annual_debt_service(
        loan["amount"], loan["annual_rate"], int(number(loan["term_months"]))
    )
    return result


def available(value: Decimal | None) -> Decimal:
    if value is None:
        raise ValueError("Fixture coverage is unavailable")
    return value


EXPECTED = {
    "alpine_obi_2025": Decimal("423000.000000000000000000000000"),
    "alpine_obi_2024": Decimal("390000.000000000000000000000000"),
    "alpine_ebitda_2025": Decimal("630000.000000000000000000000000"),
    "alpine_ebitda_2024": Decimal("548000.000000000000000000000000"),
    "alpine_proposed_debt_service": Decimal("80960.998065328192761785853332"),
    "alpine_dscr": Decimal("3.134936659675626479525752"),
    "alpine_fccr": Decimal("2.800485441556626394622475"),
    "alpine_global_dscr": Decimal("2.901550981304321485169439"),
    "alpine_uca_cash_flow": Decimal("385000.000000000000000000000000"),
    "bristlecone_obi": Decimal("17000.000000000000000000000000"),
    "bristlecone_ebitda": Decimal("110000.000000000000000000000000"),
    "bristlecone_proposed_debt_service": Decimal("59050.086471171724267341873410"),
    "bristlecone_dscr": Decimal("0.723445823365945245112592"),
    "bristlecone_fccr": Decimal("0.646868239132875101245077"),
    "bristlecone_global_dscr": Decimal("0.816162319644034804304488"),
    "bristlecone_uca_cash_flow": Decimal("88000.000000000000000000000000"),
    "consumer_c_front_dti": Decimal("0.296666666666666666666667"),
    "consumer_c_back_dti": Decimal("0.430000000000000000000000"),
}

EXPECTED_FLAGS = {
    "alpine_k1_history_flag": "stable",
    "bristlecone_k1_history_flag": "insufficient_history",
}


@dataclass
class Check:
    name: str
    got: Decimal
    expected: Decimal
    tolerance: Decimal = TOLERANCE

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
        Check(
            "alpine_obi_2025", ordinary_business_income(ALPINE_2025), EXPECTED["alpine_obi_2025"], TOLERANCE
        ),
        Check(
            "alpine_obi_2024", ordinary_business_income(ALPINE_2024), EXPECTED["alpine_obi_2024"], TOLERANCE
        ),
        Check("alpine_ebitda_2025", ebitda(ALPINE_2025), EXPECTED["alpine_ebitda_2025"], TOLERANCE),
        Check("alpine_ebitda_2024", ebitda(ALPINE_2024), EXPECTED["alpine_ebitda_2024"], TOLERANCE),
        Check(
            "alpine_proposed_debt_service",
            alpine_loan["debt_service"],
            EXPECTED["alpine_proposed_debt_service"],
            TOLERANCE,
        ),
        Check(
            "alpine_dscr",
            available(dscr(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan)),
            EXPECTED["alpine_dscr"],
        ),
        Check(
            "alpine_fccr",
            available(fccr(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan)),
            EXPECTED["alpine_fccr"],
        ),
        Check(
            "alpine_global_dscr",
            available(global_dscr(ALPINE_2025, ALPINE_EXISTING_DEBT, alpine_loan, ALPINE_GUARANTOR)),
            EXPECTED["alpine_global_dscr"],
        ),
        Check(
            "alpine_uca_cash_flow",
            uca_cash_flow(ALPINE_2025, ALPINE_WORKING_CAPITAL),
            EXPECTED["alpine_uca_cash_flow"],
            TOLERANCE,
        ),
        Check(
            "bristlecone_obi",
            ordinary_business_income(BRISTLECONE_2025),
            EXPECTED["bristlecone_obi"],
            TOLERANCE,
        ),
        Check("bristlecone_ebitda", ebitda(BRISTLECONE_2025), EXPECTED["bristlecone_ebitda"], TOLERANCE),
        Check(
            "bristlecone_proposed_debt_service",
            bristlecone_loan["debt_service"],
            EXPECTED["bristlecone_proposed_debt_service"],
            TOLERANCE,
        ),
        Check(
            "bristlecone_dscr",
            available(dscr(BRISTLECONE_2025, BRISTLECONE_EXISTING_DEBT, bristlecone_loan)),
            EXPECTED["bristlecone_dscr"],
        ),
        Check(
            "bristlecone_fccr",
            available(fccr(BRISTLECONE_2025, BRISTLECONE_EXISTING_DEBT, bristlecone_loan)),
            EXPECTED["bristlecone_fccr"],
        ),
        Check(
            "bristlecone_global_dscr",
            available(
                global_dscr(
                    BRISTLECONE_2025, BRISTLECONE_EXISTING_DEBT, bristlecone_loan, BRISTLECONE_GUARANTOR
                )
            ),
            EXPECTED["bristlecone_global_dscr"],
        ),
        Check(
            "bristlecone_uca_cash_flow",
            uca_cash_flow(BRISTLECONE_2025, BRISTLECONE_WORKING_CAPITAL),
            EXPECTED["bristlecone_uca_cash_flow"],
            TOLERANCE,
        ),
        Check("consumer_c_front_dti", front_c, EXPECTED["consumer_c_front_dti"], TOLERANCE),
        Check("consumer_c_back_dti", back_c, EXPECTED["consumer_c_back_dti"], TOLERANCE),
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


@reference
def _mutant_dscr_omits_addback(year: Input, existing_debt: Input, proposed_loan: Input) -> Decimal:
    return ordinary_business_income(year) / _service(year, existing_debt, proposed_loan)


@reference
def _mutant_fccr_omits_lease(year: Input, existing_debt: Input, proposed_loan: Input) -> Decimal:
    return ebitda(year) / _service(year, existing_debt, proposed_loan)


@reference
def _mutant_global_dscr_double_counts_distribution(
    year: Input, existing_debt: Input, proposed_loan: Input, guarantor: Input
) -> Decimal:
    g = amounts(guarantor)
    income = ebitda(year) + number(year["k1_distribution"]) + g["wages"] + g["interest_dividend_income"]
    service = _service(year, existing_debt, proposed_loan) + sum(
        (g[key] for key in ("mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual")), ZERO
    )
    return income / service


@reference
def _mutant_uca_omits_working_capital(year: Input, working_capital: Input) -> Decimal:
    return ebitda(year) - number(working_capital["cash_taxes_paid"])


@reference
def _mutant_amortization_simple_interest(
    principal: Decimal | int | str | float, annual_rate: Decimal | int | str | float, term_months: int
) -> Decimal:
    amount = number(principal)
    return amount * MONTHS / Decimal(str(term_months)) + amount * number(annual_rate)


def _mutant_dti_swaps_front_back(applicant: Input) -> tuple[Decimal, Decimal]:
    front, back = consumer_dti(applicant)
    return back, front


def _mutant_k1_always_stable(years: list[Input]) -> str:
    return "stable"


@reference
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
        ALPINE_PROPOSED_LOAN["amount"],
        ALPINE_PROPOSED_LOAN["annual_rate"],
        int(number(ALPINE_PROPOSED_LOAN["term_months"])),
    )
    killed = abs(mutated - EXPECTED["alpine_proposed_debt_service"]) > TOLERANCE
    results.append(("amortization_simple_interest", killed))

    mutated_front, mutated_back = _mutant_dti_swaps_front_back(CONSUMER_C)
    killed = abs(mutated_front - EXPECTED["consumer_c_front_dti"]) > TOLERANCE
    results.append(("dti_swaps_front_back", killed))

    mutated_flag = _mutant_k1_always_stable([BRISTLECONE_2025])
    killed = mutated_flag != EXPECTED_FLAGS["bristlecone_k1_history_flag"]
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
