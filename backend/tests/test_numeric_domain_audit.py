from __future__ import annotations

import math
from decimal import Decimal, localcontext
from random import Random
from typing import Callable

import pytest
from app.core import amortized_annual_debt_service, consumer_dti, dscr, fccr, global_dscr
from app.schemas import ExistingDebt, FinancialYear, Guarantor, ProposedLoan


def financial_year(gross_receipts: float = 100_000) -> FinancialYear:
    return FinancialYear(
        gross_receipts=gross_receipts,
        cogs=0,
        operating_expense_excl_dna_interest_comp=0,
        officer_compensation=0,
        depreciation=0,
        amortization=0,
        interest_expense=0,
    )


def zero_loan() -> ProposedLoan:
    return ProposedLoan(amount=0, annual_rate=0, term_months=12)


@pytest.mark.parametrize("term", [True, False, 0.5, 12.5, 359.75])
def test_amortization_rejects_boolean_or_fractional_terms(term: int | float) -> None:
    with pytest.raises(ValueError):
        amortized_annual_debt_service(100_000, 0.05, term)  # type: ignore[arg-type]


@pytest.mark.parametrize("principal", [True, False])
def test_amortization_rejects_boolean_principal(principal: bool) -> None:
    with pytest.raises(ValueError):
        amortized_annual_debt_service(principal, 0.05, 120)


@pytest.mark.parametrize("rate", [True, False])
def test_amortization_rejects_boolean_rate(rate: bool) -> None:
    with pytest.raises(ValueError):
        amortized_annual_debt_service(100_000, rate, 120)


def test_amortization_reports_enormous_integer_term_as_domain_error() -> None:
    with pytest.raises(ValueError):
        amortized_annual_debt_service(100_000, 0.05, 10**400)


@pytest.mark.parametrize("coverage", [dscr, fccr], ids=["dscr", "fccr"])
def test_business_coverage_rejects_negative_denominator(
    coverage: Callable[[FinancialYear, ExistingDebt, ProposedLoan], Decimal | None],
) -> None:
    existing = ExistingDebt(cpltd_annual=0).model_copy(update={"cpltd_annual": -1_000})
    with pytest.raises(ValueError):
        coverage(financial_year(), existing, zero_loan())


def test_fixed_charge_coverage_rejects_negative_total_after_lease() -> None:
    existing = ExistingDebt(cpltd_annual=1_000).model_copy(
        update={"operating_lease_annual": -2_000}
    )
    with pytest.raises(ValueError):
        fccr(financial_year(), existing, zero_loan())


def test_global_coverage_rejects_negative_business_debt() -> None:
    existing = ExistingDebt(cpltd_annual=0).model_copy(update={"cpltd_annual": -1_000})
    with pytest.raises(ValueError):
        global_dscr(financial_year(), existing, zero_loan(), [])


@pytest.mark.parametrize("field", ["mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual"])
def test_global_coverage_rejects_negative_total_after_personal_debt(field: str) -> None:
    guarantor = Guarantor().model_copy(update={field: -2_000})
    with pytest.raises(ValueError):
        global_dscr(financial_year(), ExistingDebt(cpltd_annual=1_000), zero_loan(), [guarantor])


@pytest.mark.parametrize("coverage", [dscr, fccr], ids=["dscr", "fccr"])
def test_zero_business_debt_has_explicit_unavailable_result(
    coverage: Callable[[FinancialYear, ExistingDebt, ProposedLoan], Decimal | None],
) -> None:
    assert coverage(financial_year(), ExistingDebt(cpltd_annual=0), zero_loan()) is None


def test_zero_global_debt_has_explicit_unavailable_result() -> None:
    assert global_dscr(financial_year(), ExistingDebt(cpltd_annual=0), zero_loan(), []) is None


