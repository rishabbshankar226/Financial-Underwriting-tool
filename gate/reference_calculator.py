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
    ROUND_DOWN,
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


# Analysis references: common-size, change versus prior, debt capacity, breakevens,
# a cent schedule and stressed coverage. Policy literals restate the prototype policy.
APPROVAL = {"dscr": Decimal("1.25"), "fccr": Decimal("1.20"), "global_dscr": Decimal("1.25")}
DECLINE = {"dscr": Decimal("1.0"), "fccr": Decimal("1.0"), "global_dscr": Decimal("1.0")}
CONSTRAINT_ORDER = ("dscr", "fccr", "global_dscr")
CENT = Decimal("0.01")
BASIS_POINTS = Decimal("10000")
PERSONAL_DEBT = ("mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual")


@reference
def line_amount(year: Input, line: str) -> Decimal:
    y = amounts(year)
    if line == "gross_profit":
        return y["gross_receipts"] - y["cogs"]
    if line == "ordinary_business_income":
        return ordinary_business_income(year)
    if line == "ebitda":
        return ebitda(year)
    return y[line]


@reference
def common_size(year: Input, line: str) -> Decimal | None:
    receipts = number(year["gross_receipts"])
    return line_amount(year, line) / receipts if receipts > ZERO else None


@reference
def change_vs_prior(prior: Input, current: Input, line: str) -> Decimal | None:
    before = line_amount(prior, line)
    return (line_amount(current, line) - before) / before if before > ZERO else None


def _existing_service(year: Input, existing_debt: Input) -> Decimal:
    return number(year["interest_expense"]) + number(existing_debt["cpltd_annual"])


@reference
def capacity_payments(
    year: Input, existing_debt: Input, guarantor: Input, ownership: Decimal | str
) -> dict[str, Decimal]:
    """Largest proposed annual payment each coverage ratio can carry at its approval minimum."""
    g = amounts(guarantor)
    operating = ebitda(year)
    existing = _existing_service(year, existing_debt)
    outside = g["wages"] + g["interest_dividend_income"]
    personal = sum((g[key] for key in PERSONAL_DEBT), ZERO)
    return {
        "dscr": operating / APPROVAL["dscr"] - existing,
        "fccr": operating / APPROVAL["fccr"] - existing - number(existing_debt["operating_lease_annual"]),
        "global_dscr": (number(ownership) * operating + outside) / APPROVAL["global_dscr"] - existing - personal,
    }


def binding_constraint(payments: Mapping[str, Decimal]) -> str:
    return min(CONSTRAINT_ORDER, key=lambda name: (payments[name], CONSTRAINT_ORDER.index(name)))


@reference
def present_value(annual_payment: Decimal, annual_rate: Decimal | str, term_months: int) -> Decimal:
    """Principal a level monthly payment retires, written in accumulated-value form."""
    monthly, rate = max(annual_payment, ZERO) / MONTHS, number(annual_rate) / MONTHS
    if monthly == ZERO:
        return ZERO
    if rate == ZERO:
        return monthly * Decimal(term_months)
    accumulated = (ONE + rate) ** term_months
    return monthly * (accumulated - ONE) / (rate * accumulated)


@reference
def ebitda_breakeven(
    year: Input,
    existing_debt: Input,
    proposed_loan: Input,
    guarantor: Input,
    ownership: Decimal | str,
    constraint: str,
    threshold: Decimal,
) -> Decimal | None:
    g = amounts(guarantor)
    service = _service(year, existing_debt, proposed_loan)
    if constraint == "dscr":
        return threshold * service if service > ZERO else None
    if constraint == "fccr":
        fixed = service + number(existing_debt["operating_lease_annual"])
        return threshold * fixed if fixed > ZERO else None
    weight = number(ownership)
    total = service + sum((g[key] for key in PERSONAL_DEBT), ZERO)
    if total == ZERO or weight == ZERO:
        return None
    return (threshold * total - g["wages"] - g["interest_dividend_income"]) / weight


@reference
def cushions(year: Input, breakeven: Decimal) -> tuple[Decimal, Decimal]:
    """EBITDA cushion and the revenue decline (all costs fixed) that reach the breakeven."""
    operating = ebitda(year)
    return ONE - breakeven / operating, (operating - breakeven) / number(year["gross_receipts"])


