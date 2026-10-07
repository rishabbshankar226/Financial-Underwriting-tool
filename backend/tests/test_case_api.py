"""Case transport must retain the assessment route's early streaming guard."""
import asyncio
import json
from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient
import pytest

from app.main import app

ORIGIN = "http://localhost:5173"


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(tmp_path / "cases.sqlite3"))
    with TestClient(app) as instance:
        yield instance


@pytest.fixture
def command():
    payload = json.loads((Path(__file__).resolve().parents[1] / "fixtures/alpine_dated.json").read_text())
    return {"input": payload, "rationale": "Initial synthetic example"}


def create(client, command, operation=None):
    response = client.post("/cases", json=command, headers={"Idempotency-Key": operation or str(uuid4()), "Origin": ORIGIN})
    assert response.status_code == 201, response.text
    return response


def test_complete_create_edit_read_and_old_retry_contract(client, command):
    operation = str(uuid4())
    first = create(client, command, operation)
    case_id = first.json()["case_id"]
    assert first.headers["etag"].startswith('"case-json-v1:')
    assert first.headers["idempotency-replayed"] == "false"
    assert client.get(f"/cases/{case_id}").content == first.content
    assert first.headers["access-control-allow-origin"] == ORIGIN
    assert "etag" in first.headers["access-control-expose-headers"].lower()
    assert "idempotency-replayed" in first.headers["access-control-expose-headers"].lower()
    second = client.post(f"/cases/{case_id}/revisions", json={"field_path": "/years/0/cogs", "new_value": 2_600_000, "rationale": "Correct older period"},
                         headers={"If-Match": first.headers["etag"], "Idempotency-Key": str(uuid4())})
    assert second.status_code == 201, second.text
    assert second.json()["event"]["context"]["period_start"] == "2024-01-01"
    latest = client.get(f"/cases/{case_id}")
    assert latest.json() == second.json() and latest.headers["etag"] == second.headers["etag"]
    assert latest.content == second.content
    assert client.get(f"/cases/{case_id}/revisions/1").json() == first.json()
    assert client.get(f"/cases/{case_id}/revisions/1").content == first.content
    retried = create(client, command, operation)
    assert retried.content == first.content and retried.headers["etag"] == first.headers["etag"]
    assert retried.headers["idempotency-replayed"] == "true"
    assert client.post(f"/cases/{case_id}/revisions/1/replay").json()["status"] == "matched"
    assert [row["revision"] for row in client.get(f"/cases/{case_id}/revisions").json()["items"]] == [2, 1]


@pytest.mark.parametrize("etag,status", [(None, 428), ('W/"weak"', 400), ("*", 400), ('"a","b"', 400),
                                        ("unquoted", 400), ('"stale"', 412)])
def test_edit_preconditions_reject_without_advancing_head(client, command, etag, status):
    first = create(client, command)
    case_id = first.json()["case_id"]
    headers = {"Idempotency-Key": str(uuid4()), "Origin": ORIGIN}
    if etag is not None:
        headers["If-Match"] = etag
    response = client.post(f"/cases/{case_id}/revisions", json={"field_path": "/proposed_loan/amount", "new_value": 600_000, "rationale": "Test"}, headers=headers)
    assert response.status_code == status, response.text
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert client.get(f"/cases/{case_id}").json() == first.json()


def test_duplicate_headers_are_rejected(client, command):
    response = client.post("/cases", json=command, headers=[("Idempotency-Key", str(uuid4())), ("Idempotency-Key", str(uuid4()))])
    assert response.status_code == 400
    first = create(client, command)
    response = client.post(f'/cases/{first.json()["case_id"]}/revisions',
                           json={"field_path": "/proposed_loan/amount", "new_value": 600_000, "rationale": "Test"},
                           headers=[("Idempotency-Key", str(uuid4())), ("If-Match", first.headers["etag"]), ("If-Match", first.headers["etag"])])
    assert response.status_code == 400


@pytest.mark.parametrize("key", [None, "not-uuid", ""])
def test_missing_or_invalid_operation_key_is_400(client, command, key):
    headers = {} if key is None else {"Idempotency-Key": key}
    assert client.post("/cases", json=command, headers=headers).status_code == 400


