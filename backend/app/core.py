from __future__ import annotations
from dataclasses import dataclass
from math import expm1, isfinite, log1p
from typing import TYPE_CHECKING
from .schemas import CommercialRequest, FinancialYear, ExistingDebt, ProposedLoan, Guarantor, WorkingCapital

if TYPE_CHECKING:
    from .assessment_contracts import CommercialAssessmentRequest

CALCULATION_VERSION = "commercial-calculation-v1"


@dataclass(frozen=True)
class Operand:
    reference_type: str
    reference: str
    raw_value: float | int | str | None
    unit: str


@dataclass(frozen=True)
class Calculation:
    fact_id: str
    definition_id: str
    expression: str
    operands: tuple[Operand, ...]
    raw_value: float | str | None
    unit: str
    display_precision: int | None
    status: str = "available"
    explanation: str | None = None


class _Facts:
    """Record operands at calculation time; consumers never recompute a trace."""
    def __init__(self, *, fact_reference=None, input_reference=None):
        self.rows: dict[str, Calculation] = {}
        self.fact_reference = fact_reference or (lambda name: name)
        self.input_reference = input_reference or (lambda path: path)

    def input(self, path, value, unit="USD") -> Operand:
        return Operand("input", self.input_reference(path), value, unit)

    def fact(self, name) -> Operand:
        row = self.rows[name]
        return Operand("fact", row.fact_id, row.raw_value, row.unit)

    def add(self, name, definition, expression, operands, value, unit="USD", precision=2, explanation=None):
        if isinstance(value, (float, int)):
            _finite(value)
        row = Calculation(self.fact_reference(name), definition, expression, tuple(operands), value, unit, precision,
                          "not_applicable" if value is None else "available", explanation)
        self.rows[name] = row
        return value


@dataclass(frozen=True)
class CommercialFacts:
    current: dict[str, Calculation]
    history: tuple[dict[str, Calculation], ...]
    trace: tuple[Calculation, ...]


def _year_income(year, facts: _Facts, index: int, include_ebitda=True):
    prefix, path = f"years.{index}.", f"/years/{index}/"
    inp = lambda name: facts.input(path + name, getattr(year, name))
    gross = facts.add(prefix + "gross_profit", "gross-profit-v1", "gross_receipts - cogs",
                      [inp("gross_receipts"), inp("cogs")], year.gross_receipts - year.cogs)
    names = ("operating_expense_excl_dna_interest_comp", "officer_compensation", "depreciation",
             "amortization", "interest_expense", "section_179")
    obi = _finite(gross - year.operating_expense_excl_dna_interest_comp - year.officer_compensation
                  - year.depreciation - year.amortization - year.interest_expense - year.section_179)
    facts.add(prefix + "ordinary_business_income", "ordinary-business-income-v1",
              "gross_profit - operating_expense_excl_dna_interest_comp - officer_compensation - depreciation - amortization - interest_expense - section_179 (left to right)",
              [facts.fact(prefix + "gross_profit"), *(inp(name) for name in names)], obi)
    if include_ebitda:
        value = _finite(obi + year.interest_expense + year.depreciation + year.amortization + year.section_179)
        facts.add(prefix + "ebitda", "ebitda-v1", "ordinary_business_income + interest_expense + depreciation + amortization + section_179 (left to right)",
                  [facts.fact(prefix + "ordinary_business_income"), *(inp(name) for name in ("interest_expense", "depreciation", "amortization", "section_179"))], value)
    return obi


def _finite(value: float) -> float:
    if not isfinite(value):
        raise ValueError("Inputs exceed the supported finite calculation range")
    return value


def _coverage(numerator: float, denominator: float) -> float:
    _finite(numerator)
    _finite(denominator)
    return float("inf") if denominator == 0 else _finite(numerator / denominator)


def ordinary_business_income(year: FinancialYear) -> float:
    return _year_income(year, _Facts(), 0, include_ebitda=False)


def ebitda(year: FinancialYear) -> float:
    facts = _Facts()
    _year_income(year, facts, 0)
    return facts.rows["years.0.ebitda"].raw_value


def amortized_annual_debt_service(principal: float, annual_rate: float, term_months: int) -> float:
    return _loan_payment(principal, annual_rate, term_months)[1]


