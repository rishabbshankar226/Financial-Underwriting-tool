import json

import pytest
from fastapi.testclient import TestClient

from app.ingestion import confirmed_payload, extract_synthetic_text, parse_structured
from app.main import app
from app.schemas import AuditEvent, ExtractionField, ExtractionResult
from fixtures import alpine_request


@pytest.mark.parametrize('payload', [
    '{"gross_receipts": 1, "gross_receipts": 2}',
    '{"proposed_loan": {"amount": 1, "amount": 2}}',
])
def test_json_duplicate_keys_are_rejected(payload):
    with pytest.raises(ValueError, match='Duplicate JSON key'):
        parse_structured(payload, 'json')


@pytest.mark.parametrize('token', ['NaN', 'Infinity', '-Infinity', '1e400', '-1e400'])
def test_json_nonfinite_tokens_are_rejected(token):
    with pytest.raises(ValueError, match='Non-finite JSON'):
        parse_structured('{"amount": ' + token + '}', 'json')


@pytest.mark.parametrize('payload', [
    'gross_receipts,gross_receipts\n1,2\n',
    'gross_receipts, gross_receipts\n1,2\n',
    'gross_receipts,\n1,2\n',
    'gross_receipts,cogs\n1\n',
    'gross_receipts,cogs\n1,2,3\n',
    'gross_receipts,cogs\n"1,2\n',
])
def test_csv_ambiguous_headers_and_malformed_rows_are_rejected(payload):
    with pytest.raises(ValueError):
        parse_structured(payload, 'csv')


def test_csv_single_record_preserves_values_and_windows_line_endings():
    assert parse_structured('gross_receipts,cogs\r\n"1,200",900\r\n', 'csv') == {
        'gross_receipts': '1,200', 'cogs': '900',
    }


def test_duplicate_extraction_preserves_evidence_but_cannot_be_promoted():
    result = extract_synthetic_text('GROSS_RECEIPTS: 1\nGROSS_RECEIPTS: 2\n', {'gross_receipts'})
    assert len(result.fields) == 2
    with pytest.raises(ValueError, match='Duplicate extracted field'):
        confirmed_payload(result)


def test_unconfirmed_duplicate_cannot_silently_resolve_ambiguity():
    result = ExtractionResult(fields=[
        ExtractionField(name='gross_receipts', value=1, confidence=.99, confirmed=True),
        ExtractionField(name='gross_receipts', value=2, confidence=.99, confirmed=False),
    ])
    with pytest.raises(ValueError, match='Duplicate extracted field'):
        confirmed_payload(result)


@pytest.mark.parametrize('rationale', ['', ' ', '\t\n'])
def test_blank_audit_rationale_is_rejected(rationale):
    with pytest.raises(ValueError, match='rationale'):
        AuditEvent(field='gross_receipts', new_value=1, source='human_override', rationale=rationale)


def test_audit_rationale_is_trimmed():
    event = AuditEvent(field='gross_receipts', new_value=1, source='human_override', rationale='  Synthetic correction  ')
    assert event.rationale == 'Synthetic correction'


def test_api_rejects_duplicate_json_before_framework_decoding_loses_it():
    raw = json.dumps(alpine_request().model_dump())
    raw = raw.replace('"amount": 500000.0', '"amount": 1, "amount": 500000.0')
    assert raw.count('"amount":') == 2
    response = TestClient(app).post('/commercial/decision', content=raw, headers={'Content-Type': 'application/json'})
    assert response.status_code == 422
    assert 'Duplicate JSON key' in response.json()['detail']


def test_api_rejects_blank_override_rationale():
    payload = alpine_request().model_dump()
    payload['overrides'] = [dict(field='gross_receipts', new_value=1, source='human_override', rationale='  ')]
    response = TestClient(app).post('/commercial/decision', json=payload)
    assert response.status_code == 422


def test_json_rejection_keeps_browser_cors_headers():
    response = TestClient(app).post('/commercial/decision', content='{"amount": 1, "amount": 2}',
        headers={'Content-Type': 'application/json', 'Origin': 'http://localhost:5173'})
    assert response.status_code == 422
    assert response.headers['access-control-allow-origin'] == 'http://localhost:5173'


@pytest.mark.parametrize('media_type', [None, 'application/problem+json'])
def test_api_duplicate_rejection_covers_json_media_types(media_type):
    headers = {} if media_type is None else {'Content-Type': media_type}
    response = TestClient(app).post('/consumer/decision', content='{"income": 1, "income": 2}', headers=headers)
    assert response.status_code == 422
    assert 'Duplicate JSON key' in response.json()['detail']


def test_api_rejects_overflowing_json_number_before_error_serialization():
    raw = json.dumps(alpine_request().model_dump()).replace('"amount": 500000.0', '"amount": 1e400')
    response = TestClient(app, raise_server_exceptions=False).post('/commercial/decision', content=raw,
        headers={'Content-Type': 'application/json'})
    assert response.status_code == 422
    assert 'Non-finite JSON' in response.json()['detail']
