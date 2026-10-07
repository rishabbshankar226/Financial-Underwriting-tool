"""Retained comparison transport, original response bytes and worker ownership."""
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
import json
import os
from pathlib import Path
import sqlite3
from threading import Event
from uuid import uuid4

from fastapi.testclient import TestClient
import pytest

from app.assessment import assess_commercial
from app.cases import CaseStore
from app.main import app
from app.scenario_routes import configured_read_store

ORIGIN = "http://localhost:5173"
FIXTURE = Path(__file__).resolve().parents[1] / "fixtures/alpine_dated.json"


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(tmp_path / "cases.sqlite3"))
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def saved(client):
    response = client.post("/cases", json={"input": json.loads(FIXTURE.read_text()), "rationale": "Synthetic baseline"},
                           headers={"Idempotency-Key": str(uuid4())})
    assert response.status_code == 201
    return response.json()


def path(saved):
    return f"/cases/{saved['case_id']}/revisions/{saved['revision']}/scenario-comparisons"


def create_command(client, saved):
    preview = {"schema_version": "commercial-scenario-preview-v1", "baseline_run_id": saved["run_id"], "scenarios": [{
        "scenario_key": "downside", "name": "Revenue down 10%", "rationale": "Other assumptions held fixed",
        "assumptions": {"revenue_change": -.1, "cogs_change": 0, "operating_expense_change": 0, "proposed_rate_change_bps": 0}}]}
    response = client.post(f"/cases/{saved['case_id']}/revisions/1/scenarios/preview", json=preview)
    assert response.status_code == 200
    return {**preview, "schema_version": "commercial-scenario-comparison-create-v1",
            "expected_preview_fingerprint": response.json()["fingerprint"]["value"]}, response.json()


def counts():
    with sqlite3.connect(os.environ["SPREADLINE_CASE_DB"]) as connection:
        return [connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0] for table in
                ("cases", "revisions", "runs", "events", "successful_operations", "scenario_comparisons", "scenario_comparison_operations")]


@pytest.mark.parametrize("suffix", ["", "/"])
def test_create_original_read_and_retry_have_identical_bytes_etag_location_and_cors(client, saved, suffix):
    command, preview = create_command(client, saved)
    key = str(uuid4())
    response = client.post(path(saved) + suffix, json=command, headers={"Idempotency-Key": key, "Origin": ORIGIN})
    assert response.status_code == 201, response.text
    record = response.json()
    assert record["preview"] == preview and record["persisted"] is True
    assert response.headers["idempotency-replayed"] == "false"
    location = f"/cases/{saved['case_id']}/scenario-comparisons/{record['comparison_id']}"
    assert response.headers["location"] == location
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert "location" in response.headers["access-control-expose-headers"].lower()
    original = client.get(location + suffix)
    assert original.status_code == 200 and original.content == response.content
    assert original.headers["etag"] == response.headers["etag"]
    retry = client.post(path(saved) + suffix, json=command, headers={"Idempotency-Key": key})
    assert retry.status_code == 201 and retry.content == response.content
    assert retry.headers["etag"] == response.headers["etag"] and retry.headers["location"] == location
    assert retry.headers["idempotency-replayed"] == "true"
    listing = client.get(f"/cases/{saved['case_id']}/scenario-comparisons" + suffix)
    assert listing.status_code == 200 and listing.json()["items"][0]["comparison_id"] == record["comparison_id"]
    assert "preview" not in listing.json()["items"][0]
    assert counts() == [1, 1, 1, 1, 1, 1, 1]
    assert client.get(f"/cases/{saved['case_id']}").json() == saved


@pytest.mark.parametrize("headers", [{}, {"Idempotency-Key": "not-a-uuid"},
                                      [("Idempotency-Key", str(uuid4())), ("Idempotency-Key", str(uuid4()))]])
def test_operation_header_is_one_uuid(client, saved, headers):
    command, _ = create_command(client, saved)
    response = client.post(path(saved), json=command, headers=headers)
    assert response.status_code == 400
    assert counts() == [1, 1, 1, 1, 1, 0, 0]


@pytest.mark.parametrize("suffix", ["", "/"])
@pytest.mark.parametrize("extra,status", [(0, 201), (1, 413)])
def test_actual_stream_limit_precedes_json_buffering(client, saved, suffix, extra, status):
    command, _ = create_command(client, saved)
    body = json.dumps(command).encode()
    body += b" " * (1_000_000 + extra - len(body))
    response = client.post(path(saved) + suffix, content=(body[i:i+100003] for i in range(0, len(body), 100003)),
                           headers={"Idempotency-Key": str(uuid4()), "Content-Type": "application/json", "Content-Length": "1", "Origin": ORIGIN})
    assert response.status_code == status, response.text
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert counts()[-2:] == ([1, 1] if extra == 0 else [0, 0])


