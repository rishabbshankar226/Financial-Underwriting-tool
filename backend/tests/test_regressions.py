import math

import pytest
from fastapi.testclient import TestClient

from app.core import amortized_annual_debt_service
from app.ingestion import extract_synthetic_text, confirmed_payload
from app.main import app
from fixtures import alpine_request

client = TestClient(app, raise_server_exceptions=False)


def consumer_payload():
    return dict(applicant_name='Synthetic', geography='60601', gross_monthly_income=9000,
                proposed_housing_pi=2200, proposed_housing_tax_ins=470,
                other_monthly_debt=1200, atr_documentation={'income': True, 'assets': True, 'debts': True},
                synthetic_credit_score=700)


@pytest.mark.parametrize('path,value', [
    (('years',), []),
    (('proposed_loan', 'amount'), -1),
    (('proposed_loan', 'annual_rate'), -0.1),
    (('proposed_loan', 'term_months'), 0),
    (('existing_debt', 'cpltd_annual'), -100000),
    (('existing_debt', 'operating_lease_annual'), -100000),
    (('years', 1, 'interest_expense'), -100000),
    (('years', 1, 'gross_receipts'), 'NaN'),
    (('proposed_loan', 'amount'), 'Infinity'),
])
def test_invalid_commercial_inputs_return_422(path, value):
    payload = alpine_request().model_dump()
    node = payload
    for key in path[:-1]:
        node = node[key]
    node[path[-1]] = value
    response = client.post('/commercial/decision', json=payload)
    assert response.status_code == 422, response.text


@pytest.mark.parametrize('field,value', [
    ('gross_monthly_income', 0), ('gross_monthly_income', -1),
    ('proposed_housing_pi', -1), ('proposed_housing_tax_ins', -1),
    ('other_monthly_debt', -10000), ('gross_monthly_income', 'Infinity'),
])
def test_invalid_consumer_inputs_return_422(field, value):
    payload = consumer_payload()
    payload[field] = value
    response = client.post('/consumer/decision', json=payload)
    assert response.status_code == 422, response.text


def test_zero_debt_service_is_explicit_and_serializable():
    payload = alpine_request().model_dump()
    payload['years'][-1]['interest_expense'] = 0
    payload['existing_debt'] = {'cpltd_annual': 0, 'operating_lease_annual': 0}
    payload['proposed_loan']['amount'] = 0
    payload['guarantors'] = []
    response = client.post('/commercial/decision', json=payload)
    assert response.status_code == 200, response.text
    result = response.json()
    assert result['outcome'] == 'review'
    assert all(f['passed'] is None for f in result['factors'][:3])
    assert all(isinstance(f['value'], str) for f in result['factors'][:3])


def test_ownership_cannot_count_more_than_the_whole_business():
    payload = alpine_request().model_dump()
    payload['guarantors'].append(dict(payload['guarantors'][0], name='Second owner'))
    response = client.post('/commercial/decision', json=payload)
    assert response.status_code == 422, response.text


def test_tiny_positive_interest_rate_converges_to_zero_rate_payment():
    annual = amortized_annual_debt_service(500000, 1e-16, 120)
    assert math.isclose(annual, 50000, rel_tol=1e-12)


@pytest.mark.parametrize('raw,expected', [('-1,200.50', -1200.5), ('(1,200.50)', -1200.5)])
def test_extraction_preserves_negative_cash_flow(raw, expected):
    result = extract_synthetic_text(f'AR_INCREASE: {raw}\n', {'ar_increase'})
    assert confirmed_payload(result) == {'ar_increase': expected}


@pytest.mark.parametrize('raw', ['1.2.3', '1,2,3', '.', '1,200,'])
def test_malformed_extraction_is_not_accepted_or_crashed(raw):
    result = extract_synthetic_text(f'COGS: {raw}\n', {'cogs'})
    assert confirmed_payload(result) == {}


def test_consumer_review_boundary_has_a_stored_explanation():
    response = client.post('/consumer/decision', json=consumer_payload())
    body = response.json()
    assert body['outcome'] == 'review'
    assert any(r['factor'] == 'back_end_dti_review' for r in body['reasons'])


def test_partial_atr_checklist_is_not_complete():
    from app.consumer import evaluate_consumer
    from app.schemas import ConsumerRequest
    payload = consumer_payload()
    payload.update(other_monthly_debt=0, atr_documentation={'income': True})
    assert client.post('/consumer/decision', json=payload).json()['outcome'] == 'review'
    assert evaluate_consumer(ConsumerRequest(**payload))['atr_documentation_complete'] is False


@pytest.mark.parametrize('field,value', [('employees', -1), ('annual_receipts_millions', -1),
    ('requested_loan', 0), ('owner_liquid_resources', -1), ('global_dscr', 'NaN'),
    ('transaction_type', 'acquistion')])
def test_invalid_sba_inputs_rejected_before_evaluation(field, value):
    from app.schemas import SBACase
    from pydantic import ValidationError
    payload = dict(borrower_name='Synthetic', naics='999999', requested_loan=100000, global_dscr=1.2, sop_version='8')
    payload[field] = value
    with pytest.raises(ValidationError):
        SBACase(**payload)


@pytest.mark.parametrize('endpoint,payload', [
    ('/consumer/decision', dict(consumer_payload(), proposed_housing_pi=1e308, proposed_housing_tax_ins=1e308)),
    ('/commercial/decision', dict(alpine_request().model_dump(), proposed_loan=dict(amount=1e308, annual_rate=1e308, term_months=120))),
])
def test_overflow_cannot_produce_a_decision(endpoint, payload):
    response = client.post(endpoint, json=payload)
    assert response.status_code == 422, response.text


@pytest.mark.parametrize('value', ['NaN', 'Infinity', '-Infinity'])
def test_confirmed_extraction_cannot_pass_nonfinite_strings(value):
    from app.schemas import ExtractionField, ExtractionResult
    result = ExtractionResult(fields=[ExtractionField(name='gross_receipts', value=value, confidence=.99, confirmed=True)])
    with pytest.raises(ValueError, match='finite'):
        confirmed_payload(result)


def test_extraction_supports_windows_line_endings():
    result = extract_synthetic_text('GROSS_RECEIPTS: $4,200,000\r\nCOGS: $2,750,000\r\n', {'gross_receipts', 'cogs'})
    assert confirmed_payload(result) == {'gross_receipts': 4200000, 'cogs': 2750000}
