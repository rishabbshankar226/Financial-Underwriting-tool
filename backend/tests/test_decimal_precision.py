from __future__ import annotations

import json
import sqlite3
from concurrent.futures import ThreadPoolExecutor
from decimal import (
    ROUND_HALF_EVEN,
    ROUND_UP,
    Decimal,
    DivisionByZero,
    Inexact,
    InvalidOperation,
    Overflow,
    localcontext,
)
from hashlib import sha256
from pathlib import Path
from random import Random

import pytest
from app.assessment import assess_commercial
from app.assessment_contracts import CommercialAssessmentRequest
from app.cases import CaseStore, serialize_snapshot
from app.config import DEFAULT_POLICY
from app.core import (
    amortized_annual_debt_service,
    consumer_dti,
    debt_service,
    dscr,
    ebitda,
    fccr,
    global_dscr,
    k1_distribution_ratio,
    ordinary_business_income,
    uca_cash_flow,
)
from app.decision import decide_commercial
from app.schemas import (
    CommercialRequest,
    ConsumerRequest,
    ExistingDebt,
    FinancialYear,
    Guarantor,
    ProposedLoan,
    WorkingCapital,
)
from pydantic import ValidationError

ROOT = Path(__file__).resolve().parents[1]
MONEY_FIELDS = (
    "gross_receipts", "cogs", "operating_expense_excl_dna_interest_comp",
    "officer_compensation", "depreciation", "amortization", "interest_expense",
    "section_179", "k1_distribution",
)


def year_data(gross: str = "300000.30", cogs: str = "100000.10", expense: str = "50000.05") -> dict[str, str]:
    data = dict.fromkeys(MONEY_FIELDS, "0")
    data.update(gross_receipts=gross, cogs=cogs, operating_expense_excl_dna_interest_comp=expense)
    return data


def financial_year(gross: str = "300000.30", cogs: str = "100000.10", expense: str = "50000.05") -> FinancialYear:
    return FinancialYear.model_validate(year_data(gross, cogs, expense))


def zero_loan() -> ProposedLoan:
    return ProposedLoan.model_validate({"amount": "0", "annual_rate": "0", "term_months": 12})


def legacy_request(year: FinancialYear, debt: str = "120000.12") -> CommercialRequest:
    return CommercialRequest(
        borrower_name="Synthetic exact arithmetic",
        geography="60601",
        years=[year, year],
        existing_debt=ExistingDebt.model_validate({"cpltd_annual": debt}),
        proposed_loan=zero_loan(),
        working_capital=WorkingCapital(),
    )


def dated_request(gross: str = "300000.30", cogs: str = "100000.10", expense: str = "50000.05") -> CommercialAssessmentRequest:
    data: dict[str, object] = {
        "schema_version": "commercial-assessment-v2",
        "assessment_as_of": "2026-10-06",
        "borrower_name": "Synthetic exact arithmetic",
        "geography": "60601",
        "units": {"currency": "USD", "monetary_unit": "dollars", "annual_rate_unit": "decimal_nominal"},
        "years": [
            {**year_data(gross, cogs, expense), "period_start": f"{year}-01-01", "period_end": f"{year}-12-31"}
            for year in (2024, 2025)
        ],
        "existing_debt": {"cpltd_annual": "120000.12", "operating_lease_annual": "0"},
        "proposed_loan": {
            "amount": "0", "annual_rate": "0.0525", "term_months": 12,
            "rate_type": "fixed", "repayment_type": "fully_amortizing", "payment_frequency": "monthly",
        },
        "guarantors": [],
        "working_capital": {
            "ar_increase": "0", "inventory_increase": "0", "ap_increase": "0", "cash_taxes_paid": "0",
            "period_start": "2025-01-01", "period_end": "2025-12-31",
        },
    }
    return CommercialAssessmentRequest.model_validate_json(json.dumps(data))


def test_financial_models_normalize_exact_decimal_strings() -> None:
    year = financial_year("10000000000000000.01", "10000000000000000.00", "0")
    for name in MONEY_FIELDS:
        assert isinstance(getattr(year, name), Decimal), name
    assert year.gross_receipts == Decimal("10000000000000000.01")
    assert ordinary_business_income(year) == Decimal("0.01")


def test_legacy_numeric_input_is_converted_through_its_decimal_string() -> None:
    data: dict[str, object] = dict(year_data("0.1", "0", "0"))
    data["gross_receipts"] = 0.1
    year = FinancialYear.model_validate(data)
    assert isinstance(year.gross_receipts, Decimal)
    assert year.gross_receipts == Decimal("0.1")
    assert year.gross_receipts.as_tuple() == Decimal("0.1").as_tuple()


