import json
from app.ingestion import parse_structured, extract_synthetic_text, confirmed_payload, extraction_accuracy
from app.schemas import CommercialRequest, ConsumerRequest
from app.core import dscr, fccr, global_dscr, consumer_dti
from fixtures import alpine_request, BRISTLE, BRISTLE_EXISTING, BRISTLE_LOAN, BRISTLE_G, BRISTLE_WC


def test_structured_alpine_round_trip_matches_core():
    original=alpine_request(); payload=json.dumps(original.model_dump())
    rebuilt=CommercialRequest.model_validate(parse_structured(payload,"json"))
    y=rebuilt.years[-1]
    assert abs(dscr(y,rebuilt.existing_debt,rebuilt.proposed_loan)-3.135)<=.005
    assert abs(fccr(y,rebuilt.existing_debt,rebuilt.proposed_loan)-2.800)<=.005
    assert abs(global_dscr(y,rebuilt.existing_debt,rebuilt.proposed_loan,rebuilt.guarantors)-2.902)<=.005


def test_structured_bristlecone_matches_core():
    raw={"borrower_name":"Bristlecone","geography":"60601","years":[BRISTLE.model_dump()],"existing_debt":BRISTLE_EXISTING.model_dump(),"proposed_loan":BRISTLE_LOAN.model_dump(),"guarantors":[BRISTLE_G.model_dump()],"working_capital":BRISTLE_WC.model_dump()}
    rebuilt=CommercialRequest.model_validate(parse_structured(json.dumps(raw),"json")); y=rebuilt.years[-1]
    assert abs(dscr(y,rebuilt.existing_debt,rebuilt.proposed_loan)-.723)<=.005


def test_structured_consumer_fixture_c_matches_core():
    raw={"applicant_name":"Fixture C","geography":"60601","gross_monthly_income":9000,"proposed_housing_pi":2200,"proposed_housing_tax_ins":470,"other_monthly_debt":1200}
    req=ConsumerRequest.model_validate(parse_structured(json.dumps(raw),"json"))
    _,back=consumer_dti(req.gross_monthly_income,req.proposed_housing_pi,req.proposed_housing_tax_ins,req.other_monthly_debt)
    assert abs(back-.43)<1e-12


def test_unconfirmed_extraction_cannot_cross_boundary_and_accuracy_measured():
    text="GROSS_RECEIPTS: $4,200,000\nCOGS: $2,750,000\n"
    result=extract_synthetic_text(text,confirmed_fields={"gross_receipts"})
    assert confirmed_payload(result)=={"gross_receipts":4200000.0}
    assert extraction_accuracy(result,{"gross_receipts":4200000,"cogs":2750000})==1.0