@reference
def cent_schedule(
    principal: Decimal | int | str | float,
    annual_rate: Decimal | int | str | float,
    term_months: int,
    interest_rounding: str = ROUND_HALF_EVEN,
) -> dict[str, Decimal]:
    """Cent-rounded level payments; the last or payoff month settles the balance."""
    balance = number(principal).quantize(CENT, rounding=ROUND_HALF_EVEN)
    rate = number(annual_rate) / MONTHS
    payment = (amortized_annual_debt_service(balance, annual_rate, term_months) / MONTHS).quantize(
        CENT, rounding=ROUND_HALF_EVEN
    )
    totals = {"interest": ZERO, "payments": ZERO, "count": ZERO, "final": ZERO}
    for month in range(1, term_months + 1):
        interest = (balance * rate).quantize(CENT, rounding=interest_rounding)
        paid = balance + interest if month == term_months or payment - interest >= balance else payment
        balance -= paid - interest
        totals["interest"] += interest
        totals["payments"] += paid
        totals["count"], totals["final"] = Decimal(month), paid
        if balance == ZERO:
            break
    return {"scheduled_payment": payment, **totals}


@reference
def stressed_coverage(
    year: Input,
    existing_debt: Input,
    proposed_loan: Input,
    guarantor: Input,
    ownership: Decimal | str,
    revenue_change: Decimal | str,
    rate_change_bps: Decimal | str,
    bps_per_unit: Decimal = BASIS_POINTS,
) -> dict[str, Decimal | None]:
    """Revenue and rate stresses with every other input held fixed, as stress previews define."""
    y, g = amounts(year), amounts(guarantor)
    operating = (
        y["gross_receipts"] * (ONE + number(revenue_change))
        - y["cogs"]
        - y["operating_expense_excl_dna_interest_comp"]
        - y["officer_compensation"]
    )
    rate = number(proposed_loan["annual_rate"]) + number(rate_change_bps) / bps_per_unit
    payment = amortized_annual_debt_service(proposed_loan["amount"], rate, int(number(proposed_loan["term_months"])))
    service = _existing_service(year, existing_debt) + payment
    personal = sum((g[key] for key in PERSONAL_DEBT), ZERO)
    return {
        "dscr": _coverage(operating, service),
        "fccr": _coverage(operating, service + number(existing_debt["operating_lease_annual"])),
        "global_dscr": _coverage(
            number(ownership) * operating + g["wages"] + g["interest_dividend_income"], service + personal
        ),
    }


ALPINE_PARTIAL_OWNERSHIP = Decimal("0.6")

ANALYSIS_EXPECTED = {
    "alpine_common_size_cogs_2025": Decimal("0.654761904761904761904762"),
    "alpine_common_size_gross_profit_2025": Decimal("0.345238095238095238095238"),
    "alpine_common_size_ordinary_business_income_2025": Decimal("0.100714285714285714285714"),
    "alpine_common_size_ebitda_2025": Decimal("0.150000000000000000000000"),
    "alpine_change_gross_receipts_2025": Decimal("0.076923076923076923076923"),
    "alpine_change_ordinary_business_income_2025": Decimal("0.084615384615384615384615"),
    "alpine_change_ebitda_2025": Decimal("0.149635036496350364963504"),
    "alpine_capacity_dscr_payment": Decimal("384000.000000000000000000000000"),
    "alpine_capacity_fccr_payment": Decimal("381000.000000000000000000000000"),
    "alpine_capacity_global_dscr_payment": Decimal("398800.000000000000000000000000"),
    "alpine_max_principal": Decimal("2352984.826672761045726790462363"),
    "alpine_breakeven_dscr_approval": Decimal("251201.247581660240952232316665"),
    "alpine_breakeven_dscr_decline": Decimal("200960.998065328192761785853332"),
    "alpine_breakeven_fccr_approval": Decimal("269953.197678393831314143023999"),
    "alpine_breakeven_fccr_decline": Decimal("224960.998065328192761785853332"),
    "alpine_breakeven_global_dscr_approval": Decimal("232701.247581660240952232316665"),
    "alpine_breakeven_global_dscr_decline": Decimal("172560.998065328192761785853332"),
    "alpine_ebitda_cushion_dscr_approval": Decimal("0.601267860981491681028203"),
    "alpine_revenue_cushion_dscr_approval": Decimal("0.090190179147223752154230"),
    "alpine_ebitda_cushion_fccr_approval": Decimal("0.571502860827946299501360"),
    "alpine_revenue_cushion_fccr_approval": Decimal("0.085725429124191944925204"),
    "alpine_revenue_cushion_fccr_decline": Decimal("0.096437857603493287437670"),
    "alpine_partial_owner_capacity_global_dscr_payment": Decimal("197200.000000000000000000000000"),
    "alpine_partial_owner_max_principal": Decimal("1217870.361731938263037593383669"),
    "alpine_partial_owner_breakeven_global_dscr_approval": Decimal("387835.412636100401587053861109"),
    "alpine_partial_owner_breakeven_global_dscr_decline": Decimal("287601.663442213654602976422220"),
    "alpine_schedule_scheduled_payment": Decimal("6746.75"),
    "alpine_schedule_final_payment": Decimal("6746.74"),
    "alpine_schedule_total_interest": Decimal("309609.99"),
    "alpine_schedule_total_payments": Decimal("809609.99"),
    "alpine_schedule_payment_count": Decimal("120"),
    "alpine_stress_dscr_revenue_minus_5": Decimal("2.089957773117084319683834"),
    "alpine_stress_dscr_revenue_minus_10": Decimal("1.044978886558542159841917"),
    "alpine_stress_fccr_revenue_minus_10": Decimal("0.933495147185542131540825"),
    "alpine_stress_global_dscr_revenue_minus_10": Decimal("1.155632052725789932488688"),
    "alpine_stress_dscr_revenue_minus_10_rate_200": Decimal("1.010462126597435888635812"),
    "alpine_stress_dscr_revenue_minus_20_rate_300": Decimal("-0.993543982102041400945780"),
}