@pytest.mark.parametrize("raw", [b'{"x":1,"x":2}', b'{"x":NaN}', b'{"x":Infinity}', b'{"x":-Infinity}', b'{"x":"\xff"}', b'{', b''])
def test_raw_json_failures_return_safe_cors_response_without_rows(client, saved, raw):
    response = client.post(path(saved), content=raw, headers={"Idempotency-Key": str(uuid4()), "Content-Type": "application/json", "Origin": ORIGIN})
    assert response.status_code == 422
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert counts()[-2:] == [0, 0] and "Traceback" not in response.text


@pytest.mark.parametrize("kind", ["fingerprint_missing", "fingerprint_short", "fingerprint_upper", "fingerprint_number",
                                  "numeric_string", "boolean", "duplicate", "unknown", "blank", "too_many", "missing_shock"])
def test_strict_create_contract_preserves_preview_validation(client, saved, kind):
    command, _ = create_command(client, saved)
    if kind == "fingerprint_missing":
        del command["expected_preview_fingerprint"]
    elif kind.startswith("fingerprint_"):
        command["expected_preview_fingerprint"] = {"fingerprint_short": "0" * 63, "fingerprint_upper": "A" * 64, "fingerprint_number": 42}[kind]
    elif kind in ("numeric_string", "boolean"):
        command["scenarios"][0]["assumptions"]["revenue_change"] = "-.1" if kind == "numeric_string" else True
    elif kind == "duplicate":
        command["scenarios"].append(deepcopy(command["scenarios"][0]))
    elif kind == "unknown":
        command["result"] = saved["assessment"]
    elif kind == "blank":
        command["scenarios"][0]["name"] = "  "
    elif kind == "too_many":
        command["scenarios"] = [{**command["scenarios"][0], "scenario_key": str(i)} for i in range(11)]
    else:
        del command["scenarios"][0]["assumptions"]["cogs_change"]
    response = client.post(path(saved), json=command, headers={"Idempotency-Key": str(uuid4())})
    assert response.status_code == 422
    assert counts()[-2:] == [0, 0]
    assert all("input" not in error for error in response.json()["detail"])


@pytest.mark.parametrize("kind,status", [("case", 400), ("revision", 400), ("zero", 400), ("huge", 400),
                                        ("run", 400), ("wrong_run", 409), ("missing", 404), ("missing_revision", 404), ("fingerprint", 409)])
def test_locator_baseline_and_fingerprint_guards(client, saved, kind, status):
    command, _ = create_command(client, saved)
    target = path(saved)
    if kind == "case":
        target = target.replace(saved["case_id"], "invalid")
    elif kind in ("revision", "zero", "huge"):
        target = target.replace("/revisions/1/", "/revisions/" + {"revision": "one", "zero": "0", "huge": "9223372036854775808"}[kind] + "/")
    elif kind in ("run", "wrong_run"):
        command["baseline_run_id"] = "invalid" if kind == "run" else str(uuid4())
    elif kind == "missing":
        target = target.replace(saved["case_id"], str(uuid4()))
    elif kind == "missing_revision":
        target = target.replace("/revisions/1/", "/revisions/2/")
    else:
        command["expected_preview_fingerprint"] = "0" * 64
    response = client.post(target, json=command, headers={"Idempotency-Key": str(uuid4())})
    assert response.status_code == status
    assert counts()[-2:] == [0, 0]


@pytest.mark.parametrize("query", ["limit=0", "limit=101", "limit=true", "limit=1.5", "after=bad!"])
def test_bad_listing_parameters_return_400(client, saved, query):
    assert client.get(f"/cases/{saved['case_id']}/scenario-comparisons?{query}").status_code == 400


@pytest.mark.parametrize("configured", [False, True])
def test_comparison_routes_do_not_initialize_missing_store(client, tmp_path, monkeypatch, configured):
    missing = tmp_path / "missing.sqlite3"
    if configured:
        monkeypatch.setenv("SPREADLINE_CASE_DB", str(missing))
    else:
        monkeypatch.delenv("SPREADLINE_CASE_DB")
    fake = {"case_id": str(uuid4()), "revision": 1}
    response = client.post(path(fake), json={}, headers={"Idempotency-Key": str(uuid4())})
    assert response.status_code == 503 and not missing.exists()
    assert client.get(f"/cases/{fake['case_id']}/scenario-comparisons").status_code == 503
    assert not missing.exists()