def test_money_rates_ownership_and_consumer_inputs_are_decimal() -> None:
    loan = ProposedLoan.model_validate({"amount": "1200.12", "annual_rate": "0.0525", "term_months": 12})
    guarantor = Guarantor.model_validate({"ownership_percentage": "0.34", "wages": "120.15"})
    consumer = ConsumerRequest.model_validate({
        "applicant_name": "Synthetic", "geography": "60601", "gross_monthly_income": "100.00",
        "proposed_housing_pi": "10.10", "proposed_housing_tax_ins": "19.90", "other_monthly_debt": "13.00",
    })
    assert isinstance(loan.amount, Decimal) and isinstance(loan.annual_rate, Decimal)
    assert loan.annual_rate == Decimal("0.0525")
    assert type(loan.term_months) is int
    assert isinstance(guarantor.ownership_percentage, Decimal) and isinstance(guarantor.wages, Decimal)
    for name in ("gross_monthly_income", "proposed_housing_pi", "proposed_housing_tax_ins", "other_monthly_debt"):
        assert isinstance(getattr(consumer, name), Decimal), name


def test_policy_thresholds_and_decision_weights_use_decimal() -> None:
    for name in (
        "commercial_min_dscr", "commercial_min_fccr", "commercial_min_global_dscr",
        "consumer_review_dti", "consumer_decline_dti", "extraction_confidence_threshold",
        "k1_stability_band", "commercial_min_uca_cash_flow",
    ):
        assert isinstance(getattr(DEFAULT_POLICY, name), Decimal), name
    decision = decide_commercial(legacy_request(financial_year()))
    assert isinstance(decision.score, Decimal)
    assert all(isinstance(factor.weight, Decimal) for factor in decision.factors)
    assert sum((factor.weight for factor in decision.factors), Decimal("0")) == Decimal("1.00")


def test_decimal_cancellation_has_no_residual_cash_flow() -> None:
    year = financial_year("1000.30", "1000.10", "0.20")
    assert ordinary_business_income(year) == Decimal("0.00")
    assert ebitda(year) == Decimal("0.00")
    assert uca_cash_flow(year, WorkingCapital()) == Decimal("0.00")


def test_exact_dscr_approval_threshold_is_not_changed_by_binary_roundoff() -> None:
    request = legacy_request(financial_year())
    assert dscr(request.years[-1], request.existing_debt, request.proposed_loan) == Decimal("1.25")
    decision = decide_commercial(request)
    assert decision.outcome == "approve"
    factor = next(factor for factor in decision.factors if factor.name == "dscr")
    assert factor.raw_value == Decimal("1.25") and factor.passed is True


def test_reporting_boundary_uses_decimal_half_even() -> None:
    decision = decide_commercial(legacy_request(financial_year("2.675", "0", "0"), "1"))
    factor = next(factor for factor in decision.factors if factor.name == "uca_positive")
    assert isinstance(factor.value, Decimal)
    assert factor.raw_value == Decimal("2.675")
    assert factor.value == Decimal("2.68")


def test_public_numeric_helpers_return_decimal_without_intermediate_cent_rounding() -> None:
    year = financial_year("2.675", "0", "0")
    existing = ExistingDebt.model_validate({"cpltd_annual": "1"})
    loan = zero_loan()
    for value in (
        ordinary_business_income(year), ebitda(year), uca_cash_flow(year, WorkingCapital()),
        debt_service(year, existing, loan), dscr(year, existing, loan), fccr(year, existing, loan),
        global_dscr(year, existing, loan, []), k1_distribution_ratio(year),
        amortized_annual_debt_service(Decimal("1200.12"), Decimal("0"), 12),
        *consumer_dti(Decimal("100"), Decimal("10.10"), Decimal("19.90"), Decimal("13")),
    ):
        assert isinstance(value, Decimal)
        assert value.is_finite()
    assert ebitda(year) == Decimal("2.675")
    assert consumer_dti(Decimal("100"), Decimal("10.10"), Decimal("19.90"), Decimal("13")) == (
        Decimal("0.30"), Decimal("0.43")
    )


def test_zero_debt_coverage_is_explicitly_unavailable() -> None:
    year = financial_year()
    existing = ExistingDebt.model_validate({"cpltd_annual": "0"})
    assert dscr(year, existing, zero_loan()) is None
    assert fccr(year, existing, zero_loan()) is None
    assert global_dscr(year, existing, zero_loan(), []) is None


