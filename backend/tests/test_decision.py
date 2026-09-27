from app.decision import decide_commercial, decide_consumer
from app.schemas import CommercialRequest, ConsumerRequest
from fixtures import alpine_request, BRISTLE, BRISTLE_EXISTING, BRISTLE_LOAN, BRISTLE_G, BRISTLE_WC


def test_alpine_approve_and_no_fake_reasons():
    out=decide_commercial(alpine_request())
    assert out.outcome=="approve"
    assert out.reasons==[]
    assert {f.name for f in out.factors}>={"dscr","fccr","global_dscr"}


def test_bristlecone_decline_reasons_trace_to_failed_stored_factors():
    req=CommercialRequest(borrower_name="Bristlecone Logistics",geography="60601",years=[BRISTLE],existing_debt=BRISTLE_EXISTING,proposed_loan=BRISTLE_LOAN,guarantors=[BRISTLE_G],working_capital=BRISTLE_WC)
    out=decide_commercial(req)
    assert out.outcome=="decline"
    failed={f.name for f in out.factors if f.passed is False}
    assert out.reasons
    assert all(r.factor in failed for r in out.reasons)


def test_fixture_c_boundary_resolution_is_recorded_as_review():
    req=ConsumerRequest(applicant_name="Fixture C",geography="60601",gross_monthly_income=9000,proposed_housing_pi=2200,proposed_housing_tax_ins=470,other_monthly_debt=1200,atr_documentation={"income":True,"assets":True,"debts":True},synthetic_credit_score=700)
    out=decide_consumer(req)
    assert out.factors[0].value==.43
    assert out.outcome=="review"