def test_busy_write_has_retry_after_and_no_accepted_receipt(client, saved):
    command, _ = create_command(client, saved)
    path_to_db = os.environ["SPREADLINE_CASE_DB"]
    app.dependency_overrides[configured_read_store] = lambda: CaseStore(path_to_db, timeout=.02, initialize=False)
    connection = sqlite3.connect(path_to_db, autocommit=True)
    connection.execute("BEGIN IMMEDIATE")
    key = str(uuid4())
    try:
        response = client.post(path(saved), json=command, headers={"Idempotency-Key": key, "Origin": ORIGIN})
        assert response.status_code == 503 and response.json()["detail"]["code"] == "storage_busy"
        assert response.headers["retry-after"] == "1" and "location" not in response.headers
    finally:
        connection.execute("ROLLBACK")
        connection.close()
    assert client.post(path(saved), json=command, headers={"Idempotency-Key": key}).status_code == 201


def test_retention_calculation_does_not_block_health(client, saved):
    command, _ = create_command(client, saved)
    entered, release = Event(), Event()
    def slow(request, policy):
        entered.set()
        assert release.wait(timeout=5)
        return assess_commercial(request, policy)
    store = CaseStore(os.environ["SPREADLINE_CASE_DB"], assessment_operation=slow, initialize=False)
    app.dependency_overrides[configured_read_store] = lambda: store
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(client.post, path(saved), json=command, headers={"Idempotency-Key": str(uuid4())})
        try:
            assert entered.wait(timeout=5)
            assert client.get("/health").status_code == 200
        finally:
            release.set()
        assert future.result(timeout=5).status_code == 201


def test_openapi_documents_commands_responses_and_post_only_creation(client, saved):
    document = client.get("/openapi.json").json()
    operation = document["paths"]["/cases/{case_id}/revisions/{revision}/scenario-comparisons"]["post"]
    assert operation["requestBody"]["content"]["application/json"]["schema"]["$ref"].endswith("/ComparisonCreate")
    assert {"201", "400", "404", "409", "413", "422", "503"} <= operation["responses"].keys()
    schema = document["components"]["schemas"]["ComparisonCreate"]
    assert "expected_preview_fingerprint" in schema["required"] and schema["additionalProperties"] is False
    assert "CaseCreate" in document["components"]["schemas"] and "ScenarioPreviewCommand" in document["components"]["schemas"]
    assert client.get(path(saved)).status_code == 405


def test_http_retry_after_new_head_uses_original_bytes_with_unavailable_engine(client, saved):
    command, _ = create_command(client, saved)
    key = str(uuid4())
    original = client.post(path(saved), json=command, headers={"Idempotency-Key": key})
    current = client.get(f"/cases/{saved['case_id']}")
    edited = client.post(f"/cases/{saved['case_id']}/revisions", json={"field_path": "/years/1/gross_receipts", "new_value": 4300000,
                        "rationale": "Later synthetic correction"}, headers={"Idempotency-Key": str(uuid4()), "If-Match": current.headers["etag"]})
    assert edited.status_code == 201
    def unavailable(*args):
        raise AssertionError("An original HTTP response cannot calculate")
    store = CaseStore(os.environ["SPREADLINE_CASE_DB"], assessment_operation=unavailable, initialize=False)
    app.dependency_overrides[configured_read_store] = lambda: store
    retry = client.post(path(saved), json=command, headers={"Idempotency-Key": key})
    assert retry.status_code == 201 and retry.content == original.content
    assert retry.headers["etag"] == original.headers["etag"] and retry.headers["location"] == original.headers["location"]
    assert retry.headers["idempotency-replayed"] == "true"
    assert client.get(retry.headers["location"]).content == original.content


def test_v1_http_preview_and_empty_listing_work_but_retention_requires_upgrade(client, tmp_path, monkeypatch):
    fixture = Path(__file__).parent / "fixtures/schema_v1"
    database = tmp_path / "v1.sqlite3"
    with sqlite3.connect(database) as connection:
        connection.executescript((fixture / "store.sql").read_text())
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(database))
    saved = CaseStore(database).get(json.loads((fixture / "provenance.json").read_text())["case_id"], 1).model_dump(mode="json")
    before = database.read_bytes()
    command, _ = create_command(client, saved)
    response = client.post(path(saved), json=command, headers={"Idempotency-Key": str(uuid4())})
    assert response.status_code == 409 and response.json()["detail"]["code"] == "storage_upgrade_required"
    assert client.get(f"/cases/{saved['case_id']}/scenario-comparisons").json() == {"items": [], "next_cursor": None}
    assert client.get(f"/cases/{saved['case_id']}/scenario-comparisons/{uuid4()}").status_code == 404
    assert database.read_bytes() == before