def _loan_payment(principal: float, annual_rate: float, term_months: int) -> tuple[float, float]:
    if not all(isfinite(v) for v in (principal, annual_rate, term_months)) or principal < 0 or annual_rate < 0 or term_months <= 0:
        raise ValueError("Loan principal/rate must be nonnegative and term positive")
    if principal == 0: return 0.0, 0.0
    if annual_rate == 0:
        monthly = _finite(principal / term_months)
        return monthly, _finite(monthly * 12)
    r = annual_rate / 12
    if r == 0:
        monthly = _finite(principal / term_months)
        return monthly, _finite(monthly * 12)
    # Avoid cancellation when 1 + r rounds to 1 for very small rates.
    monthly = _finite(principal * (r / -expm1(-term_months * log1p(r))))
    return monthly, _finite(monthly * 12)


def uca_cash_flow(year: FinancialYear, wc: WorkingCapital) -> float:
    return _cash_flow(ebitda(year), wc)[1]


def _cash_flow(operating_ebitda, wc):
    net_wc_increase = wc.ar_increase + wc.inventory_increase - wc.ap_increase
    return net_wc_increase, _finite(operating_ebitda - wc.cash_taxes_paid - net_wc_increase)


def debt_service(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> float:
    return _debt_service(year.interest_expense, existing.cpltd_annual,
                         amortized_annual_debt_service(proposed.amount, proposed.annual_rate, proposed.term_months))


def _debt_service(interest, cpltd, proposed_annual):
    return _finite(interest + cpltd + proposed_annual)


def dscr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> float:
    den = debt_service(year, existing, proposed)
    return _coverage(ebitda(year), den)


def fccr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> float:
    den = debt_service(year, existing, proposed) + existing.operating_lease_annual
    return _coverage(ebitda(year), den)


def global_dscr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan, guarantors: list[Guarantor]) -> float:
    business_tds = debt_service(year, existing, proposed)
    operating_ebitda = ebitda(year)
    weighted, outside, personal, _ = _global_details(operating_ebitda, guarantors)
    return _coverage(weighted + outside, business_tds + personal)


def _global_details(operating_ebitda, guarantors):
    weighted_business_ebitda = 0.0
    outside_income = 0.0
    personal_debt = 0.0
    contributions = []
    for g in guarantors:
        business = operating_ebitda * g.ownership_percentage
        income = g.wages + g.interest_dividend_income
        debt = g.mortgage_pi_annual + g.auto_loan_annual + g.credit_card_min_annual
        contributions.append((business, income, debt))
        weighted_business_ebitda += business
        outside_income += income
        personal_debt += debt
    if not guarantors: weighted_business_ebitda = operating_ebitda
    return weighted_business_ebitda, outside_income, personal_debt, contributions


def k1_distribution_ratio(year: FinancialYear) -> float:
    return _distribution_ratio(ordinary_business_income(year), year.k1_distribution)


def _distribution_ratio(ordinary_income, distribution):
    return float("inf") if ordinary_income <= 0 else distribution / ordinary_income


def k1_history_flag(years: list[FinancialYear], stability_band: float = 0.15) -> str:
    if len(years) < 2: return "insufficient_history"
    ratios = [k1_distribution_ratio(y) for y in years[-2:]]
    return _history_flag(ratios, stability_band)


def _history_flag(ratios, stability_band):
    return _history_comparison(ratios, stability_band)[0]


def _history_comparison(ratios, stability_band):
    if len(ratios) < 2: return "insufficient_history", None
    if not all(isfinite(r) for r in ratios): return "unstable", None
    difference = abs(ratios[0] - ratios[1])
    return ("stable" if difference <= stability_band else "unstable"), difference