@pytest.mark.parametrize("coverage", [dscr, fccr], ids=["dscr", "fccr"])
def test_negative_earnings_are_valid_with_positive_business_debt(
    coverage: Callable[[FinancialYear, ExistingDebt, ProposedLoan], Decimal | None],
) -> None:
    assert coverage(financial_year(-100_000), ExistingDebt(cpltd_annual=1_000), zero_loan()) == -100


def test_negative_earnings_are_valid_with_positive_global_debt() -> None:
    assert global_dscr(financial_year(-100_000), ExistingDebt(cpltd_annual=1_000), zero_loan(), []) == -100


@pytest.mark.parametrize("position", [1, 2, 3], ids=["housing-pi", "housing-tax-ins", "other-debt"])
def test_consumer_dti_rejects_negative_debt_components(position: int) -> None:
    values = [5_000.0, 1_000.0, 200.0, 500.0]
    values[position] = -1.0
    with pytest.raises(ValueError):
        consumer_dti(*values)


@pytest.mark.parametrize("position", range(4), ids=["income", "housing-pi", "housing-tax-ins", "other-debt"])
@pytest.mark.parametrize("invalid", [math.inf, -math.inf, math.nan], ids=["inf", "negative-inf", "nan"])
def test_consumer_dti_rejects_every_nonfinite_input(position: int, invalid: float) -> None:
    values = [5_000.0, 1_000.0, 200.0, 500.0]
    values[position] = invalid
    with pytest.raises(ValueError):
        consumer_dti(*values)


def test_generated_zero_interest_payments_reconcile_to_annual_principal_share() -> None:
    rng = Random(20261014)
    with localcontext() as reference:
        reference.prec = 80
        for _ in range(64):
            principal = Decimal(str(rng.randrange(0, 100_000_000))) / Decimal("100")
            term = rng.randrange(1, 601)
            expected = principal * Decimal("12") / term
            actual = amortized_annual_debt_service(principal, Decimal("0"), term)
            assert isinstance(actual, Decimal)
            assert abs(actual - expected) <= Decimal("1e-24")


def test_generated_amortizing_payments_match_independent_decimal_reference() -> None:
    rng = Random(5117)
    with localcontext() as context:
        context.prec = 80
        for _ in range(64):
            principal = Decimal(str(rng.randrange(1, 100_000_000))) / Decimal("100")
            annual_rate = Decimal(str(rng.randrange(1, 3001))) / Decimal("10000")
            term = rng.randrange(1, 601)
            monthly_rate = annual_rate / Decimal("12")
            expected = principal * monthly_rate / (
                Decimal("1") - (Decimal("1") + monthly_rate) ** -term
            ) * Decimal("12")
            annual = amortized_annual_debt_service(principal, annual_rate, term)
            assert isinstance(annual, Decimal) and annual.is_finite() and annual > 0
            assert abs(annual - expected) <= Decimal("1e-24")


def test_generated_consumer_debt_identities_and_monotonicity() -> None:
    rng = Random(10029)
    with localcontext() as reference:
        reference.prec = 80
        for _ in range(64):
            income = Decimal(str(rng.randrange(1, 10_000_000))) / Decimal("100")
            housing_pi = Decimal(str(rng.randrange(0, 1_000_000))) / Decimal("100")
            housing_tax_ins = Decimal(str(rng.randrange(0, 100_000))) / Decimal("100")
            other_debt = Decimal(str(rng.randrange(0, 1_000_000))) / Decimal("100")
            front, back = consumer_dti(income, housing_pi, housing_tax_ins, other_debt)
            assert isinstance(front, Decimal) and isinstance(back, Decimal)
            assert front.is_finite() and back.is_finite()
            assert 0 <= front <= back
            assert abs(front * income - housing_pi - housing_tax_ins) <= Decimal("1e-24")
            assert abs(back * income - housing_pi - housing_tax_ins - other_debt) <= Decimal("1e-24")
            increased_front, increased_back = consumer_dti(income, housing_pi, housing_tax_ins, other_debt + 100)
            assert increased_front == front
            assert increased_back >= back
