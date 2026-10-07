"""Real HTTP previews against owned local databases, including read-only failures."""
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
import asyncio
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
from threading import Event
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.assessment import assess_commercial
from app.case_contracts import CaseCreate, CaseEdit
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
    return f"/cases/{saved['case_id']}/revisions/{saved['revision']}/scenarios/preview"


def command(saved):
    return {"schema_version": "commercial-scenario-preview-v1", "baseline_run_id": saved["run_id"], "scenarios": [{
        "scenario_key": "downside", "name": "Revenue down 10%", "rationale": "Other assumptions held fixed",
        "assumptions": dict(revenue_change=-.1, cogs_change=0, operating_expense_change=0, proposed_rate_change_bps=0),
    }]}


def counts():
    with sqlite3.connect(os.environ["SPREADLINE_CASE_DB"]) as connection:
        return [connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                for table in ("cases", "revisions", "runs", "events", "successful_operations")]


@pytest.mark.parametrize("suffix", ["", "/"])
def test_preview_returns_200_without_receipt_or_storage_change(client, saved, suffix):
    before = counts()
    response = client.post(path(saved) + suffix, json=command(saved), headers={"Origin": ORIGIN})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["persisted"] is False
    assert result["baseline"]["assessment"] == saved["assessment"]
    assert result["scenarios"][0]["current_facts"]["ebitda"]["raw_value"] == 210000
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert "idempotency-replayed" not in response.headers
    assert counts() == before
    assert client.get(f"/cases/{saved['case_id']}").json() == saved
    assert client.post(path(saved) + suffix, json=command(saved)).json() == result


@pytest.mark.parametrize("field,value", [
    ("revenue_change", True), ("revenue_change", "-0.1"), ("revenue_change", -1.01),
    ("cogs_change", False), ("cogs_change", -1.0001),
    ("operating_expense_change", "0"), ("operating_expense_change", -2),
    ("proposed_rate_change_bps", True), ("proposed_rate_change_bps", "200"),
    ("proposed_rate_change_bps", -1051), ("proposed_rate_change_bps", 8951),
    ("revenue_change", 1e308), ("cogs_change", 1e308),
])
def test_invalid_shocks_reject_without_records_or_financial_value_echo(client, saved, field, value):
    body, before = command(saved), counts()
    body["scenarios"][0]["assumptions"][field] = value
    response = client.post(path(saved), json=body, headers={"Origin": ORIGIN})
    assert response.status_code == 422, response.text
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert counts() == before
    assert "Traceback" not in response.text
    if isinstance(response.json()["detail"], list):
        assert all("input" not in error for error in response.json()["detail"])


@pytest.mark.parametrize("mutation", ["missing", "unknown_assumption", "unknown_scenario", "unknown_root", "duplicate", "empty", "eleven",
                                      "blank_name", "long_name", "blank_rationale", "long_rationale", "bad_key", "long_key"])
def test_strict_command_and_request_bounds(client, saved, mutation):
    body = command(saved)
    item = body["scenarios"][0]
    if mutation == "missing":
        del item["assumptions"]["cogs_change"]
    elif mutation == "unknown_assumption":
        item["assumptions"]["officer_compensation_change"] = .1
    elif mutation == "unknown_scenario":
        item["policy_snapshot"] = {}
    elif mutation == "unknown_root":
        body["actor"] = "client supplied"
    elif mutation == "duplicate":
        body["scenarios"].append(deepcopy(item))
    elif mutation == "empty":
        body["scenarios"] = []
    elif mutation == "eleven":
        body["scenarios"] = [{**item, "scenario_key": str(i)} for i in range(11)]
    else:
        field, value = {
            "blank_name": ("name", "  "), "long_name": ("name", "n" * 121),
            "blank_rationale": ("rationale", "\t"), "long_rationale": ("rationale", "r" * 2001),
            "bad_key": ("scenario_key", "a/b"), "long_key": ("scenario_key", "k" * 65),
        }[mutation]
        item[field] = value
    assert client.post(path(saved), json=body).status_code == 422
    assert counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("suffix", ["", "/"])
