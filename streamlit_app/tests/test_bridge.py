"""The embedded workspace must retain the real HTTP boundary and write receipts."""

import json
from pathlib import Path
from uuid import uuid4

import pytest

from backend.app.cases import CaseStore
from streamlit_app.bridge import BridgeSession

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = (ROOT / "backend/fixtures/alpine_dated_v2.json").read_text()
GENERATION = str(uuid4())


@pytest.fixture
def session(tmp_path, monkeypatch):
    path = tmp_path / "cases.sqlite3"
    monkeypatch.setenv("SPREADLINE_API_TOKEN", "synthetic-streamlit-test-" + "x" * 48)
    monkeypatch.setenv("SPREADLINE_OPERATOR_ID", "streamlit-regression")
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(path))
    CaseStore(path)
    return BridgeSession(GENERATION)


def request(path="/commercial/assessment", body=FIXTURE, **changes):
    return {
        "id": str(uuid4()),
        "generation": GENERATION,
        "method": "POST",
        "path": path,
        "body": body,
        "headers": {"content-type": "application/json"},
        **changes,
    }


def test_assessment_traverses_the_existing_auth_and_exact_json_boundary(session, monkeypatch):
    response = session.process([request()])[0]
    assert response["status"] == 200
    result = json.loads(response["body"])
    assert result["normalized_input"]["years"][-1]["gross_receipts"] == "4200000"
    assert result["current_facts"]["dscr"]["reported_value"] == "3.1349"
    monkeypatch.delenv("SPREADLINE_API_TOKEN")
    assert session.process([request()])[0]["status"] == 503


@pytest.mark.parametrize("body", ['{"a":1,"a":2}', '{"x":NaN}', '{"x":true}'])
def test_invalid_raw_imports_are_rejected_by_existing_intake(session, body):
    assert session.process([request(body=body)])[0]["status"] == 422


def test_rerender_and_explicit_retry_keep_one_original_saved_case(session):
    command = json.dumps({"input": json.loads(FIXTURE), "rationale": "Synthetic component test"})
    operation = str(uuid4())
    submitted = request(
        "/cases", command, headers={"content-type": "application/json", "idempotency-key": operation}
    )
    first = session.process([submitted])[0]
    assert first["status"] == 201
    assert session.process([submitted]) == [first]
    # A new transport request retries the exact same committed operation.
    retry = BridgeSession(GENERATION).process([{**submitted, "id": str(uuid4())}])[0]
    assert retry["body"] == first["body"]
    assert retry["headers"]["idempotency-replayed"] == "true"
    assert retry["headers"]["etag"] == first["headers"]["etag"]
    listing = session.process([request("/cases?limit=25", "", method="GET", headers={})])[0]
    assert len(json.loads(listing["body"])["items"]) == 1


@pytest.mark.parametrize(
    "changes",
    [
        {"path": "https://example.com/cases"},
        {"path": "//example.com/cases"},
        {"path": "/docs"},
        {"path": "/cases/../docs"},
        {"path": "/cases?unexpected=x"},
        {"headers": {"Authorization": "Bearer supplied-by-browser"}},
        {"method": "DELETE"},
        {"body": "x" * 1_000_001},
        {"extra": "unexpected"},
    ],
)
def test_invalid_bridge_commands_never_reach_application(session, changes):
    response = session.process([request(**changes)])[0]
    assert response["status"] in (400, 413)


def test_analysis_routes_reach_the_application(session):
    stateless = session.process([request("/commercial/analysis")])[0]
    assert stateless["status"] == 200
    assert json.loads(stateless["body"])["schema_version"] == "commercial-analysis-v1"
    command = json.dumps({"input": json.loads(FIXTURE), "rationale": "Synthetic analysis baseline"})
    created = session.process(
        [request("/cases", command, headers={"content-type": "application/json", "idempotency-key": str(uuid4())})]
    )[0]
    case_id = json.loads(created["body"])["case_id"]
    saved = session.process([request(f"/cases/{case_id}/revisions/1/analysis", "")])[0]
    assert saved["status"] == 200
    assert json.loads(saved["body"])["source"] == "saved_revision"


def test_case_listing_search_parameters_reach_the_application(session):
    listing = session.process(
        [request("/cases?q=alpine&outcome=approve&sort=updated&limit=10", "", method="GET", headers={})]
    )[0]
    assert listing["status"] == 200
    assert json.loads(listing["body"]) == {"listing_version": "case-listing-v2", "items": [], "next_cursor": None}


@pytest.mark.parametrize(
    "changes",
    [
        {"path": f"/cases/{uuid4()}/revisions?q=a", "method": "GET", "body": "", "headers": {}},
        {"path": "/commercial/analysis?q=a"},
        {"path": "/cases?sort=created&sort=updated", "method": "GET", "body": "", "headers": {}},
        {"path": "/cases?search=a", "method": "GET", "body": "", "headers": {}},
    ],
)
def test_listing_parameters_are_confined_to_the_case_listing(session, changes):
    assert session.process([request(**changes)])[0]["status"] == 400


def test_old_generation_and_changed_request_identity_fail_closed(session):
    assert session.process([request(generation=str(uuid4()))])[0]["status"] == 409
    original = request()
    assert session.process([original])[0]["status"] == 200
    assert session.process([{**original, "body": "{}"}])[0]["status"] == 409


def test_sessions_do_not_share_response_state(session):
    other = BridgeSession(GENERATION)
    original = request()
    session.process([original])
    assert other.process([]) == []
    assert session.process([]) == []


def test_request_batch_is_bounded(session):
    with pytest.raises(ValueError, match="batch"):
        session.process([request() for _ in range(5)])


def test_application_failure_cannot_be_reported_as_a_definite_command_rejection():
    async def committed_then_lost(scope, receive, send):
        raise ValueError("An exception after committing must not clear a write journal")

    reply = BridgeSession(GENERATION, application=committed_then_lost).process([request()])[0]
    assert "error" in reply
    assert "status" not in reply


def test_oversized_response_remains_an_uncertain_transport_failure():
    async def oversized(scope, receive, send):
        await send({"type": "http.response.start", "status": 201, "headers": []})
        await send({"type": "http.response.body", "body": b"x" * 16_777_217})

    reply = BridgeSession(GENERATION, application=oversized).process([request()])[0]
    assert "error" in reply
    assert "status" not in reply
