from __future__ import annotations

from collections.abc import Callable, Sequence
from dataclasses import dataclass, replace
from decimal import Decimal
from typing import TYPE_CHECKING, Literal

from .finance import (
    MAX_TERM_MONTHS,
    MONTHS_PER_YEAR,
    ONE,
    ZERO,
    NumericInput,
    as_decimal,
    calculation,
    finite_result,
    quantize,
    reconcile,
)
from .schemas import CommercialRequest, ExistingDebt, FinancialYear, Guarantor, ProposedLoan, WorkingCapital

if TYPE_CHECKING:
    from .assessment_contracts import (
        AssessmentGuarantor,
        AssessmentLoan,
        AssessmentWorkingCapital,
        CommercialAssessmentRequest,
        DatedFinancialYear,
    )

CALCULATION_VERSION = "commercial-calculation-v2"


@dataclass(frozen=True)
class Operand:
    reference_type: Literal["input", "fact", "policy"]
    reference: str
    raw_value: Decimal | int | str | None
    unit: str
    reported_value: Decimal | int | str | None = None


@dataclass(frozen=True)
class Calculation:
    fact_id: str
    definition_id: str
    expression: str
    operands: tuple[Operand, ...]
    raw_value: Decimal | str | None
    unit: str
    display_precision: int | None
    status: Literal["available", "not_applicable"] = "available"
    explanation: str | None = None
    reported_value: Decimal | str | None = None


class _Facts:
    """Record operands at calculation time; consumers never recompute a trace."""

    def __init__(
        self,
        *,
        fact_reference: Callable[[str], str] | None = None,
        input_reference: Callable[[str], str] | None = None,
    ) -> None:
        self.rows: dict[str, Calculation] = {}
        self.fact_reference = fact_reference or (lambda name: name)
        self.input_reference = input_reference or (lambda path: path)

    def input(self, path: str, value: Decimal | int | str | None, unit: str = "USD") -> Operand:
        return Operand("input", self.input_reference(path), value, unit)

    def fact(self, name: str) -> Operand:
        row = self.rows[name]
        return Operand("fact", row.fact_id, row.raw_value, row.unit)

    def add(
        self,
        name: str,
        definition: str,
        expression: str,
        operands: Sequence[Operand],
        value: Decimal | str | None,
        unit: str = "USD",
        precision: int | None = 2,
        explanation: str | None = None,
        report_signs: Sequence[int] | None = None,
    ) -> Decimal | str | None:
        if isinstance(value, Decimal):
            _finite(value)
        row = Calculation(
            self.fact_reference(name),
            definition,
            expression,
            tuple(operands),
            value,
            unit,
            precision,
            "not_applicable" if value is None else "available",
            explanation,
        )
        report = quantize(value, precision) if isinstance(value, Decimal) and precision is not None else value
        if report_signs is not None and isinstance(value, Decimal) and precision is not None:
            if len(report_signs) != len(operands) or any(sign not in (-1, 1) for sign in report_signs):
                raise ValueError("Reporting groups require one explicit sign per operand")
            signed = [
                _finite(operand.raw_value) * sign
                for operand, sign in zip(operands, report_signs, strict=True)
            ]
            allocated = reconcile(signed, value, precision)
            reported_operands = tuple(
                replace(operand, reported_value=amount * sign)
                for operand, amount, sign in zip(operands, allocated, report_signs, strict=True)
            )
            row = replace(row, operands=reported_operands)
        self.rows[name] = replace(row, reported_value=report)
        return value


@dataclass(frozen=True)
class CommercialFacts:
    current: dict[str, Calculation]
    history: tuple[dict[str, Calculation], ...]
    trace: tuple[Calculation, ...]