def test_dated_contract_is_v2_and_serializes_exact_values_as_strings() -> None:
    result = assess_commercial(dated_request())
    assert result.schema_version == "commercial-assessment-v2"
    assert result.calculation_version == "commercial-calculation-v2"
    assert result.serialization_version == "assessment-json-v2"
    assert result.normalized_input.schema_version == "commercial-assessment-v2"
    wire = json.loads(result.model_dump_json())
    assert wire["current_facts"]["dscr"]["raw_value"] == "1.25"
    assert wire["current_facts"]["dscr"]["reported_value"] == "1.2500"
    assert wire["normalized_input"]["years"][-1]["gross_receipts"] == "300000.3"
    assert wire["normalized_input"]["proposed_loan"]["annual_rate"] == "0.0525"
    assert type(wire["normalized_input"]["proposed_loan"]["term_months"]) is int
    assert isinstance(wire["policy_snapshot"]["commercial_min_dscr"], str)
    assert isinstance(wire["decision"]["score"], str)
    assert all(isinstance(factor["weight"], str) for factor in wire["decision"]["factors"])


def test_v1_numeric_intake_normalizes_to_v2_for_new_calculation() -> None:
    old_json = (ROOT / "fixtures/alpine_dated.json").read_text()
    request = CommercialAssessmentRequest.model_validate_json(old_json)
    assert request.schema_version == "commercial-assessment-v2"
    assert isinstance(request.years[-1].gross_receipts, Decimal)
    result = assess_commercial(request)
    assert result.schema_version == "commercial-assessment-v2"
    assert result.normalized_input.schema_version == "commercial-assessment-v2"
    assert result.current_facts.ebitda.raw_value == Decimal("630000")


def test_dated_metrics_keep_raw_precision_and_report_half_even() -> None:
    result = assess_commercial(dated_request("2.675", "0", "0"))
    metric = result.current_facts.ebitda
    assert isinstance(metric.raw_value, Decimal) and metric.raw_value == Decimal("2.675")
    assert isinstance(metric.reported_value, Decimal) and metric.reported_value == Decimal("2.68")
    assert metric.reported_value.as_tuple().exponent == -2
    assert metric.raw_value != metric.reported_value


def test_guarantor_reported_cents_reconcile_without_rounding_raw_contributions() -> None:
    request = dated_request("0.01", "0", "0")
    payload = json.loads(request.model_dump_json())
    payload["guarantors"] = [
        {"name": f"Synthetic owner {index}", "ownership_percentage": share,
         "wages": "0.005", "interest_dividend_income": "0",
         "mortgage_pi_annual": "0.005", "auto_loan_annual": "0", "credit_card_min_annual": "0"}
        for index, share in enumerate(("0.34", "0.33", "0.33"))
    ]
    request = CommercialAssessmentRequest.model_validate_json(json.dumps(payload))
    first = assess_commercial(request)
    second = assess_commercial(request)
    contributions = first.guarantor_contributions
    assert [contribution.business_ebitda.raw_value for contribution in contributions] == [
        Decimal("0.0034"), Decimal("0.0033"), Decimal("0.0033")
    ]
    assert [contribution.business_ebitda.reported_value for contribution in contributions] == [
        Decimal("0.01"), Decimal("0.00"), Decimal("0.00")
    ]
    for name, global_name in (
        ("business_ebitda", "global_business_ebitda"),
        ("outside_income", "global_outside_income"),
        ("personal_debt", "global_personal_debt"),
    ):
        values = [getattr(contribution, name).reported_value for contribution in contributions]
        raw_values = [getattr(contribution, name).raw_value for contribution in contributions]
        assert all(isinstance(value, Decimal) and value.as_tuple().exponent == -2 for value in values)
        assert sum(values, Decimal("0.00")) == getattr(first.current_facts, global_name).reported_value
        assert sum(raw_values, Decimal("0")) == getattr(first.current_facts, global_name).raw_value
        assert values == [getattr(contribution, name).reported_value for contribution in second.guarantor_contributions]


def calculate_under_ambient_context(precision: int) -> tuple[str, str, str]:
    with localcontext() as ambient:
        ambient.prec = precision
        ambient.rounding = ROUND_UP
        for signal in (DivisionByZero, InvalidOperation, Overflow):
            ambient.traps[signal] = False
        ambient.traps[Inexact] = True
        before = (ambient.prec, ambient.rounding, dict(ambient.traps), dict(ambient.flags))
        year = financial_year("1000.30", "1000.10", "0.20")
        result = (
            str(ordinary_business_income(year)),
            str(amortized_annual_debt_service(Decimal("500000"), Decimal("0.0525"), 120)),
            str(consumer_dti(Decimal("9000"), Decimal("2200"), Decimal("470"), Decimal("1200"))[1]),
        )
        after = (ambient.prec, ambient.rounding, dict(ambient.traps), dict(ambient.flags))
        assert after == before
        assert Decimal(result[0]) == Decimal("0.00")
        assert Decimal(result[2]) == Decimal("0.43")
        return result


