import json
from dataclasses import replace

import pytest
from fastapi.testclient import TestClient

from app.config import DEFAULT_POLICY
from app.decision import decide_commercial, decide_consumer
from app.main import app
from app.sba import credit_elsewhere, evaluate_sba, load_size_table, size_eligible
from app.schemas import SBACase, SBASizeRow, ConsumerRequest, CommercialRequest
from fixtures import alpine_request, BRISTLE, BRISTLE_EXISTING, BRISTLE_LOAN, BRISTLE_G, BRISTLE_WC


def sba_payload():
    return dict(borrower_name='Synthetic', naics='999999', annual_receipts_millions=5,
                requested_loan=100000, global_dscr=1.4, sop_version='8.1')


def size_row(**changes):
    payload = dict(naics='999999', measure='receipts_millions', threshold=10,
                   source_effective_date='2025-06-01', synthetic_test_only=True)
    return SBASizeRow(**dict(payload, **changes))


def consumer_request(score=700):
    return ConsumerRequest(applicant_name='Synthetic', geography='60601', gross_monthly_income=9000,
        proposed_housing_pi=2200, proposed_housing_tax_ins=470, other_monthly_debt=0,
        atr_documentation={'income': True, 'assets': True, 'debts': True}, synthetic_credit_score=score)


def test_sop_selection_is_mandatory_at_model_and_api_boundaries():
    payload = sba_payload()
    del payload['sop_version']
    with pytest.raises(ValueError, match='sop_version'):
        SBACase(**payload)
    assert TestClient(app).post('/sba/evaluate', json=payload).status_code == 422


@pytest.mark.parametrize('changes', [
    {'source_effective_date': 'not-a-date'}, {'threshold': 0}, {'threshold': -1},
    {'measure': 'employees', 'threshold': 1.5}, {'naics': 'bad-code'},
])
def test_size_row_metadata_is_validated(changes):
    with pytest.raises(ValueError):
        size_row(**changes)


def test_duplicate_size_rows_cannot_use_first_match_to_claim_eligibility():
    case = SBACase(**sba_payload())
    with pytest.raises(ValueError, match='Duplicate NAICS'):
        size_eligible(case, [size_row(), size_row(threshold=1)])


@pytest.mark.parametrize('payload', [[], {}, {'rows': {}}, {'rows': [dict(naics='999999')]}])
def test_invalid_size_table_is_a_controlled_error(tmp_path, payload):
    file = tmp_path / 'table.json'
    file.write_text(json.dumps(payload))
    with pytest.raises(ValueError):
        load_size_table(file)


def test_official_loader_rejects_synthetic_rows(tmp_path):
    file = tmp_path / 'table.json'
    file.write_text(json.dumps({'rows': [size_row().model_dump(mode='json')]}))
    with pytest.raises(ValueError, match='synthetic'):
        load_size_table(file)


def test_sba_resources_overflow_never_yields_a_passing_screen():
    case = SBACase(**dict(sba_payload(), owner_liquid_resources=1e308,
                         retirement_allowance=1e308, college_allowance=1e308))
    with pytest.raises(ValueError, match='finite'):
        credit_elsewhere(case)


def test_sba_api_overflow_with_a_loaded_test_table_returns_422(monkeypatch):
    monkeypatch.setattr('app.main.load_size_table', lambda: [size_row()])
    payload = dict(sba_payload(), owner_liquid_resources=1e308,
                   retirement_allowance=1e308, college_allowance=1e308)
    response = TestClient(app, raise_server_exceptions=False).post('/sba/evaluate', json=payload)
    assert response.status_code == 422
    assert 'finite' in response.json()['detail']


def test_synthetic_size_source_is_identified_in_result():
    result = evaluate_sba(SBACase(**sba_payload()), [size_row()])
    assert result['size_standard_source']['synthetic_test_only'] is True
    assert result['size_standard_source']['effective_date'] == '2025-06-01'


@pytest.mark.parametrize('changes', [
    {'consumer_review_dti': .6, 'consumer_decline_dti': .5},
    {'commercial_min_dscr': float('nan')}, {'commercial_min_fccr': float('inf')},
    {'consumer_review_dti': -1}, {'extraction_confidence_threshold': 1.1},
    {'k1_stability_band': -1}, {'consumer_required_atr_fields': ()},
    {'consumer_required_atr_fields': ('income', 'income')}, {'version': ''},
    {'commercial_decline_dscr': 2}, {'commercial_decline_fccr': -1},
    {'consumer_min_credit_score': 900}, {'consumer_min_credit_score': True},
    {'sba_global_dscr_floor_expansion': 0},
    {'commercial_min_uca_cash_flow': -1},
])
def test_invalid_policy_configuration_is_rejected(changes):
    with pytest.raises(ValueError):
        replace(DEFAULT_POLICY, **changes)