def _year_income(
    year: FinancialYear | DatedFinancialYear, facts: _Facts, index: int, include_ebitda: bool = True
) -> Decimal:
    prefix, path = f"years.{index}.", f"/years/{index}/"

    def inp(name: str) -> Operand:
        return facts.input(path + name, as_decimal(getattr(year, name)))

    gross = facts.add(
        prefix + "gross_profit",
        "gross-profit-v2",
        "gross_receipts - cogs",
        [inp("gross_receipts"), inp("cogs")],
        year.gross_receipts - year.cogs,
        report_signs=(1, -1),
    )
    names = (
        "operating_expense_excl_dna_interest_comp",
        "officer_compensation",
        "depreciation",
        "amortization",
        "interest_expense",
        "section_179",
    )
    obi = _finite(
        _finite(gross)
        - year.operating_expense_excl_dna_interest_comp
        - year.officer_compensation
        - year.depreciation
        - year.amortization
        - year.interest_expense
        - year.section_179
    )
    facts.add(
        prefix + "ordinary_business_income",
        "ordinary-business-income-v2",
        "gross_profit - operating_expense_excl_dna_interest_comp - officer_compensation - depreciation - amortization - interest_expense - section_179 (left to right)",
        [facts.fact(prefix + "gross_profit"), *(inp(name) for name in names)],
        obi,
        report_signs=(1, -1, -1, -1, -1, -1, -1),
    )
    if include_ebitda:
        value = _finite(
            obi + year.interest_expense + year.depreciation + year.amortization + year.section_179
        )
        facts.add(
            prefix + "ebitda",
            "ebitda-v2",
            "ordinary_business_income + interest_expense + depreciation + amortization + section_179 (left to right)",
            [
                facts.fact(prefix + "ordinary_business_income"),
                *(inp(name) for name in ("interest_expense", "depreciation", "amortization", "section_179")),
            ],
            value,
            report_signs=(1, 1, 1, 1, 1),
        )
    return obi


def _finite(value: object) -> Decimal:
    return finite_result(value)


def _coverage(numerator: Decimal, denominator: Decimal) -> Decimal | None:
    _finite(numerator)
    _finite(denominator)
    if denominator < ZERO:
        raise ValueError("Coverage denominator must be nonnegative")
    return None if denominator == ZERO else _finite(numerator / denominator)


@calculation
def ordinary_business_income(year: FinancialYear) -> Decimal:
    return _year_income(year, _Facts(), 0, include_ebitda=False)


@calculation
def ebitda(year: FinancialYear) -> Decimal:
    facts = _Facts()
    _year_income(year, facts, 0)
    return _finite(facts.rows["years.0.ebitda"].raw_value)


@calculation
def amortized_annual_debt_service(
    principal: NumericInput, annual_rate: NumericInput, term_months: int
) -> Decimal:
    return _loan_payment(principal, annual_rate, term_months)[1]


def _loan_payment(
    principal: NumericInput, annual_rate: NumericInput, term_months: int
) -> tuple[Decimal, Decimal]:
    if type(term_months) is not int or not 0 < term_months <= MAX_TERM_MONTHS:
        raise ValueError("Loan term must be a positive integer within the supported month range")
    amount, annual = as_decimal(principal), as_decimal(annual_rate)
    if amount < ZERO or not ZERO <= annual <= ONE:
        raise ValueError("Loan principal must be nonnegative and annual rate between zero and one")
    if amount == ZERO:
        return ZERO, ZERO
    rate = annual / MONTHS_PER_YEAR
    monthly = amount / term_months if rate == ZERO else amount * rate / (ONE - (ONE + rate) ** -term_months)
    return _finite(monthly), _finite(monthly * MONTHS_PER_YEAR)


@calculation
def uca_cash_flow(year: FinancialYear, wc: WorkingCapital) -> Decimal:
    return _cash_flow(ebitda(year), wc)[1]


def _cash_flow(
    operating_ebitda: Decimal, wc: WorkingCapital | AssessmentWorkingCapital
) -> tuple[Decimal, Decimal]:
    net_wc_increase = wc.ar_increase + wc.inventory_increase - wc.ap_increase
    return net_wc_increase, _finite(operating_ebitda - wc.cash_taxes_paid - net_wc_increase)


