"""Analysis routes are authenticated, bounded, read-only and tied to the assessment they explain."""

import json
import os
import sqlite3
from dataclasses import replace
from decimal import Decimal
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest
from api_client import TestClient
from app.assessment import assess_commercial
from app.case_contracts import CaseCreate
from app.cases import CaseStore
from app.config import DEFAULT_POLICY
from app.main import app
from app.scenario_routes import configured_read_store

ORIGIN = "http://localhost:5173"
FIXTURE = Path(__file__).resolve().parents[1] / "fixtures/alpine_dated_v2.json"


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(tmp_path / "cases.sqlite3"))
    with TestClient(app, raise_server_exceptions=False) as instance:
        yield instance
    app.dependency_overrides.clear()


def create(client):
    response = client.post(
        "/cases",
        json={"input": json.loads(FIXTURE.read_text()), "rationale": "Synthetic baseline"},
        headers={"Idempotency-Key": str(uuid4())},
    )
    assert response.status_code == 201, response.text
    return response.json()


@pytest.fixture
def saved(client):
    return create(client)


def analysis_path(case_id, revision=1, suffix=""):
    return f"/cases/{case_id}/revisions/{revision}/analysis{suffix}"


def counts():
    with sqlite3.connect(os.environ["SPREADLINE_CASE_DB"]) as connection:
        return [
            connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
            for table in ("cases", "revisions", "runs", "events", "successful_operations")
        ]


@pytest.mark.parametrize("suffix", ["", "/"])
def test_stateless_analysis_explains_its_own_assessment(client, suffix):
    body = json.loads(FIXTURE.read_text())
    assessment = client.post("/commercial/assessment", json=body).json()
    response = client.post("/commercial/analysis" + suffix, json=body, headers={"Origin": ORIGIN})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["schema_version"] == "commercial-analysis-v1"
    assert result["persisted"] is False and result["source"] == "stateless_request" and result["baseline"] is None
    assert result["assessment_fingerprint"] == assessment["fingerprint"]
    assert result["explanation"]["outcome"] == assessment["decision"]["outcome"]
    assert result["debt_capacity"]["binding_constraint"] == "fccr"
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert response.headers["cache-control"] == "no-store"


def test_stateless_analysis_rejects_invalid_input_with_field_errors(client):
    body = json.loads(FIXTURE.read_text())
    body["proposed_loan"]["term_months"] = 11
    response = client.post("/commercial/analysis", json=body)
    assert response.status_code == 422
    assert response.json()["errors"]["items"] == [
        {"pointer": "/proposed_loan/term_months", "code": "too_small", "message": "Must be at least 12.", "limit": "12"}
    ]


@pytest.mark.parametrize("suffix", ["", "/"])
@pytest.mark.parametrize("body", [None, b"", b"{}"])
def test_saved_analysis_reads_the_retained_revision_without_writing(client, saved, suffix, body):
    database = Path(os.environ["SPREADLINE_CASE_DB"])
    before = database.read_bytes()
    options = {} if body is None else {"content": body, "headers": {"Content-Type": "application/json"}}
    response = client.post(analysis_path(saved["case_id"], suffix=suffix), **options)
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["source"] == "saved_revision" and result["persisted"] is False
    assert result["baseline"] == {
        key: saved[key] for key in ("case_id", "revision", "run_id", "input_hash", "payload_hash")
    }
    assert result["assessment_fingerprint"] == saved["assessment"]["fingerprint"]
    assert database.read_bytes() == before and counts() == [1, 1, 1, 1, 1]


def test_saved_analysis_uses_the_policy_retained_with_the_revision(client):
    strict = replace(DEFAULT_POLICY, commercial_min_fccr=Decimal("1.5"))
    store = CaseStore(os.environ["SPREADLINE_CASE_DB"], policy_provider=lambda: strict)
    command = CaseCreate.model_validate_json(
        json.dumps({"input": json.loads(FIXTURE.read_text()), "rationale": "Stricter retained policy"})
    )
    snapshot = store.create(command, str(uuid4())).snapshot
    response = client.post(analysis_path(snapshot.case_id))
    assert response.status_code == 200, response.text
    fccr = next(row for row in response.json()["debt_capacity"]["constraints"] if row["constraint"] == "fccr")
    assert fccr["approval_minimum"] == "1.5"
    assert Decimal(fccr["max_annual_payment"]["raw_value"]) == 276000