def test_commercial_decline_cutoffs_are_configured_and_stored():
    req = CommercialRequest(borrower_name='Synthetic', geography='60601', years=[BRISTLE],
        existing_debt=BRISTLE_EXISTING, proposed_loan=BRISTLE_LOAN,
        guarantors=[BRISTLE_G], working_capital=BRISTLE_WC)
    assert decide_commercial(req).outcome == 'decline'
    policy = replace(DEFAULT_POLICY, commercial_decline_dscr=.5,
        commercial_decline_fccr=.5, commercial_decline_global_dscr=.5)
    decision = decide_commercial(req, policy)
    assert decision.outcome == 'review'
    assert all(f.decline_threshold == .5 and f.decline_triggered is False for f in decision.factors[:3])


def test_consumer_credit_floor_is_configured_and_stored():
    assert decide_consumer(consumer_request()).outcome == 'approve'
    policy = replace(DEFAULT_POLICY, consumer_min_credit_score=710)
    result = decide_consumer(consumer_request(), policy)
    assert result.outcome == 'review'
    assert next(f for f in result.factors if f.name == 'synthetic_credit_score').threshold == 710


def test_uca_cash_flow_floor_is_configured_and_stored():
    req = alpine_request()
    policy = replace(DEFAULT_POLICY, commercial_min_uca_cash_flow=400000)
    result = decide_commercial(req, policy)
    assert result.outcome == 'review'
    factor = next(f for f in result.factors if f.name == 'uca_positive')
    assert factor.threshold == 400000
    assert factor.raw_value == 385000
    assert factor.passed is False


def test_confirmed_payload_obeys_injected_extraction_policy():
    from app.ingestion import confirmed_payload
    from app.schemas import ExtractionField, ExtractionResult
    result = ExtractionResult(fields=[ExtractionField(name='cogs', value=100, confidence=.85, confirmed=True)])
    assert confirmed_payload(result) == {}
    assert confirmed_payload(result, replace(DEFAULT_POLICY, extraction_confidence_threshold=.8)) == {'cogs': 100}


def test_policy_version_and_raw_boundary_value_are_preserved():
    policy = replace(DEFAULT_POLICY, version='synthetic-boundary-test')
    req = consumer_request()
    req.other_monthly_debt = 1200.09
    result = decide_consumer(req, policy)
    assert result.policy_version == policy.version
    factor = next(f for f in result.factors if f.name == 'back_end_dti_review')
    assert factor.value == .43
    assert factor.raw_value > policy.consumer_review_dti
    assert factor.comparison_operator == '<'
    assert factor.passed is False


def test_zero_debt_review_has_traceable_not_applicable_reasons():
    req = alpine_request().model_copy(deep=True)
    req.years[-1].interest_expense = 0
    req.existing_debt.cpltd_annual = 0
    req.existing_debt.operating_lease_annual = 0
    req.proposed_loan.amount = 0
    req.guarantors = []
    result = decide_commercial(req)
    assert result.outcome == 'review'
    assert {r.factor for r in result.reasons} >= {'dscr', 'fccr', 'global_dscr'}
    assert all(f.raw_value is None and f.decline_triggered is None for f in result.factors[:3])
    assert all('no debt service' in r.message for r in result.reasons)


def test_missing_credit_score_gets_a_review_reason_without_fake_low_score():
    result = decide_consumer(consumer_request(None))
    assert result.outcome == 'review'
    reason = next(r for r in result.reasons if r.factor == 'synthetic_credit_score')
    assert 'not supplied' in reason.message
    assert reason.value == 'not supplied'


def test_all_failed_factors_are_retained_in_internal_reason_records():
    req = CommercialRequest(borrower_name='Synthetic', geography='60601', years=[BRISTLE],
        existing_debt=BRISTLE_EXISTING, proposed_loan=BRISTLE_LOAN,
        guarantors=[BRISTLE_G], working_capital=BRISTLE_WC.model_copy(update={'cash_taxes_paid': 1000000}))
    result = decide_commercial(req)
    assert len(result.reasons) == 5
    assert {r.factor for r in result.reasons} == {f.name for f in result.factors if f.passed is False}