def commercial_facts(req: CommercialRequest | CommercialAssessmentRequest, stability_band: float, *, history_indices=None, include_spread=False) -> CommercialFacts:
    """Shared commercial arithmetic for legacy decisions and dated assessments.

    Dated callers select comparable history explicitly. Legacy callers calculate
    only the current financials and the OBI needed by their existing K-1 rule.
    """
    facts = _Facts()
    latest = len(req.years) - 1
    selected = list(range(max(0, latest - 1), latest + 1)) if history_indices is None else list(history_indices)
    needed = set(range(len(req.years))) if include_spread else {latest, *(selected if len(selected) >= 2 else [])}
    for index in sorted(needed):
        _year_income(req.years[index], facts, index, include_ebitda=include_spread or index == latest)
    current_prefix = f"years.{latest}."
    _current_commercial_facts(req, facts, latest, req.years[latest], req.proposed_loan)

    ratios = {}
    for index in sorted(needed):
        if not include_spread and len(selected) < 2:
            continue
        obi = facts.rows[f"years.{index}.ordinary_business_income"].raw_value
        value = _distribution_ratio(obi, req.years[index].k1_distribution)
        if include_spread and obi > 0:
            _finite(value)
        ratios[index] = value
        facts.add(f"years.{index}.k1_distribution_ratio", "k1-distribution-ratio-v1", "k1_distribution / ordinary_business_income; nonpositive income is not applicable",
                  [facts.input(f"/years/{index}/k1_distribution", req.years[index].k1_distribution), facts.fact(f"years.{index}.ordinary_business_income")],
                  value if isfinite(value) else None, "ratio", 4,
                  "Nonpositive ordinary business income" if obi <= 0 else "Ratio exceeds the finite calculation range" if not isfinite(value) else None)
    flag, difference = _history_comparison([ratios[i] for i in selected] if len(selected) >= 2 else [], stability_band)
    if include_spread and difference is not None:
        _finite(difference)
    unavailable = ("Fewer than two comparable periods" if len(selected) < 2
                   else "An unavailable distribution ratio" if difference is None
                   else "Difference exceeds the finite calculation range" if not isfinite(difference) else None)
    facts.add("current.k1_ratio_difference", "k1-stability-difference-v1", "abs(previous_ratio - latest_ratio) when two comparable ratios are available",
              [facts.fact(f"years.{i}.k1_distribution_ratio") for i in selected if i in ratios],
              difference if difference is not None and isfinite(difference) else None, "ratio", 4, unavailable)
    history_operands = [facts.fact("current.k1_ratio_difference")]
    history_operands.append(Operand("policy", "/policy_snapshot/k1_stability_band", stability_band, "ratio"))
    facts.add("current.k1_history", "k1-history-v1",
              "fewer than two selected periods: insufficient_history; unavailable ratio: unstable; otherwise abs(previous_ratio - latest_ratio) <= stability_band is stable",
              history_operands, flag, "category", None)

    current = {name.removeprefix("current."): row for name, row in facts.rows.items() if name.startswith("current.") and not name.startswith("current.guarantors.")}
    current.update(ordinary_business_income=facts.rows[current_prefix + "ordinary_business_income"], ebitda=facts.rows[current_prefix + "ebitda"])
    history = tuple({name: facts.rows[f"years.{i}.{name}"] for name in ("ordinary_business_income", "ebitda", "k1_distribution_ratio")}
                    for i in range(len(req.years))) if include_spread else ()
    return CommercialFacts(current, history, tuple(facts.rows.values()))


def projected_commercial_facts(req, operating, loan, *, retained_trace, assumption_trace) -> CommercialFacts:
    """Projected current context with retained observed history supplied before decisions."""
    latest = len(req.years) - 1
    year_prefix, year_path = f"years.{latest}.", f"/years/{latest}/"

    def fact_reference(name):
        if name.startswith(year_prefix):
            return "projection.operating." + name.removeprefix(year_prefix)
        return "projection." + name

    def input_reference(path):
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
    current = {name.removeprefix("current."): row for name, row in facts.rows.items()
               if name.startswith("current.") and not name.startswith("current.guarantors.")}
    current.update(ordinary_business_income=facts.rows[year_prefix + "ordinary_business_income"],
                   ebitda=facts.rows[year_prefix + "ebitda"],
                   k1_history=observed["baseline.current.k1_history"],
                   k1_ratio_difference=observed["baseline.current.k1_ratio_difference"])
    return CommercialFacts(current, (), tuple(facts.rows.values()))