@pytest.mark.parametrize("field,value", [("actor", "verified-human"), ("revision", 5), ("before", 1),
                                       ("recorded_at", "2026-01-01"), ("assessment", {}), ("policy_snapshot", {})])
def test_client_cannot_supply_server_history_fields(client, command, field, value):
    command[field] = value
    response = client.post("/cases", json=command, headers={"Idempotency-Key": str(uuid4())})
    assert response.status_code == 422


@pytest.mark.parametrize("value", [True, "100", None])
def test_edit_values_are_strict_json_numbers(client, command, value):
    first = create(client, command)
    response = client.post(f'/cases/{first.json()["case_id"]}/revisions',
                           json={"field_path": "/proposed_loan/amount", "new_value": value, "rationale": "Test"},
                           headers={"Idempotency-Key": str(uuid4()), "If-Match": first.headers["etag"]})
    assert response.status_code == 422


@pytest.mark.parametrize("body", [b'{"a":1,"a":2}', b'{"a":NaN}', b'{"a":1e999}', b'\xff', b'{'])
@pytest.mark.parametrize("suffix", ["", "/"])
def test_raw_json_errors_are_bounded_and_cors_readable(client, body, suffix):
    response = client.post("/cases" + suffix, content=body, headers={"Origin": ORIGIN, "Idempotency-Key": str(uuid4())})
    assert response.status_code == 422
    assert response.headers["access-control-allow-origin"] == ORIGIN


@pytest.mark.parametrize("kind", ["create", "edit", "replay"])
@pytest.mark.parametrize("suffix", ["", "/"])
def test_exact_actual_byte_limit_and_trailing_routes(client, command, kind, suffix):
    first = create(client, command)
    case_id = first.json()["case_id"]
    path = "/cases" if kind == "create" else f"/cases/{case_id}/revisions" + ("/1/replay" if kind == "replay" else "")
    payload = command if kind == "create" else ({"field_path": "/proposed_loan/amount", "new_value": 600_000, "rationale": "Test"} if kind == "edit" else {})
    body = json.dumps(payload).encode()
    body += b" " * (1_000_000 - len(body))
    headers = {"Origin": ORIGIN, "Idempotency-Key": str(uuid4()), "If-Match": first.headers["etag"]}
    response = client.post(path + suffix, content=body, headers=headers)
    assert response.status_code == (200 if kind == "replay" else 201), response.text
    headers["Idempotency-Key"] = str(uuid4())
    oversized = client.post(path + suffix, content=body + b" ", headers=headers)
    assert oversized.status_code == 413
    assert oversized.headers["access-control-allow-origin"] == ORIGIN


def test_streamed_body_stops_reading_at_limit(client, command):
    # Direct ASGI messages prove rejection before reading the remaining stream,
    # independent of Content-Length and TestClient's buffering.
    first = create(client, command)
    path = f'/cases/{first.json()["case_id"]}/revisions'
    async def exercise():
        messages = iter([{ "type": "http.request", "body": b" " * 600_000, "more_body": True},
                         { "type": "http.request", "body": b" " * 400_001, "more_body": True}])
        sent = []
        exhausted = False
        async def receive():
            nonlocal exhausted
            try:
                return next(messages)
            except StopIteration:
                exhausted = True
                return {"type": "http.disconnect"}
        async def send(message):
            sent.append(message)
        headers = [(b"origin", ORIGIN.encode()), (b"content-length", b"1"),
                   (b"idempotency-key", str(uuid4()).encode()), (b"if-match", first.headers["etag"].encode())]
        scope = {"type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"}, "http_version": "1.1",
                 "method": "POST", "scheme": "http", "path": path, "raw_path": path.encode(),
                 "query_string": b"", "root_path": "", "headers": headers,
                 "client": ("127.0.0.1", 1234), "server": ("test", 80)}
        await app(scope, receive, send)
        starts = [message for message in sent if message["type"] == "http.response.start"]
        assert starts[0]["status"] == 413
        assert not exhausted
    asyncio.run(exercise())


