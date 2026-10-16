from datetime import date
from decimal import Decimal

from app.consumer import evaluate_consumer
from app.sba import evaluate_sba
from app.schemas import ConsumerRequest, SBASizeRow
from test_sba_evidence import evidence_case


def test_sba_hand_constructed_case_with_synthetic_injected_row():
    row = SBASizeRow(
        naics="999999",
        measure="receipts_millions",
        threshold=10,
        source_effective_date=date(2025, 6, 1),
        synthetic_test_only=True,
    )
    case = evidence_case(
        naics="999999",
        annual_receipts_millions="5",
        owner_liquid_resources="120000",
        retirement_allowance="50000",
        transaction_type="acquisition",
    )
    out = evaluate_sba(case, [row])
    assert out["size_eligible"] is True
    assert out["credit_elsewhere"]["passes"] is None
    assert out["credit_elsewhere"]["resource_indicator_below_requested"] is True
    assert out["coverage_pass"] is True
    assert out["outcome"] == "review_required"
    assert out["eligibility_status"] == "incomplete"


def test_sba_missing_official_row_fails_closed():
    case = evidence_case(naics="123456", annual_receipts_millions="5")
    try:
        evaluate_sba(case, [])
        raise AssertionError("expected failure")
    except ValueError as exc:
        assert "Do not infer eligibility" in str(exc)


def test_consumer_43_boundary_is_review_not_legal_hard_decline():
    req = ConsumerRequest(
        applicant_name="Fixture C",
        geography="60601",
        gross_monthly_income=9000,
        proposed_housing_pi=2200,
        proposed_housing_tax_ins=470,
        other_monthly_debt=1200,
        atr_documentation={"income": True, "assets": True, "debts": True},
    )
    out = evaluate_consumer(req)
    assert abs(out["back_end_dti"] - Decimal(".43")) < Decimal("1e-9")
    assert out["prototype_boundary_status"] == "review_boundary"
