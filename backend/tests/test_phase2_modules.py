from app.consumer import evaluate_consumer
from app.schemas import ConsumerRequest, SBACase, SBASizeRow
from app.sba import evaluate_sba


def test_sba_hand_constructed_case_with_synthetic_injected_row():
    row = SBASizeRow(naics="999999",measure="receipts_millions",threshold=10,source_effective_date="synthetic-test",synthetic_test_only=True)
    case = SBACase(borrower_name="Synthetic SBA Co",naics="999999",annual_receipts_millions=5,requested_loan=500_000,owner_liquid_resources=120_000,retirement_allowance=50_000,global_dscr=1.31,transaction_type="acquisition",sop_version="8.1")
    out = evaluate_sba(case,[row])
    assert out["size_eligible"] is True
    assert out["credit_elsewhere"]["passes"] is True
    assert out["coverage_pass"] is True
    assert out["outcome"] == "pass"


def test_sba_missing_official_row_fails_closed():
    case = SBACase(borrower_name="Synthetic SBA Co",naics="123456",annual_receipts_millions=5,requested_loan=100_000,global_dscr=1.4)
    try:
        evaluate_sba(case, [])
        assert False, "expected failure"
    except ValueError as exc:
        assert "Do not infer eligibility" in str(exc)


def test_consumer_43_boundary_is_review_not_legal_hard_decline():
    req = ConsumerRequest(applicant_name="Fixture C",geography="60601",gross_monthly_income=9000,proposed_housing_pi=2200,proposed_housing_tax_ins=470,other_monthly_debt=1200,atr_documentation={"income":True,"assets":True,"debts":True})
    out = evaluate_consumer(req)
    assert abs(out["back_end_dti"] - .43) < 1e-9
    assert out["prototype_boundary_status"] == "review_boundary"