def test_financial_math_is_isolated_from_ambient_decimal_context() -> None:
    outputs = [calculate_under_ambient_context(precision) for precision in (6, 12, 28)]
    assert outputs[0] == outputs[1] == outputs[2]


def test_threaded_calls_use_isolated_decimal_contexts() -> None:
    with ThreadPoolExecutor(max_workers=3) as executor:
        outputs = list(executor.map(calculate_under_ambient_context, (6, 12, 28, 9, 18, 36)))
    assert all(output == outputs[0] for output in outputs)


def test_generated_annuity_payments_match_independent_high_precision_reference() -> None:
    rng = Random(6117)
    with localcontext() as reference:
        reference.prec = 80
        reference.rounding = ROUND_HALF_EVEN
        for _ in range(32):
            cents = rng.randrange(1, 100_000_000)
            principal = Decimal(f"{cents // 100}.{cents % 100:02d}")
            annual_rate = Decimal(f"0.{rng.randrange(1, 3001):04d}")
            months = rng.randrange(12, 601)
            rate = annual_rate / Decimal("12")
            expected = principal * rate * Decimal("12") / (Decimal("1") - (Decimal("1") + rate) ** -months)
            actual = amortized_annual_debt_service(principal, annual_rate, months)
            assert isinstance(actual, Decimal) and actual.is_finite() and actual > 0
            assert abs(actual - expected) <= Decimal("1E-24")


@pytest.mark.parametrize("field", MONEY_FIELDS)
def test_boolean_values_cannot_be_financial_year_money(field: str) -> None:
    data: dict[str, object] = dict(year_data())
    data[field] = True
    with pytest.raises(ValidationError):
        FinancialYear.model_validate(data)


@pytest.mark.parametrize("field", ["amount", "annual_rate"])
def test_boolean_values_cannot_be_loan_money_or_rates(field: str) -> None:
    data: dict[str, object] = {"amount": "1200.12", "annual_rate": "0.0525", "term_months": 12}
    data[field] = True
    with pytest.raises(ValidationError):
        ProposedLoan.model_validate(data)


def test_unknown_financial_fields_and_request_fields_are_rejected() -> None:
    with pytest.raises(ValidationError):
        FinancialYear.model_validate({**year_data(), "unrecognized": "1"})
    request = legacy_request(financial_year())
    payload = json.loads(request.model_dump_json())
    payload["unrecognized"] = "1"
    with pytest.raises(ValidationError):
        CommercialRequest.model_validate(payload)


@pytest.mark.parametrize("invalid", ["NaN", "sNaN", "Infinity", "-Infinity"])
def test_nonfinite_decimal_money_is_rejected_at_schema_and_math_boundaries(invalid: str) -> None:
    with pytest.raises(ValidationError):
        FinancialYear.model_validate({**year_data(), "gross_receipts": invalid})
    with pytest.raises(ValueError):
        amortized_annual_debt_service(Decimal(invalid), Decimal("0.05"), 120)


def test_decimal_overflow_fails_closed_when_ambient_traps_are_disabled() -> None:
    with localcontext() as ambient:
        for signal in (DivisionByZero, InvalidOperation, Overflow):
            ambient.traps[signal] = False
        with pytest.raises(ValueError):
            amortized_annual_debt_service(Decimal("1E1000000"), Decimal("1"), 12)
        with pytest.raises(ValueError):
            consumer_dti(Decimal("0"), Decimal("1"), Decimal("0"), Decimal("0"))


def test_archived_v1_receipts_remain_identical_and_replay_is_unavailable(tmp_path: Path) -> None:
    fixture = ROOT / "tests" / "fixtures" / "schema_v1"
    provenance = json.loads((fixture / "provenance.json").read_text())
    path = tmp_path / "archived-v1.sqlite3"
    with sqlite3.connect(path) as connection:
        connection.executescript((fixture / "store.sql").read_text())
    before = path.read_bytes()
    store = CaseStore(path, initialize=False)
    assert store.verify() == provenance["summary"]
    with sqlite3.connect(path) as connection:
        rows = connection.execute(
            "SELECT revision,receipt_json FROM successful_operations ORDER BY revision"
        ).fetchall()
    for expected, (revision, receipt) in zip(provenance["receipts"], rows, strict=True):
        snapshot = store.get(provenance["case_id"], revision)
        assert snapshot.assessment["schema_version"] == "commercial-assessment-v1"
        assert serialize_snapshot(snapshot) == receipt
        assert sha256(receipt.encode()).hexdigest() == expected["receipt_sha256"]
        replay = store.replay(snapshot.case_id, snapshot.revision)
        assert replay.status == "replay_unavailable"
        assert replay.differences == [] and replay.explanation
    assert path.read_bytes() == before