def test_typed_case_openapi_has_strict_commands(client):
    schema = client.get("/openapi.json").json()
    for path, name in [("/cases", "CaseCreate"), ("/cases/{case_id}/revisions", "CaseEdit")]:
        body = schema["paths"][path]["post"]["requestBody"]["content"]["application/json"]["schema"]
        assert body["$ref"].endswith("/" + name)
        assert schema["components"]["schemas"][name]["additionalProperties"] is False
    assert "input" in schema["components"]["schemas"]["CaseCreate"]["required"]


def test_unconfigured_storage_preserves_stateless_assessment(client, command, monkeypatch):
    monkeypatch.delenv("SPREADLINE_CASE_DB")
    response = client.get("/cases", headers={"Origin": ORIGIN})
    assert response.status_code == 503 and response.json()["detail"]["code"] == "storage_not_configured"
    assert response.headers["access-control-allow-origin"] == ORIGIN
    assert client.post("/commercial/assessment", json=command["input"]).status_code == 200


@pytest.mark.parametrize("path,status", [("/cases/not-uuid", 400), (f"/cases/{uuid4()}", 404),
                                        ("/cases?limit=101", 400), ("/cases?limit=1.5", 400),
                                        ("/cases?after=bad", 400)])
def test_invalid_identifiers_and_listing_parameters(client, path, status):
    assert client.get(path).status_code == status


def test_busy_storage_returns_retry_after_and_cors(client, command, monkeypatch):
    import os
    import sqlite3
    from app.case_routes import configured_store
    from app.cases import CaseStore
    create(client, command)
    path = os.environ["SPREADLINE_CASE_DB"]
    writer = sqlite3.connect(path, autocommit=True)
    writer.execute("BEGIN IMMEDIATE")
    app.dependency_overrides[configured_store] = lambda: CaseStore(path, timeout=0.02)
    try:
        response = client.post("/cases", json=command, headers={"Origin": ORIGIN, "Idempotency-Key": str(uuid4())})
        assert response.status_code == 503 and response.json()["detail"]["code"] == "storage_busy"
        assert response.headers["retry-after"] == "1"
        assert response.headers["access-control-allow-origin"] == ORIGIN
    finally:
        app.dependency_overrides.pop(configured_store)
        writer.execute("ROLLBACK")
        writer.close()


def test_new_application_process_reads_history_and_original_retry(client, command):
    import subprocess
    import sys
    first_operation = str(uuid4())
    first = create(client, command, first_operation)
    case_id = first.json()["case_id"]
    second = client.post(f"/cases/{case_id}/revisions", json={"field_path": "/proposed_loan/amount", "new_value": 600_000, "rationale": "Correct principal"},
                         headers={"Idempotency-Key": str(uuid4()), "If-Match": first.headers["etag"]})
    assert second.status_code == 201
    # A separate interpreter imports a new app and opens only the persisted file.
    script = '''
import json, sys
from fastapi.testclient import TestClient
from app.main import app
data = json.load(sys.stdin)
with TestClient(app) as client:
    latest = client.get('/cases/' + data['case_id'])
    old = client.get('/cases/' + data['case_id'] + '/revisions/1')
    retry = client.post('/cases', json=data['command'], headers={'Idempotency-Key': data['operation']})
    replay = client.post('/cases/' + data['case_id'] + '/revisions/1/replay')
    print(json.dumps({'latest': latest.text, 'old': old.text, 'retry': retry.text,
                      'etag': retry.headers['etag'], 'replayed': retry.headers['idempotency-replayed'],
                      'replay_status': replay.json()['status']}))
'''
    result = subprocess.run([sys.executable, "-c", script], input=json.dumps({"case_id": case_id, "operation": first_operation, "command": command}),
                            cwd=Path(__file__).resolve().parents[1], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    output = json.loads(result.stdout)
    assert output["latest"] == second.text
    assert output["old"] == output["retry"] == first.text
    assert output["etag"] == first.headers["etag"] and output["replayed"] == "true"
    assert output["replay_status"] == "matched"