@pytest.mark.parametrize("extra,expected", [(0, 200), (1, 413)])
def test_streamed_byte_limit_does_not_trust_content_length(client, saved, suffix, extra, expected):
    body = json.dumps(command(saved)).encode()
    body += b" " * (1_000_000 + extra - len(body))
    chunks = (body[i:i + 100003] for i in range(0, len(body), 100003))
    response = client.post(path(saved) + suffix, content=chunks,
                           headers={"Content-Type": "application/json", "Content-Length": "1", "Origin": ORIGIN})
    assert response.status_code == expected, response.text
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("raw", [b'{"x":1,"x":2}', b'{"x":NaN}', b'{"x":Infinity}', b'{"x":-Infinity}', b'{"x":"\xff"}', b'{', b''])
def test_raw_json_failures_are_bounded_and_cors_readable(client, saved, raw):
    response = client.post(path(saved), content=raw, headers={"Content-Type": "application/json", "Origin": ORIGIN})
    assert response.status_code == 422
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("kind,status", [("case", 400), ("revision", 400), ("zero", 400), ("negative", 400),
                                        ("huge", 400), ("run", 400), ("wrong_run", 409), ("missing", 404), ("missing_revision", 404)])
def test_locator_and_run_guards(client, saved, kind, status):
    target, body = path(saved), command(saved)
    if kind == "case":
        target = target.replace(saved["case_id"], "invalid")
    elif kind in ("revision", "zero", "negative", "huge"):
        target = target.replace("/revisions/1/", "/revisions/" + {"revision": "one", "zero": "0", "negative": "-1", "huge": "9223372036854775808"}[kind] + "/")
    elif kind in ("run", "wrong_run"):
        body["baseline_run_id"] = "invalid" if kind == "run" else str(uuid4())
    elif kind == "missing":
        target = target.replace(saved["case_id"], str(uuid4()))
    else:
        target = target.replace("/revisions/1/", "/revisions/2/")
    assert client.post(target, json=body).status_code == status
    assert counts() == [1, 1, 1, 1, 1]


def test_one_invalid_scenario_rejects_the_whole_preview(client, saved):
    body = command(saved)
    body["scenarios"].append({**deepcopy(body["scenarios"][0]), "scenario_key": "overflow"})
    body["scenarios"][1]["assumptions"]["revenue_change"] = 1e308
    response = client.post(path(saved), json=body)
    assert response.status_code == 422
    assert "Scenario 1 (overflow)" in response.json()["detail"]["message"]
    assert "scenarios" not in response.json()
    assert counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("state", ["unconfigured", "absent", "directory", "corrupt", "newer"])
def test_unavailable_storage_never_initializes_or_repairs_a_database(client, tmp_path, monkeypatch, state):
    target = tmp_path / "preview.sqlite3"
    if state == "unconfigured":
        monkeypatch.delenv("SPREADLINE_CASE_DB")
    else:
        monkeypatch.setenv("SPREADLINE_CASE_DB", str(target))
        if state == "directory":
            target.mkdir()
        elif state == "corrupt":
            target.write_bytes(b"not a sqlite database")
        elif state == "newer":
            with sqlite3.connect(target) as connection:
                connection.execute("PRAGMA user_version=99")
    before = target.read_bytes() if target.is_file() else None
    locator = dict(case_id=str(uuid4()), revision=1, run_id=str(uuid4()))
    response = client.post(path(locator), json=command(locator), headers={"Origin": ORIGIN})
    assert response.status_code == 503
    assert response.headers["access-control-allow-origin"] == ORIGIN
    if before is not None:
        assert target.read_bytes() == before
    elif state in ("absent", "unconfigured"):
        assert not target.exists()


def test_openapi_advertises_complete_strict_preview_contract(client):
    schema = client.get("/openapi.json").json()
    route = schema["paths"]["/cases/{case_id}/revisions/{revision}/scenarios/preview"]["post"]
    request = route["requestBody"]["content"]["application/json"]["schema"]
    assert request["$ref"].endswith("/ScenarioPreviewCommand")
    assert route["responses"]["200"]["content"]["application/json"]["schema"]["$ref"].endswith("/ScenarioPreview")
    for name in ("ScenarioPreviewCommand", "ScenarioCommand", "ScenarioAssumptions"):
        assert schema["components"]["schemas"][name]["additionalProperties"] is False
    assert set(schema["components"]["schemas"]["ScenarioAssumptions"]["required"]) == {
        "revenue_change", "cogs_change", "operating_expense_change", "proposed_rate_change_bps"}