@calculation
def debt_service(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> Decimal:
    return _debt_service(
        year.interest_expense,
        existing.cpltd_annual,
        amortized_annual_debt_service(proposed.amount, proposed.annual_rate, proposed.term_months),
    )


def _debt_service(interest: Decimal, cpltd: Decimal, proposed_annual: Decimal) -> Decimal:
    return _finite(interest + cpltd + proposed_annual)


@calculation
def dscr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> Decimal | None:
    den = debt_service(year, existing, proposed)
    return _coverage(ebitda(year), den)


@calculation
def fccr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> Decimal | None:
    den = debt_service(year, existing, proposed) + existing.operating_lease_annual
    return _coverage(ebitda(year), den)


@calculation
def global_dscr(
    year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan, guarantors: list[Guarantor]
) -> Decimal | None:
    business_tds = debt_service(year, existing, proposed)
    operating_ebitda = ebitda(year)
    weighted, outside, personal, _ = _global_details(operating_ebitda, guarantors)
    return _coverage(weighted + outside, business_tds + personal)


def _global_details(
    operating_ebitda: Decimal, guarantors: Sequence[Guarantor] | Sequence[AssessmentGuarantor]
) -> tuple[Decimal, Decimal, Decimal, list[tuple[Decimal, Decimal, Decimal]]]:
    weighted_business_ebitda = ZERO
    outside_income = ZERO
    personal_debt = ZERO
    contributions = []
    for g in guarantors:
        business = operating_ebitda * g.ownership_percentage
        income = g.wages + g.interest_dividend_income
        debt = g.mortgage_pi_annual + g.auto_loan_annual + g.credit_card_min_annual
        contributions.append((business, income, debt))
        weighted_business_ebitda += business
        outside_income += income
        personal_debt += debt
    if not guarantors:
        weighted_business_ebitda = operating_ebitda
    return weighted_business_ebitda, outside_income, personal_debt, contributions


@calculation
def k1_distribution_ratio(year: FinancialYear) -> Decimal | None:
    return _distribution_ratio(ordinary_business_income(year), year.k1_distribution)


def _distribution_ratio(ordinary_income: Decimal, distribution: Decimal) -> Decimal | None:
    return None if ordinary_income <= ZERO else _finite(distribution / ordinary_income)


@calculation
def k1_history_flag(years: list[FinancialYear], stability_band: NumericInput = Decimal("0.15")) -> str:
    if len(years) < 2:
        return "insufficient_history"
    ratios = [k1_distribution_ratio(y) for y in years[-2:]]
    return _history_flag(ratios, as_decimal(stability_band))


def _history_flag(ratios: Sequence[Decimal | None], stability_band: Decimal) -> str:
    return _history_comparison(ratios, stability_band)[0]


def _history_comparison(
    ratios: Sequence[Decimal | None], stability_band: Decimal
) -> tuple[str, Decimal | None]:
    if len(ratios) < 2:
        return "insufficient_history", None
    first, second = ratios[0], ratios[1]
    if first is None or second is None:
        return "unstable", None
    difference = abs(first - second)
    return ("stable" if difference <= stability_band else "unstable"), difference


@calculation
def commercial_facts(
    req: CommercialRequest | CommercialAssessmentRequest,
    stability_band: Decimal,
    *,
    history_indices: Sequence[int] | None = None,
    include_spread: bool = False,
) -> CommercialFacts:
    """Shared commercial arithmetic for legacy decisions and dated assessments.

    Dated callers select comparable history explicitly. Legacy callers calculate
    only the current financials and the OBI needed by their existing K-1 rule.
    """
    facts = _Facts()
    latest = len(req.years) - 1
    selected = (
        list(range(max(0, latest - 1), latest + 1)) if history_indices is None else list(history_indices)
    )
    needed = (
        set(range(len(req.years))) if include_spread else {latest, *(selected if len(selected) >= 2 else [])}
    )
    for index in sorted(needed):
        _year_income(req.years[index], facts, index, include_ebitda=include_spread or index == latest)
    current_prefix = f"years.{latest}."
    _current_commercial_facts(req, facts, latest, req.years[latest], req.proposed_loan)

    ratios = {}
    for index in sorted(needed):
        if not include_spread and len(selected) < 2:
            continue
        obi = _finite(facts.rows[f"years.{index}.ordinary_business_income"].raw_value)
        value = _distribution_ratio(obi, req.years[index].k1_distribution)
        if include_spread and value is not None:
            _finite(value)
        ratios[index] = value
        facts.add(
            f"years.{index}.k1_distribution_ratio",
            "k1-distribution-ratio-v2",
            "k1_distribution / ordinary_business_income; nonpositive income is not applicable",
            [
                facts.input(f"/years/{index}/k1_distribution", req.years[index].k1_distribution),
                facts.fact(f"years.{index}.ordinary_business_income"),
            ],
            value,
            "ratio",
            4,
            "Nonpositive ordinary business income" if obi <= ZERO else None,
        )
    flag, difference = _history_comparison(
        [ratios[i] for i in selected] if len(selected) >= 2 else [], stability_band
    )
    if include_spread and difference is not None:
        _finite(difference)
    unavailable = (
        "Fewer than two comparable periods"
        if len(selected) < 2
        else "An unavailable distribution ratio"
        if difference is None
        else None
    )
    facts.add(
        "current.k1_ratio_difference",
        "k1-stability-difference-v2",
        "abs(previous_ratio - latest_ratio) when two comparable ratios are available",
        [facts.fact(f"years.{i}.k1_distribution_ratio") for i in selected if i in ratios],
        difference,
        "ratio",
        4,
        unavailable,
    )
    history_operands = [facts.fact("current.k1_ratio_difference")]
    history_operands.append(Operand("policy", "/policy_snapshot/k1_stability_band", stability_band, "ratio"))
    facts.add(
        "current.k1_history",
        "k1-history-v2",
        "fewer than two selected periods: insufficient_history; unavailable ratio: unstable; otherwise abs(previous_ratio - latest_ratio) <= stability_band is stable",
        history_operands,
        flag,
        "category",
        None,
    )

    current = {
        name.removeprefix("current."): row
        for name, row in facts.rows.items()
        if name.startswith("current.") and not name.startswith("current.guarantors.")
    }
    current.update(
        ordinary_business_income=facts.rows[current_prefix + "ordinary_business_income"],
        ebitda=facts.rows[current_prefix + "ebitda"],
    )
    history = (
        tuple(
            {
                name: facts.rows[f"years.{i}.{name}"]
                for name in ("gross_profit", "ordinary_business_income", "ebitda", "k1_distribution_ratio")
            }
            for i in range(len(req.years))
        )
        if include_spread
        else ()
    )
    return CommercialFacts(current, history, tuple(facts.rows.values()))


@calculation
def projected_commercial_facts(
    req: CommercialAssessmentRequest,
    operating: DatedFinancialYear,
    loan: AssessmentLoan,
    *,
    retained_trace: Sequence[Calculation],
    assumption_trace: Sequence[Calculation],
) -> CommercialFacts:
    """Projected current context with retained observed history supplied before decisions."""
    latest = len(req.years) - 1
    year_prefix, year_path = f"years.{latest}.", f"/years/{latest}/"

    def fact_reference(name: str) -> str:
        if name.startswith(year_prefix):
            return "projection.operating." + name.removeprefix(year_prefix)
        return "projection." + name

    def input_reference(path: str) -> str:
        if path.startswith(year_path):
            return "/projection_inputs/operating/" + path.removeprefix(year_path)
        if path.startswith("/proposed_loan/"):
            return "/projection_inputs" + path
        return "/baseline/assessment/normalized_input" + path

    facts = _Facts(fact_reference=fact_reference, input_reference=input_reference)
    observed = {row.fact_id: row for row in retained_trace}
    facts.rows.update(observed)
    facts.rows.update({row.fact_id: row for row in assumption_trace})
    _year_income(operating, facts, latest)
    _current_commercial_facts(req, facts, latest, operating, loan)
    current = {
        name.removeprefix("current."): row
        for name, row in facts.rows.items()
        if name.startswith("current.") and not name.startswith("current.guarantors.")
    }
    current.update(
        ordinary_business_income=facts.rows[year_prefix + "ordinary_business_income"],
        ebitda=facts.rows[year_prefix + "ebitda"],
        k1_history=observed["baseline.current.k1_history"],
        k1_ratio_difference=observed["baseline.current.k1_ratio_difference"],
    )
    return CommercialFacts(current, (), tuple(facts.rows.values()))


def _current_commercial_facts(
    req: CommercialRequest | CommercialAssessmentRequest,
    facts: _Facts,
    latest: int,
    operating: FinancialYear | DatedFinancialYear,
    loan: ProposedLoan | AssessmentLoan,
) -> None:
    """One current-facts calculation for observed and projected operating contexts."""
    current_prefix = f"years.{latest}."
    eb = _finite(facts.rows[current_prefix + "ebitda"].raw_value)

    monthly, annual = _loan_payment(loan.amount, loan.annual_rate, loan.term_months)
    loan_operands = [
        facts.input("/proposed_loan/amount", loan.amount),
        facts.input("/proposed_loan/annual_rate", loan.annual_rate, "decimal_nominal_annual_rate"),
        facts.input("/proposed_loan/term_months", loan.term_months, "months"),
    ]
    facts.add(
        "current.proposed_monthly_payment",
        "amortized-payment-v2",
        "zero principal: 0; zero rate: amount / term_months; otherwise amount * (annual_rate / 12) / (1 - (1 + annual_rate / 12) ** -term_months)",
        loan_operands,
        monthly,
        "USD/month",
    )
    facts.add(
        "current.proposed_annual_payment",
        "annualized-payment-v2",
        "proposed_monthly_payment * 12",
        [facts.fact("current.proposed_monthly_payment")],
        annual,
        "USD/year",
    )
    interest = operating.interest_expense
    debt = _debt_service(interest, req.existing_debt.cpltd_annual, annual)
    facts.add(
        "current.debt_service",
        "annual-debt-service-v2",
        "existing_interest + cpltd_annual + proposed_annual_payment (left to right)",
        [
            facts.input(f"/years/{latest}/interest_expense", interest),
            facts.input("/existing_debt/cpltd_annual", req.existing_debt.cpltd_annual, "USD/year"),
            facts.fact("current.proposed_annual_payment"),
        ],
        debt,
        "USD/year",
        report_signs=(1, 1, 1),
    )
    fixed = debt + req.existing_debt.operating_lease_annual
    facts.add(
        "current.fixed_charge_service",
        "fixed-charge-service-v2",
        "debt_service + operating_lease_annual",
        [
            facts.fact("current.debt_service"),
            facts.input(
                "/existing_debt/operating_lease_annual", req.existing_debt.operating_lease_annual, "USD/year"
            ),
        ],
        fixed,
        "USD/year",
        report_signs=(1, 1),
    )

    weighted, outside, personal, contributions = _global_details(eb, req.guarantors)
    for index, (business, income, debt_amount) in enumerate(contributions):
        g, prefix, path = req.guarantors[index], f"current.guarantors.{index}.", f"/guarantors/{index}/"
        facts.add(
            prefix + "business_ebitda",
            "ownership-weighted-ebitda-v2",
            "ebitda * ownership_percentage",
            [
                facts.fact(current_prefix + "ebitda"),
                facts.input(path + "ownership_percentage", g.ownership_percentage, "fraction"),
            ],
            business,
        )
        facts.add(
            prefix + "outside_income",
            "guarantor-outside-income-v2",
            "wages + interest_dividend_income",
            [
                facts.input(path + "wages", g.wages),
                facts.input(path + "interest_dividend_income", g.interest_dividend_income),
            ],
            income,
            "USD/year",
            report_signs=(1, 1),
        )
        facts.add(
            prefix + "personal_debt",
            "guarantor-personal-debt-v2",
            "mortgage_pi_annual + auto_loan_annual + credit_card_min_annual (left to right)",
            [
                facts.input(path + name, getattr(g, name), "USD/year")
                for name in ("mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual")
            ],
            debt_amount,
            "USD/year",
            report_signs=(1, 1, 1),
        )
    for name, value in (
        ("business_ebitda", weighted),
        ("outside_income", outside),
        ("personal_debt", personal),
    ):
        ops = [facts.fact(f"current.guarantors.{index}.{name}") for index in range(len(contributions))]
        expression = "sum contributions in supplied guarantor order, starting at Decimal zero"
        if name == "business_ebitda" and not contributions:
            ops = [facts.fact(current_prefix + "ebitda")]
            expression = "no guarantors: full business EBITDA"
        facts.add(
            "current.global_" + name,
            "global-" + name.replace("_", "-") + "-v2",
            expression,
            ops,
            value,
            "USD/year",
            report_signs=[1] * len(ops),
        )
        if contributions:
            keys = [f"current.guarantors.{index}.{name}" for index in range(len(contributions))]
            allocated = reconcile([_finite(facts.rows[key].raw_value) for key in keys], value)
            for key, reported in zip(keys, allocated, strict=True):
                facts.rows[key] = replace(facts.rows[key], reported_value=reported)

    numerator = weighted + outside
    denominator = debt + personal
    facts.add(
        "current.global_cash_flow",
        "global-cash-flow-v2",
        "global_business_ebitda + global_outside_income",
        [facts.fact("current.global_business_ebitda"), facts.fact("current.global_outside_income")],
        numerator,
        report_signs=(1, 1),
    )
    facts.add(
        "current.global_debt_service",
        "global-debt-service-v2",
        "debt_service + global_personal_debt",
        [facts.fact("current.debt_service"), facts.fact("current.global_personal_debt")],
        denominator,
        "USD/year",
        report_signs=(1, 1),
    )
    for name, numerator_id, denominator_id in (
        ("dscr", current_prefix + "ebitda", "current.debt_service"),
        ("fccr", current_prefix + "ebitda", "current.fixed_charge_service"),
        ("global_dscr", "current.global_cash_flow", "current.global_debt_service"),
    ):
        n, d = _finite(facts.rows[numerator_id].raw_value), _finite(facts.rows[denominator_id].raw_value)
        coverage = _coverage(n, d)
        facts.add(
            "current." + name,
            name.replace("_", "-") + "-v2",
            "numerator / denominator; zero denominator is not applicable",
            [facts.fact(numerator_id), facts.fact(denominator_id)],
            coverage,
            "ratio",
            4,
            "No debt service" if d == 0 else None,
        )

    wc = req.working_capital
    net, cash = _cash_flow(eb, wc)
    facts.add(
        "current.net_working_capital_increase",
        "net-working-capital-v2",
        "ar_increase + inventory_increase - ap_increase (left to right)",
        [
            facts.input("/working_capital/" + name, getattr(wc, name))
            for name in ("ar_increase", "inventory_increase", "ap_increase")
        ],
        net,
        report_signs=(1, 1, -1),
    )
    facts.add(
        "current.uca_cash_flow",
        "uca-cash-flow-v2",
        "ebitda - cash_taxes_paid - net_working_capital_increase (left to right)",
        [
            facts.fact(current_prefix + "ebitda"),
            facts.input("/working_capital/cash_taxes_paid", wc.cash_taxes_paid),
            facts.fact("current.net_working_capital_increase"),
        ],
        cash,
        report_signs=(1, -1, -1),
    )


@calculation
def consumer_dti(
    gross_monthly_income: NumericInput,
    housing_pi: NumericInput,
    housing_tax_ins: NumericInput,
    other_monthly_debt: NumericInput,
) -> tuple[Decimal, Decimal]:
    income, pi, tax_ins, other = (
        as_decimal(value) for value in (gross_monthly_income, housing_pi, housing_tax_ins, other_monthly_debt)
    )
    if income <= ZERO:
        raise ValueError("gross_monthly_income must be positive")
    if min(pi, tax_ins, other) < ZERO:
        raise ValueError("Consumer debt components must be nonnegative")
    housing = pi + tax_ins
    return _finite(housing / income), _finite((housing + other) / income)