ANALYSIS_FLAGS = {
    "alpine_binding_constraint": "fccr",
    "alpine_partial_owner_binding_constraint": "global_dscr",
}
EXACT_CENTS = {name for name in ANALYSIS_EXPECTED if name.startswith("alpine_schedule_")}


def analysis_values() -> tuple[dict[str, Decimal], dict[str, str]]:
    loan = _proposed(ALPINE_PROPOSED_LOAN)
    rate, term = number(ALPINE_PROPOSED_LOAN["annual_rate"]), int(number(ALPINE_PROPOSED_LOAN["term_months"]))
    values: dict[str, Decimal] = {}
    flags: dict[str, str] = {}
    for line in ("cogs", "gross_profit", "ordinary_business_income", "ebitda"):
        values[f"alpine_common_size_{line}_2025"] = available(common_size(ALPINE_2025, line))
    for line in ("gross_receipts", "ordinary_business_income", "ebitda"):
        values[f"alpine_change_{line}_2025"] = available(change_vs_prior(ALPINE_2024, ALPINE_2025, line))
    for label, ownership in (("alpine", ONE), ("alpine_partial_owner", ALPINE_PARTIAL_OWNERSHIP)):
        payments = capacity_payments(ALPINE_2025, ALPINE_EXISTING_DEBT, ALPINE_GUARANTOR, ownership)
        binding = binding_constraint(payments)
        flags[f"{label}_binding_constraint"] = binding
        values[f"{label}_max_principal"] = present_value(payments[binding], rate, term)
        for name, payment in payments.items():
            values[f"{label}_capacity_{name}_payment"] = payment
        for constraint in CONSTRAINT_ORDER:
            for kind, table in (("approval", APPROVAL), ("decline", DECLINE)):
                breakeven = available(
                    ebitda_breakeven(
                        ALPINE_2025, ALPINE_EXISTING_DEBT, loan, ALPINE_GUARANTOR, ownership, constraint, table[constraint]
                    )
                )
                values[f"{label}_breakeven_{constraint}_{kind}"] = breakeven
                ebitda_cushion, revenue_cushion = cushions(ALPINE_2025, breakeven)
                values[f"{label}_ebitda_cushion_{constraint}_{kind}"] = ebitda_cushion
                values[f"{label}_revenue_cushion_{constraint}_{kind}"] = revenue_cushion
    schedule = cent_schedule(ALPINE_PROPOSED_LOAN["amount"], rate, term)
    values.update(
        alpine_schedule_scheduled_payment=schedule["scheduled_payment"],
        alpine_schedule_final_payment=schedule["final"],
        alpine_schedule_total_interest=schedule["interest"],
        alpine_schedule_total_payments=schedule["payments"],
        alpine_schedule_payment_count=schedule["count"],
    )
    for suffix, change, bps in (
        ("revenue_minus_5", "-0.05", "0"),
        ("revenue_minus_10", "-0.10", "0"),
        ("revenue_minus_10_rate_200", "-0.10", "200"),
        ("revenue_minus_20_rate_300", "-0.20", "300"),
    ):
        cell = stressed_coverage(
            ALPINE_2025, ALPINE_EXISTING_DEBT, ALPINE_PROPOSED_LOAN, ALPINE_GUARANTOR, ONE, change, bps
        )
        for name, value in cell.items():
            values[f"alpine_stress_{name}_{suffix}"] = available(value)
    return values, flags


