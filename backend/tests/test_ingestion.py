import json
from decimal import Decimal

from app.core import consumer_dti, dscr, fccr, global_dscr
from app.ingestion import confirmed_payload, extract_synthetic_text, extraction_accuracy, parse_structured
from app.schemas import CommercialRequest, ConsumerRequest
from fixtures import BRISTLE, BRISTLE_EXISTING, BRISTLE_G, BRISTLE_LOAN, BRISTLE_WC, alpine_request


def test_structured_alpine_round_trip_matches_core():
    original=alpine_request()
    payload=json.dumps(original.model_dump(mode="json"))
    rebuilt=CommercialRequest.model_validate(parse_structured(payload,"json"))
    y=rebuilt.years[-1]
    assert abs(dscr(y,rebuilt.existing_debt,rebuilt.proposed_loan)-Decimal("3.135"))<=Decimal(".005")
    assert abs(fccr(y,rebuilt.existing_debt,rebuilt.proposed_loan)-Decimal("2.800"))<=Decimal(".005")
    assert abs(global_dscr(y,rebuilt.existing_debt,rebuilt.proposed_loan,rebuilt.guarantors)-Decimal("2.902"))<=Decimal(".005")


def test_structured_bristlecone_matches_core():
    raw={"borrower_name":"Bristlecone","geography":"60601","years":[BRISTLE.model_dump(mode="json")],"existing_debt":BRISTLE_EXISTING.model_dump(mode="json"),"proposed_loan":BRISTLE_LOAN.model_dump(mode="json"),"guarantors":[BRISTLE_G.model_dump(mode="json")],"working_capital":BRISTLE_WC.model_dump(mode="json")}
    rebuilt=CommercialRequest.model_validate(parse_structured(json.dumps(raw),"json"))
    y=rebuilt.years[-1]
    assert abs(dscr(y,rebuilt.existing_debt,rebuilt.proposed_loan)-Decimal(".723"))<=Decimal(".005")


def test_structured_consumer_fixture_c_matches_core():
    raw={"applicant_name":"Fixture C","geography":"60601","gross_monthly_income":9000,"proposed_housing_pi":2200,"proposed_housing_tax_ins":470,"other_monthly_debt":1200}
    req=ConsumerRequest.model_validate(parse_structured(json.dumps(raw),"json"))
    _,back=consumer_dti(req.gross_monthly_income,req.proposed_housing_pi,req.proposed_housing_tax_ins,req.other_monthly_debt)
    assert abs(back-Decimal(".43"))<Decimal("1e-12")


def test_unconfirmed_extraction_cannot_cross_boundary_and_accuracy_measured():
    text="GROSS_RECEIPTS: $4,200,000\nCOGS: $2,750,000\n"
    result=extract_synthetic_text(text,confirmed_fields={"gross_receipts"})
    assert confirmed_payload(result)=={"gross_receipts":4200000.0}
    assert extraction_accuracy(result,{"gross_receipts":4200000,"cogs":2750000})==1.0