def _current_commercial_facts(req, facts, latest, operating, loan):
    """One current-facts calculation for observed and projected operating contexts."""
    current_prefix = f"years.{latest}."
    eb = facts.rows[current_prefix + "ebitda"].raw_value

    monthly, annual = _loan_payment(loan.amount, loan.annual_rate, loan.term_months)
    loan_operands = [facts.input("/proposed_loan/amount", loan.amount),
                     facts.input("/proposed_loan/annual_rate", loan.annual_rate, "decimal_nominal_annual_rate"),
                     facts.input("/proposed_loan/term_months", loan.term_months, "months")]
    facts.add("current.proposed_monthly_payment", "amortized-payment-v1",
              "zero principal: 0; zero/underflowed rate: amount / term_months; otherwise amount * ((annual_rate / 12) / -expm1(-term_months * log1p(annual_rate / 12)))",
              loan_operands, monthly, "USD/month")
    facts.add("current.proposed_annual_payment", "annualized-payment-v1", "proposed_monthly_payment * 12",
              [facts.fact("current.proposed_monthly_payment")], annual, "USD/year")
    interest = operating.interest_expense
    debt = _debt_service(interest, req.existing_debt.cpltd_annual, annual)
    facts.add("current.debt_service", "annual-debt-service-v1", "existing_interest + cpltd_annual + proposed_annual_payment (left to right)",
              [facts.input(f"/years/{latest}/interest_expense", interest),
               facts.input("/existing_debt/cpltd_annual", req.existing_debt.cpltd_annual, "USD/year"),
               facts.fact("current.proposed_annual_payment")], debt, "USD/year")
    fixed = debt + req.existing_debt.operating_lease_annual
    facts.add("current.fixed_charge_service", "fixed-charge-service-v1", "debt_service + operating_lease_annual",
              [facts.fact("current.debt_service"), facts.input("/existing_debt/operating_lease_annual", req.existing_debt.operating_lease_annual, "USD/year")], fixed, "USD/year")

    weighted, outside, personal, contributions = _global_details(eb, req.guarantors)
    for index, (business, income, debt_amount) in enumerate(contributions):
        g, prefix, path = req.guarantors[index], f"current.guarantors.{index}.", f"/guarantors/{index}/"
        facts.add(prefix + "business_ebitda", "ownership-weighted-ebitda-v1", "ebitda * ownership_percentage",
                  [facts.fact(current_prefix + "ebitda"), facts.input(path + "ownership_percentage", g.ownership_percentage, "fraction")], business)
        facts.add(prefix + "outside_income", "guarantor-outside-income-v1", "wages + interest_dividend_income",
                  [facts.input(path + "wages", g.wages), facts.input(path + "interest_dividend_income", g.interest_dividend_income)], income, "USD/year")
        facts.add(prefix + "personal_debt", "guarantor-personal-debt-v1", "mortgage_pi_annual + auto_loan_annual + credit_card_min_annual (left to right)",
                  [facts.input(path + name, getattr(g, name), "USD/year") for name in ("mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual")], debt_amount, "USD/year")
    for name, value in (("business_ebitda", weighted), ("outside_income", outside), ("personal_debt", personal)):
        ops = [facts.fact(f"current.guarantors.{index}.{name}") for index in range(len(contributions))]
        expression = "sum contributions in supplied guarantor order, starting at 0.0"
        if name == "business_ebitda" and not contributions:
            ops = [facts.fact(current_prefix + "ebitda")]
            expression = "no guarantors: full business EBITDA"
        facts.add("current.global_" + name, "global-" + name.replace("_", "-") + "-v1", expression, ops, value, "USD/year")
    numerator = weighted + outside
    denominator = debt + personal
    facts.add("current.global_cash_flow", "global-cash-flow-v1", "global_business_ebitda + global_outside_income",
              [facts.fact("current.global_business_ebitda"), facts.fact("current.global_outside_income")], numerator)
    facts.add("current.global_debt_service", "global-debt-service-v1", "debt_service + global_personal_debt",
              [facts.fact("current.debt_service"), facts.fact("current.global_personal_debt")], denominator, "USD/year")
    for name, numerator_id, denominator_id in (
        ("dscr", current_prefix + "ebitda", "current.debt_service"),
        ("fccr", current_prefix + "ebitda", "current.fixed_charge_service"),
        ("global_dscr", "current.global_cash_flow", "current.global_debt_service"),
    ):
        n, d = facts.rows[numerator_id].raw_value, facts.rows[denominator_id].raw_value
        value = _coverage(n, d)
        facts.add("current." + name, name.replace("_", "-") + "-v1", "numerator / denominator; zero denominator is not applicable",
                  [facts.fact(numerator_id), facts.fact(denominator_id)], value if isfinite(value) else None,
                  "ratio", 4, "No debt service" if d == 0 else None)

    wc = req.working_capital
    net, cash = _cash_flow(eb, wc)
    facts.add("current.net_working_capital_increase", "net-working-capital-v1", "ar_increase + inventory_increase - ap_increase (left to right)",
              [facts.input("/working_capital/" + name, getattr(wc, name)) for name in ("ar_increase", "inventory_increase", "ap_increase")], net)
    facts.add("current.uca_cash_flow", "uca-cash-flow-v1", "ebitda - cash_taxes_paid - net_working_capital_increase (left to right)",
              [facts.fact(current_prefix + "ebitda"), facts.input("/working_capital/cash_taxes_paid", wc.cash_taxes_paid), facts.fact("current.net_working_capital_increase")], cash)


def consumer_dti(gross_monthly_income: float, housing_pi: float, housing_tax_ins: float, other_monthly_debt: float) -> tuple[float, float]:
    if gross_monthly_income <= 0: raise ValueError("gross_monthly_income must be positive")
    housing = housing_pi + housing_tax_ins
    return _finite(housing / gross_monthly_income), _finite((housing + other_monthly_debt) / gross_monthly_income)
