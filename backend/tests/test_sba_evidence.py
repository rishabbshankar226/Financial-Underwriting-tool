"""Dated official standards and explicit evidence cannot imply full eligibility."""

import json
from datetime import date
from decimal import Decimal
from pathlib import Path

import pytest
from api_client import TestClient
from app.main import app
from app.sba import evaluate_sba, load_size_table, size_eligible
from app.schemas import SBACase


def evidence_case(**changes):
    payload = {
        "schema_version": "sba-screen-v2",
        "borrower_name": "Synthetic dated SBA screen",
        "naics": "541611",
        "annual_receipts_millions": "24.5",
        "requested_loan": "500000",
        "global_dscr": "1.31",
        "sop_version": "8.1",
        "assessment_as_of": "2026-10-14",
        "size_evidence": {
            "basis": "receipts_three_completed_fiscal_year_average",
            "period_start": "2023-01-01",
            "period_end": "2025-12-31",
            "affiliates": "included",
            "source_reference": "Synthetic consolidated tax-return review",
        },
    }
    return SBACase.model_validate_json(json.dumps({**payload, **changes}))


def test_official_table_contains_verified_current_receipts_and_employee_rows():
    rows = {row.naics: row for row in load_size_table()}
    assert len(rows) > 900
    assert rows["541611"].threshold == Decimal("24.5")
    assert rows["311111"].threshold == Decimal("1250")
    assert rows["541611"].source_effective_date == date(2023, 3, 17)
    assert rows["541611"].source_url.startswith("https://data.sba.gov/")
    assert len(rows["541611"].source_sha256) == 64


def test_passing_limited_screens_still_require_an_eligibility_review():
    result = evaluate_sba(evidence_case(), load_size_table())
    assert result["schema_version"] == "sba-screen-result-v2"
    assert result["size_eligible"] is True and result["coverage_pass"] is True
    assert result["outcome"] == "review_required"
    assert result["eligibility_status"] == "incomplete"
    assert "lender_credit_elsewhere_determination" in result["unresolved_requirements"]
    assert result["credit_elsewhere"]["passes"] is None


def test_exact_official_receipts_boundary_is_inclusive_without_a_float_epsilon():
    rows = load_size_table()
    assert size_eligible(evidence_case(), rows)[0] is True
    assert size_eligible(evidence_case(annual_receipts_millions="24.5000000000000000001"), rows)[0] is False


@pytest.mark.parametrize(
    "changes",
    [
        {"assessment_as_of": "2026-09-30"},
        {"assessment_as_of": "2023-03-16", "sop_version": "8"},
        {"assessment_as_of": "2099-01-01"},
    ],
)
def test_sop_and_size_source_dates_cannot_be_applied_outside_their_verified_range(changes):
    with pytest.raises(ValueError):
        evaluate_sba(evidence_case(**changes), load_size_table())


@pytest.mark.parametrize("naics", ["541330", "522110", "311421", "999999"])
def test_exception_footnote_asset_and_unknown_standards_fail_explicitly(naics):
    with pytest.raises(ValueError, match="unsupported|No current"):
        size_eligible(evidence_case(naics=naics), load_size_table())


@pytest.mark.parametrize(
    "changed",
    [
        {"basis": "annual_revenue"},
        {"affiliates": "excluded"},
        {"source_reference": "   "},
        {"period_start": "2023-01-02"},
        {"period_end": "2026-12-31"},
        {"unknown": "discard me"},
    ],
)
def test_incomplete_ambiguous_or_unsupported_measurement_evidence_is_rejected(changed):
    payload = evidence_case().model_dump(mode="json")
    payload["size_evidence"].update(changed)
    with pytest.raises(ValueError):
        SBACase.model_validate_json(json.dumps(payload))


def test_employee_measure_requires_a_dated_average_and_an_integer_conservative_count():
    case = evidence_case(
        naics="311111",
        annual_receipts_millions=None,
        employees=1250,
        size_evidence={
            "basis": "employees_24_month_pay_period_average_ceiling",
            "period_start": "2024-10-01",
            "period_end": "2026-09-30",
            "affiliates": "none",
            "source_reference": "Synthetic payroll review",
        },
    )
    assert size_eligible(case, load_size_table())[0] is True
    assert size_eligible(case.model_copy(update={"employees": 1251}), load_size_table())[0] is False
    with pytest.raises(ValueError):
        evidence_case(employees=3)


def test_tampered_or_missing_official_source_cannot_be_loaded(tmp_path: Path):
    source = Path(__file__).parents[1] / "data/sba_size_standards.json"
    manifest = json.loads(source.read_text())
    manifest["source_sha256"] = "0" * 64
    path = tmp_path / "standards.json"
    path.write_text(json.dumps(manifest))
    with pytest.raises(ValueError):
        load_size_table(path)


@pytest.mark.parametrize("change", [
    {"annual_receipts_millions": Decimal("-1")},
    {"global_dscr": True},
    {"owner_liquid_resources": Decimal("-1")},
])
def test_copied_invalid_models_cannot_bypass_sba_evaluation_domains(change):
    case = evidence_case().model_copy(update=change)
    with pytest.raises(ValueError):
        evaluate_sba(case, load_size_table())


def test_authenticated_sba_api_emits_exact_schema_locked_incomplete_result():
    response = TestClient(app).post('/sba/evaluate',json=evidence_case().model_dump(mode='json'))
    assert response.status_code == 200, response.text
    result = response.json()
    assert result['schema_version'] == 'sba-screen-result-v2'
    assert result['global_dscr'] == '1.31'
    assert result['credit_elsewhere']['passes'] is None
    assert result['eligibility_status'] == 'incomplete'
    assert result['size_standard_source']['sha256'] == '1e0777f83f6cc34767b97957a8e617b951d347f560538687e6bdfef32209bd74'
    assert response.headers['cache-control'] == 'no-store'