@pytest.mark.parametrize("suffix", ["", "/"])
@pytest.mark.parametrize("declared_length", [None, b"1"])
def test_adapter_stops_reading_the_actual_stream_at_limit(client, saved, suffix, declared_length):
    async def exercise():
        messages = iter([
            {"type": "http.request", "body": b" " * 600_000, "more_body": True},
            {"type": "http.request", "body": b" " * 400_001, "more_body": True},
        ])
        sent, exhausted = [], False

        async def receive():
            nonlocal exhausted
            try:
                return next(messages)
            except StopIteration:
                exhausted = True
                return {"type": "http.disconnect"}

        async def send(message):
            sent.append(message)

        headers = [(b"origin", ORIGIN.encode()), (b"content-type", b"application/json")]
        if declared_length is not None:
            headers.append((b"content-length", declared_length))
        target = path(saved) + suffix
        scope = {"type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"}, "http_version": "1.1",
                 "method": "POST", "scheme": "http", "path": target, "raw_path": target.encode(),
                 "query_string": b"", "root_path": "", "headers": headers,
                 "client": ("127.0.0.1", 1234), "server": ("test", 80)}
        await app(scope, receive, send)
        response = next(m for m in sent if m["type"] == "http.response.start")
        assert response["status"] == 413
        assert dict(response["headers"])[b"access-control-allow-origin"] == ORIGIN.encode()
        assert not exhausted

    asyncio.run(exercise())
    assert counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("replacement", ['"cogs_change":0,"cogs_change":1', '"cogs_change":NaN',
                                         '"cogs_change":Infinity', '"cogs_change":1e999'])
def test_invalid_nested_json_is_rejected_before_typed_command(client, saved, replacement):
    raw = json.dumps(command(saved), separators=(",", ":")).replace('"cogs_change":0', replacement)
    response = client.post(path(saved), content=raw, headers={"Content-Type": "application/json", "Origin": ORIGIN})
    assert response.status_code == 422
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert counts() == [1, 1, 1, 1, 1]


def test_concurrent_edit_does_not_redirect_preview_or_block_the_event_loop(client, saved):
    started, release = Event(), Event()
    database = os.environ["SPREADLINE_CASE_DB"]

    def blocked_replay(request, policy):
        started.set()
        assert release.wait(timeout=10)
        return assess_commercial(request, policy)

    app.dependency_overrides[configured_read_store] = lambda: CaseStore(
        database, initialize=False, assessment_operation=blocked_replay)
    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            future = pool.submit(client.post, path(saved), json=command(saved))
            try:
                assert started.wait(timeout=5)
                assert pool.submit(client.get, "/health").result(timeout=2).status_code == 200
                writer = CaseStore(database, initialize=False)
                original = writer.get(saved["case_id"])
                from app.cases import etag_for
                edit = CaseEdit(field_path="/years/1/gross_receipts", new_value=4_500_000.0,
                                rationale="Concurrent synthetic correction")
                newer = writer.edit(saved["case_id"], edit, etag_for(original), str(uuid4()))
                assert newer.snapshot.revision == 2
            finally:
                release.set()
            response = future.result(timeout=5)
        assert response.status_code == 200, response.text
        result = response.json()
        assert result["baseline"]["revision"] == 1
        assert result["baseline"]["run_id"] == saved["run_id"]
        assert result["baseline"]["assessment"] == saved["assessment"]
        assert result["scenarios"][0]["projection_inputs"]["operating"]["gross_receipts"] == 3_780_000
        assert client.get(f"/cases/{saved['case_id']}").json()["revision"] == 2
        assert counts() == [1, 2, 2, 2, 2]
    finally:
        release.set()
        app.dependency_overrides.pop(configured_read_store)


def test_historical_preview_survives_restore_and_a_fresh_application_process(client, tmp_path, monkeypatch):
    original_command = {"input": json.loads(FIXTURE.read_text()), "rationale": "Synthetic baseline"}
    operation = str(uuid4())
    first = client.post("/cases", json=original_command, headers={"Idempotency-Key": operation})
    saved = first.json()
    second = client.post(f"/cases/{saved['case_id']}/revisions",
                         json={"field_path": "/proposed_loan/amount", "new_value": 600_000, "rationale": "New principal"},
                         headers={"If-Match": first.headers["etag"], "Idempotency-Key": str(uuid4())})
    assert second.status_code == 201
    expected = client.post(path(saved), json=command(saved))
    assert expected.status_code == 200
    backup, restored = tmp_path / "backup.sqlite3", tmp_path / "restored.sqlite3"
    CaseStore(os.environ["SPREADLINE_CASE_DB"], initialize=False).backup(backup)
    CaseStore.restore(backup, restored)
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(restored))
    source = '''import json, sys
from fastapi.testclient import TestClient
from app.main import app
target, body = json.load(sys.stdin)
with TestClient(app) as client:
    response = client.post(target, json=body)
    print(json.dumps({"status": response.status_code, "body": response.json()}))
'''
    process = subprocess.run([sys.executable, "-c", source], input=json.dumps([path(saved), command(saved)]),
                             capture_output=True, text=True, timeout=15)
    assert process.returncode == 0, process.stderr
    assert json.loads(process.stdout) == {"status": 200, "body": expected.json()}
    retried = client.post("/cases", json=original_command, headers={"Idempotency-Key": operation})
    assert retried.status_code == 201
    assert retried.json() == saved
    assert retried.headers["idempotency-replayed"] == "true"
    assert counts() == [1, 2, 2, 2, 2]


