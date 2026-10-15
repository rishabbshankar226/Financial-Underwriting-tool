import json

import pytest
from api_client import TestClient
from app.ingestion import confirmed_payload, extract_synthetic_text, extraction_accuracy, parse_structured
from app.main import app
from app.schemas import AuditEvent, ExtractionField, ExtractionResult, SourceKind
from fixtures import alpine_request


@pytest.mark.parametrize('payload', [
    '{"gross_receipts": 1, "gross_receipts": 2}',
    '{"proposed_loan": {"amount": 1, "amount": 2}}',
])
def test_json_duplicate_keys_are_rejected(payload):
    with pytest.raises(ValueError, match='Duplicate JSON key'):
        parse_structured(payload, 'json')


@pytest.mark.parametrize('token', ['NaN', 'Infinity', '-Infinity', '1e400', '-1e400'])
def test_json_nonfinite_and_out_of_range_tokens_are_rejected(token):
    with pytest.raises(ValueError, match='finite'):
        parse_structured('{"amount": ' + token + '}', 'json')


@pytest.mark.parametrize('opening, closing', [('[', ']'), ('{"nested":', '}')])
def test_excessive_json_nesting_is_a_validation_error(opening, closing):
    payload = '{"extra":' + opening * 10_000 + '0' + closing * 10_000 + '}'
    with pytest.raises(ValueError, match='JSON nesting exceeds the supported depth'):
        parse_structured(payload, 'json')


@pytest.mark.parametrize('opening, closing', [('[', ']'), ('{"nested":', '}')])
@pytest.mark.parametrize('terminal', ['0', '[]', '{}'])
@pytest.mark.parametrize('depth', [128, 129])
def test_json_container_depth_is_bounded_before_native_recursion(opening, closing, terminal, depth):
    wrappers = depth - 1 - (terminal in ('[]', '{}'))
    payload = '{"extra":' + opening * wrappers + terminal + closing * wrappers + '}'
    if depth == 128:
        assert 'extra' in parse_structured(payload, 'json')
    else:
        with pytest.raises(ValueError, match='JSON nesting exceeds the supported depth'):
            parse_structured(payload, 'json')


def test_json_depth_ignores_sibling_count_and_literal_brackets():
    payload = {'source': '[{"nested":' * 1_000, 'rows': [[], {}] * 128, 'amount': 1.25}
    assert parse_structured(json.dumps(payload), 'json') == payload


@pytest.mark.parametrize('path', [
    '/commercial/decision', '/consumer/decision', '/sba/evaluate', '/commercial/assessment',
])
def test_api_enforces_explicit_json_depth_with_readable_cors_error(path):
    payload = '{"extra":' + '[' * 128 + '0' + ']' * 128 + '}'
    response = TestClient(app, raise_server_exceptions=False).post(path, content=payload,
        headers={'Content-Type': 'application/json', 'Origin': 'http://localhost:5173'})
    assert response.status_code == 422
    assert response.json()['detail'] == 'JSON nesting exceeds the supported depth'
    assert response.headers['access-control-allow-origin'] == 'http://localhost:5173'


@pytest.mark.parametrize('path', [
    '/commercial/decision', '/consumer/decision', '/sba/evaluate', '/commercial/assessment',
])
def test_api_rejects_excessive_json_nesting_with_readable_cors_error(path):
    payload = '{"extra":' + '[' * 10_000 + '0' + ']' * 10_000 + '}'
    response = TestClient(app, raise_server_exceptions=False).post(path, content=payload,
        headers={'Content-Type': 'application/json', 'Origin': 'http://localhost:5173'})
    assert response.status_code == 422
    assert response.json()['detail'] == 'JSON nesting exceeds the supported depth'
    assert response.headers['access-control-allow-origin'] == 'http://localhost:5173'


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


@pytest.mark.parametrize('values', [(1, 2), (2, 1), (2, 2), (None, 2)])
def test_duplicate_extraction_cannot_receive_an_accuracy_score(values):
    result = ExtractionResult(fields=[
        ExtractionField(name='gross_receipts', value=value, confidence=.99)
        for value in values
    ])
    with pytest.raises(ValueError, match='Duplicate extracted field'):
        extraction_accuracy(result, {'gross_receipts': 2})


def test_extraction_accuracy_preserves_matching_missing_and_unconfirmed_fields():
    result = ExtractionResult(fields=[
        ExtractionField(name='gross_receipts', value=2, confidence=.99, confirmed=False),
        ExtractionField(name='cogs', value=None, confidence=.99),
    ])
    assert extraction_accuracy(result, {'gross_receipts': 2, 'cogs': 1}) == .5


@pytest.mark.parametrize('value', [True, False])
@pytest.mark.parametrize('confirmed', [True, False])
def test_extracted_amounts_reject_booleans_before_numeric_coercion(value, confirmed):
    with pytest.raises(ValueError, match='boolean'):
        ExtractionField(name='gross_receipts', value=value, confidence=.99, confirmed=confirmed)


@pytest.mark.parametrize('value', [True, False])
def test_json_extraction_records_reject_boolean_amounts(value):
    payload = json.dumps({'fields': [dict(name='gross_receipts', value=value,
                                        confidence=.99, confirmed=True)]})
    with pytest.raises(ValueError, match='boolean'):
        ExtractionResult.model_validate_json(payload)


@pytest.mark.parametrize('value', [0, 0.0, '0', 1, '1'])
def test_confirmed_numeric_extraction_values_still_preserve_zero_and_one(value):
    field = ExtractionField(name='gross_receipts', value=value, confidence=.99, confirmed=True)
    assert confirmed_payload(ExtractionResult(fields=[field])) == {'gross_receipts': float(value)}


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
        AuditEvent(field='gross_receipts', new_value=1, source=SourceKind.human_override, rationale=rationale)


def test_audit_rationale_is_trimmed():
    event = AuditEvent(field='gross_receipts', new_value=1, source=SourceKind.human_override, rationale='  Synthetic correction  ')
    assert event.rationale == 'Synthetic correction'


def test_api_rejects_duplicate_json_before_framework_decoding_loses_it():
    raw = json.dumps(alpine_request().model_dump(mode="json"))
    raw = raw.replace('"amount": "500000"', '"amount": 1, "amount": "500000"')
    assert raw.count('"amount":') == 2
    response = TestClient(app).post('/commercial/decision', content=raw, headers={'Content-Type': 'application/json'})
    assert response.status_code == 422
    assert 'Duplicate JSON key' in response.json()['detail']


def test_api_rejects_blank_override_rationale():
    payload = alpine_request().model_dump(mode="json")
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
    raw = json.dumps(alpine_request().model_dump(mode="json")).replace('"amount": "500000"', '"amount": 1e400')
    response = TestClient(app, raise_server_exceptions=False).post('/commercial/decision', content=raw,
        headers={'Content-Type': 'application/json'})
    assert response.status_code == 422
    assert 'finite' in str(response.json()['detail'])
