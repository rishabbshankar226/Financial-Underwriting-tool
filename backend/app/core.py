from __future__ import annotations
from math import expm1, isfinite, log1p
from .schemas import FinancialYear, ExistingDebt, ProposedLoan, Guarantor, WorkingCapital


def _finite(value: float) -> float:
    if not isfinite(value):
        raise ValueError("Inputs exceed the supported finite calculation range")
    return value


def _coverage(numerator: float, denominator: float) -> float:
    _finite(numerator)
    _finite(denominator)
    return float("inf") if denominator == 0 else _finite(numerator / denominator)


def ordinary_business_income(year: FinancialYear) -> float:
    gross_profit = year.gross_receipts - year.cogs
    return _finite(gross_profit - year.operating_expense_excl_dna_interest_comp - year.officer_compensation - year.depreciation - year.amortization - year.interest_expense - year.section_179)


def ebitda(year: FinancialYear) -> float:
    return _finite(ordinary_business_income(year) + year.interest_expense + year.depreciation + year.amortization + year.section_179)


def amortized_annual_debt_service(principal: float, annual_rate: float, term_months: int) -> float:
    if not all(isfinite(v) for v in (principal, annual_rate, term_months)) or principal < 0 or annual_rate < 0 or term_months <= 0:
        raise ValueError("Loan principal/rate must be nonnegative and term positive")
    if principal == 0: return 0.0
    if annual_rate == 0: return _finite(principal / term_months * 12)
    r = annual_rate / 12
    if r == 0: return _finite(principal / term_months * 12)
    # Avoid cancellation when 1 + r rounds to 1 for very small rates.
    return _finite(principal * (r / -expm1(-term_months * log1p(r))) * 12)


def uca_cash_flow(year: FinancialYear, wc: WorkingCapital) -> float:
    net_wc_increase = wc.ar_increase + wc.inventory_increase - wc.ap_increase
    return _finite(ebitda(year) - wc.cash_taxes_paid - net_wc_increase)


def debt_service(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> float:
    return _finite(year.interest_expense + existing.cpltd_annual + amortized_annual_debt_service(proposed.amount, proposed.annual_rate, proposed.term_months))


def dscr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> float:
    den = debt_service(year, existing, proposed)
    return _coverage(ebitda(year), den)


def fccr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan) -> float:
    den = debt_service(year, existing, proposed) + existing.operating_lease_annual
    return _coverage(ebitda(year), den)


def global_dscr(year: FinancialYear, existing: ExistingDebt, proposed: ProposedLoan, guarantors: list[Guarantor]) -> float:
    business_tds = debt_service(year, existing, proposed)
    weighted_business_ebitda = 0.0
    outside_income = 0.0
    personal_debt = 0.0
    for g in guarantors:
        weighted_business_ebitda += ebitda(year) * g.ownership_percentage
        outside_income += g.wages + g.interest_dividend_income
        personal_debt += g.mortgage_pi_annual + g.auto_loan_annual + g.credit_card_min_annual
    if not guarantors: weighted_business_ebitda = ebitda(year)
    den = business_tds + personal_debt
    return _coverage(weighted_business_ebitda + outside_income, den)


def k1_distribution_ratio(year: FinancialYear) -> float:
    obi = ordinary_business_income(year)
    return float("inf") if obi <= 0 else year.k1_distribution / obi


def k1_history_flag(years: list[FinancialYear], stability_band: float = 0.15) -> str:
    if len(years) < 2: return "insufficient_history"
    ratios = [k1_distribution_ratio(y) for y in years[-2:]]
    if not all(isfinite(r) for r in ratios): return "unstable"
    return "stable" if abs(ratios[0] - ratios[1]) <= stability_band else "unstable"


def consumer_dti(gross_monthly_income: float, housing_pi: float, housing_tax_ins: float, other_monthly_debt: float) -> tuple[float, float]:
    if gross_monthly_income <= 0: raise ValueError("gross_monthly_income must be positive")
    housing = housing_pi + housing_tax_ins
    return _finite(housing / gross_monthly_income), _finite((housing + other_monthly_debt) / gross_monthly_income)
