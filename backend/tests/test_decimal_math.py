from decimal import Decimal, DivisionByZero, InvalidOperation, Overflow, getcontext

import pytest


def test_decimal_boundary_preserves_digits_and_rejects_nonfinite_and_underflow():
    from app.finance import as_decimal

    assert as_decimal("10000000000000000.01") == Decimal("10000000000000000.01")
    for value in (True, "NaN", "Infinity", "1e-400", "1e1000000"):
        with pytest.raises(ValueError):
            as_decimal(value)


def test_context_is_isolated_and_traps_invalid_operations():
    from app.finance import financial_context

    original = getcontext().copy()
    with financial_context() as context:
        assert context.traps[DivisionByZero]
        assert context.traps[InvalidOperation]
        assert context.traps[Overflow]
        assert context.prec >= 64
    assert getcontext().prec == original.prec
    assert getcontext().traps == original.traps


def test_half_even_reporting_and_residual_cent_allocation():
    from app.finance import quantize, reconcile

    assert quantize(Decimal("2.675"), 2) == Decimal("2.68")
    assert quantize(Decimal("2.685"), 2) == Decimal("2.68")
    values = [Decimal("0.0034"), Decimal("0.0033"), Decimal("0.0033")]
    assert reconcile(values) == [Decimal("0.01"), Decimal("0.00"), Decimal("0.00")]
    assert sum(reconcile(values), Decimal("0")) == quantize(sum(values, Decimal("0")), 2)


def test_declared_maximum_rate_and_term_do_not_underflow():
    from app.core import amortized_annual_debt_service

    value = amortized_annual_debt_service("10000000000000000.01", "1", 12000)
    assert value.is_finite()
    assert abs(value - Decimal("10000000000000000.01")) < Decimal("1e-24")


def test_numeric_metrics_cannot_silently_accept_nan_categories_or_missing_reports():
    import pytest
    from app.assessment_contracts import Metric
    from pydantic import ValidationError

    base = dict(
        fact_id="current.dscr",
        raw_value="1.25",
        reported_value="1.2500",
        unit="ratio",
        display_precision=4,
        status="available",
        explanation=None,
    )
    for changed in (
        {"raw_value": "NaN"},
        {"raw_value": "stable"},
        {"reported_value": None},
        {"raw_value": None},
        {"status": "not_applicable"},
    ):
        with pytest.raises(ValidationError):
            Metric.model_validate({**base, **changed})


def test_v2_model_json_cannot_round_a_numeric_token_before_decimal_validation():
    import json
    from pathlib import Path

    from app.assessment_contracts import CommercialAssessmentRequest
    from pydantic import ValidationError

    data = json.loads((Path(__file__).parents[1] / "fixtures/alpine_dated.json").read_text())
    data = CommercialAssessmentRequest.model_validate_json(json.dumps(data)).model_dump(mode="json")
    data["years"][-1]["gross_receipts"] = "UNQUOTED_GROSS"
    text = json.dumps(data).replace('"UNQUOTED_GROSS"', "10000000000000000.01")
    assert json.loads(text, parse_float=Decimal)["years"][-1]["gross_receipts"] == Decimal(
        "10000000000000000.01"
    )
    with pytest.raises(ValidationError):
        CommercialAssessmentRequest.model_validate_json(text)