def test_saved_analysis_rejects_any_command_content(client, saved):
    response = client.post(analysis_path(saved["case_id"]), json={"x": 1})
    assert response.status_code == 422
    assert response.json()["errors"]["items"] == [
        {"pointer": "/x", "code": "unknown_field", "message": "This field is not part of the contract.", "limit": None}
    ]


@pytest.mark.parametrize(
    "kind,status,code",
    [
        ("unsupported", 409, "baseline_unsupported"),
        ("mismatch", 409, "baseline_replay_mismatch"),
        ("unavailable", 409, "baseline_replay_unavailable"),
        ("malformed", 503, "storage_integrity"),
    ],
)
def test_unusable_retained_baselines_are_refused_without_writing(client, kind, status, code):
    def recorded(request, policy):
        result = assess_commercial(request, policy)
        if kind == "unsupported":
            return result.model_copy(update={"calculation_version": "retired-calculation"})
        if kind == "mismatch":
            return result.model_copy(update={"decision": result.decision.model_copy(update={"outcome": "decline"})})
        if kind == "malformed":
            raw = result.model_dump(mode="json")
            del raw["current_facts"]
            return SimpleNamespace(model_dump=lambda **kwargs: raw)
        return result

    store = CaseStore(os.environ["SPREADLINE_CASE_DB"], assessment_operation=recorded)
    command = CaseCreate.model_validate_json(
        json.dumps({"input": json.loads(FIXTURE.read_text()), "rationale": "Retained baseline"})
    )
    snapshot = store.create(command, str(uuid4())).snapshot
    if kind == "unavailable":

        def unavailable(*args):
            raise ValueError("Retained definition cannot be evaluated")

        app.dependency_overrides[configured_read_store] = lambda: CaseStore(
            store.path, initialize=False, assessment_operation=unavailable
        )
    before = store.path.read_bytes()
    response = client.post(analysis_path(snapshot.case_id), headers={"Origin": ORIGIN})
    assert response.status_code == status, response.text
    assert response.json()["detail"]["code"] == code
    if kind == "unsupported":
        assert response.json()["detail"]["message"] == "The retained assessment definition cannot support this analysis"
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert store.path.read_bytes() == before and counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize(
    "locator,status,code",
    [
        ("/cases/not-a-uuid/revisions/1/analysis", 400, "invalid_identifier"),
        # A revision of an unknown case is reported as a missing revision, as for previews.
        ("/cases/00000000-0000-4000-8000-000000000009/revisions/1/analysis", 404, "revision_not_found"),
        ("{case}/revisions/0/analysis", 400, "invalid_revision"),
        ("{case}/revisions/9/analysis", 404, "revision_not_found"),
    ],
)
def test_saved_analysis_locator_guards(client, saved, locator, status, code):
    response = client.post(locator.replace("{case}", f"/cases/{saved['case_id']}"))
    assert response.status_code == status, response.text
    assert response.json()["detail"]["code"] == code


def test_saved_analysis_requires_configured_storage(client, saved, monkeypatch):
    monkeypatch.delenv("SPREADLINE_CASE_DB")
    response = client.post(analysis_path(saved["case_id"]))
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "storage_not_configured"


@pytest.mark.parametrize("suffix", ["", "/"])
def test_analysis_routes_are_post_only(client, saved, suffix):
    assert client.get("/commercial/analysis" + suffix).status_code == 405
    assert client.get(analysis_path(saved["case_id"], suffix=suffix)).status_code == 405


def test_openapi_advertises_the_analysis_contract(client):
    schema = client.get("/openapi.json").json()
    request_body = schema["paths"]["/commercial/analysis"]["post"]["requestBody"]
    assert request_body["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/CommercialAssessmentRequest"
    }
    assert "/cases/{case_id}/revisions/{revision}/analysis" in schema["paths"]
    assert {"CommercialAnalysis", "AnalysisCommand", "FieldErrors"} <= set(schema["components"]["schemas"])