def run_analysis_fixtures() -> tuple[list[Check], list[FlagCheck]]:
    values, flags = analysis_values()
    checks = [
        Check(name, values[name], expected, ZERO if name in EXACT_CENTS else TOLERANCE)
        for name, expected in ANALYSIS_EXPECTED.items()
    ]
    return checks, [FlagCheck(name, flags[name], expected) for name, expected in ANALYSIS_FLAGS.items()]


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

    results.extend(run_analysis_mutations())
    return results


def _differs(got: Decimal, name: str) -> bool:
    return abs(got - ANALYSIS_EXPECTED[name]) > (ZERO if name in EXACT_CENTS else TOLERANCE)


@reference
def run_analysis_mutations() -> list[tuple[str, bool]]:
    loan = _proposed(ALPINE_PROPOSED_LOAN)
    rate, term = number(ALPINE_PROPOSED_LOAN["annual_rate"]), int(number(ALPINE_PROPOSED_LOAN["term_months"]))
    payments = capacity_payments(ALPINE_2025, ALPINE_EXISTING_DEBT, ALPINE_GUARANTOR, ONE)
    breakeven = available(
        ebitda_breakeven(ALPINE_2025, ALPINE_EXISTING_DEBT, loan, ALPINE_GUARANTOR, ONE, "dscr", APPROVAL["dscr"])
    )
    operating, receipts = ebitda(ALPINE_2025), number(ALPINE_2025["gross_receipts"])
    partial_breakeven_without_weight = available(
        ebitda_breakeven(
            ALPINE_2025, ALPINE_EXISTING_DEBT, loan, ALPINE_GUARANTOR, ONE, "global_dscr", APPROVAL["global_dscr"]
        )
    )
    stressed = stressed_coverage(
        ALPINE_2025, ALPINE_EXISTING_DEBT, ALPINE_PROPOSED_LOAN, ALPINE_GUARANTOR, ONE, "-0.10", "200", Decimal("1000")
    )
    accumulated = (ONE + rate) ** term
    annual_rate_principal = payments["fccr"] / MONTHS * (accumulated - ONE) / (rate * accumulated)
    schedule = cent_schedule(ALPINE_PROPOSED_LOAN["amount"], rate, term)
    rounded_down = cent_schedule(ALPINE_PROPOSED_LOAN["amount"], rate, term, ROUND_DOWN)
    maximum = max(CONSTRAINT_ORDER, key=lambda name: payments[name])
    return [
        (
            "common_size_prior_base",
            _differs(number(ALPINE_2025["cogs"]) / number(ALPINE_2024["gross_receipts"]), "alpine_common_size_cogs_2025"),
        ),
        (
            "growth_current_denominator",
            _differs(
                (receipts - number(ALPINE_2024["gross_receipts"])) / receipts, "alpine_change_gross_receipts_2025"
            ),
        ),
        ("capacity_ignores_existing_service", _differs(operating / APPROVAL["dscr"], "alpine_capacity_dscr_payment")),
        (
            "capacity_fccr_omits_lease",
            _differs(payments["fccr"] + number(ALPINE_EXISTING_DEBT["operating_lease_annual"]), "alpine_capacity_fccr_payment"),
        ),
        ("binding_uses_maximum", maximum != ANALYSIS_FLAGS["alpine_binding_constraint"]),
        ("max_principal_annual_rate", _differs(annual_rate_principal, "alpine_max_principal")),
        (
            "global_breakeven_ignores_ownership",
            _differs(partial_breakeven_without_weight, "alpine_partial_owner_breakeven_global_dscr_approval"),
        ),
        ("ebitda_cushion_inverted", _differs(breakeven / operating, "alpine_ebitda_cushion_dscr_approval")),
        ("revenue_cushion_over_ebitda", _differs((operating - breakeven) / operating, "alpine_revenue_cushion_dscr_approval")),
        (
            "amortization_without_final_adjustment",
            _differs(schedule["scheduled_payment"] * schedule["count"], "alpine_schedule_total_payments"),
        ),
        ("amortization_round_down_interest", _differs(rounded_down["interest"], "alpine_schedule_total_interest")),
        ("grid_bps_scale", _differs(available(stressed["dscr"]), "alpine_stress_dscr_revenue_minus_10_rate_200")),
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--selftest",
        action="store_true",
        help="assert pinned values and confirm mutation kills; exit nonzero on any failure",
    )
    args = parser.parse_args(argv)

    analysis_checks, analysis_flags = run_analysis_fixtures()
    checks = run_fixtures() + analysis_checks
    flag_checks = run_flag_checks() + analysis_flags
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