@pytest.mark.parametrize("kind,status,code", [
    ("unsupported", 409, "baseline_unsupported"),
    ("mismatch", 409, "baseline_replay_mismatch"),
    ("unavailable", 409, "baseline_replay_unavailable"),
    ("malformed", 503, "storage_integrity"),
])
def test_retained_baseline_stays_readable_when_preview_is_not_supported(client, kind, status, code):
    def recorded_assessment(request, policy):
        result = assess_commercial(request, policy)
        if kind == "unsupported":
            return result.model_copy(update={"calculation_version": "retired-calculation"})
        if kind == "mismatch":
            return result.model_copy(update={"decision": result.decision.model_copy(update={"outcome": "decline"})})
        if kind == "malformed":
            from types import SimpleNamespace
            raw = result.model_dump(mode="json")
            del raw["current_facts"]
            return SimpleNamespace(model_dump=lambda **kwargs: raw)
        return result

    store = CaseStore(os.environ["SPREADLINE_CASE_DB"], assessment_operation=recorded_assessment)
    create = CaseCreate.model_validate_json(json.dumps({"input": json.loads(FIXTURE.read_text()), "rationale": "Retained baseline"}))
    saved = store.create(create, str(uuid4())).snapshot.model_dump(mode="json")
    if kind == "unavailable":
        def unavailable(*args):
            raise ValueError("Retained definition cannot be evaluated")
        app.dependency_overrides[configured_read_store] = lambda: CaseStore(
            store.path, initialize=False, assessment_operation=unavailable)
    before = store.path.read_bytes()
    assert client.get(f"/cases/{saved['case_id']}").json() == saved
    response = client.post(path(saved), json=command(saved), headers={"Origin": ORIGIN})
    assert response.status_code == status, response.text
    assert response.json()["detail"]["code"] == code
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert store.path.read_bytes() == before
    assert counts() == [1, 1, 1, 1, 1]


def test_exclusive_storage_lock_returns_readable_retry_without_writing(client, saved):
    database = os.environ["SPREADLINE_CASE_DB"]
    writer = sqlite3.connect(database, autocommit=True)
    writer.execute("BEGIN EXCLUSIVE")
    app.dependency_overrides[configured_read_store] = lambda: CaseStore(database, initialize=False, timeout=.02)
    try:
        response = client.post(path(saved), json=command(saved), headers={"Origin": ORIGIN})
        assert response.status_code == 503
        assert response.json()["detail"]["code"] == "storage_busy"
        assert response.headers["retry-after"] == "1"
        assert response.headers["access-control-allow-origin"] == ORIGIN
    finally:
        app.dependency_overrides.pop(configured_read_store)
        writer.execute("ROLLBACK")
        writer.close()
    assert counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("suffix", ["", "/"])
def test_preview_method_is_post_only(client, saved, suffix):
    response = client.get(path(saved) + suffix, headers={"Origin": ORIGIN})
    assert response.status_code == 405
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert counts() == [1, 1, 1, 1, 1]


def test_maximum_batch_returns_trimmed_literal_text_and_stored_policy(client, saved):
    body = command(saved)
    text = '<script>alert("synthetic")</script>'
    body["scenarios"] = [{**deepcopy(body["scenarios"][0]), "scenario_key": f"s-{index}",
                          "name": "  " + text + "  ", "rationale": "  " + "r" * 2000 + "  "}
                         for index in range(10)]
    response = client.post(path(saved), json=body)
    assert response.status_code == 200, response.text
    assert response.headers["content-type"] == "application/json"
    assert [item["scenario_key"] for item in response.json()["scenarios"]] == [f"s-{i}" for i in range(10)]
    assert all(item["name"] == text and item["rationale"] == "r" * 2000 for item in response.json()["scenarios"])
    assert response.json()["policy_snapshot"] == saved["assessment"]["policy_snapshot"]
    assert counts() == [1, 1, 1, 1, 1]


@pytest.mark.parametrize("field", ["name", "rationale"])
@pytest.mark.parametrize("value", [True, 17, None])
def test_text_trimming_preserves_strict_string_types(client, saved, field, value):
    body = command(saved)
    body["scenarios"][0][field] = value
    assert client.post(path(saved), json=body).status_code == 422
    assert counts() == [1, 1, 1, 1, 1]
