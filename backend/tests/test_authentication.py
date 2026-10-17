"""Observable single-operator HTTP access and audit-identity requirements."""

import json
import sqlite3
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path
from typing import Never
from uuid import uuid4

import app.main as main
import pytest
from app import analysis_routes, case_routes, json_transport, scenario_routes
from fastapi.testclient import TestClient
from httpx2 import Response

TOKEN = "synthetic-authentication-secret-" + "a" * 48
OPERATOR = "audit-operator-20261015"
WRONG_TOKEN = TOKEN[:-1] + "b"
CASE_ID = "00000000-0000-4000-8000-000000000001"
COMPARISON_ID = "00000000-0000-4000-8000-000000000002"
FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
ALLOWED_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173")


_CASE = f"/cases/{CASE_ID}"
PROTECTED_ROUTES = (
    ("POST", "/commercial/assessment"),
    ("POST", "/commercial/assessment/"),
    ("POST", "/commercial/analysis"),
    ("POST", "/commercial/analysis/"),
    ("POST", "/commercial/decision"),
    ("POST", "/consumer/decision"),
    ("POST", "/sba/evaluate"),
    *((method, path + suffix) for method, path in (
        ("POST", "/cases"),
        ("GET", "/cases"),
        ("GET", _CASE),
        ("GET", _CASE + "/revisions"),
        ("POST", _CASE + "/revisions"),
        ("GET", _CASE + "/revisions/1"),
        ("POST", _CASE + "/revisions/1/replay"),
        ("POST", _CASE + "/revisions/1/analysis"),
        ("POST", _CASE + "/revisions/1/scenarios/preview"),
        ("POST", _CASE + "/revisions/1/scenario-comparisons"),
        ("GET", _CASE + "/scenario-comparisons"),
        ("GET", _CASE + "/scenario-comparisons/" + COMPARISON_ID),
    ) for suffix in ("", "/")),
    *((method, path) for path in ("/openapi.json", "/docs", "/redoc", "/docs/oauth2-redirect")
      for method in ("GET", "HEAD")),
)


@dataclass(frozen=True)
class AuthRuntime:
    client: TestClient
    database: Path

    @property
    def headers(self) -> dict[str, str]:
        return {"Authorization": "Bearer " + TOKEN}


@pytest.fixture
def runtime(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Iterator[AuthRuntime]:
    database = tmp_path / "operator.sqlite3"
    monkeypatch.setenv("SPREADLINE_API_TOKEN", TOKEN)
    monkeypatch.setenv("SPREADLINE_OPERATOR_ID", OPERATOR)
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(database))
    with TestClient(main.app, raise_server_exceptions=False) as client:
        client.headers.pop("authorization", None)
        yield AuthRuntime(client, database)


@pytest.fixture
def sensitive_calls(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    calls: list[str] = []

    def storage(*args: object, **kwargs: object) -> Never:
        calls.append("storage")
        raise AssertionError("Rejected HTTP request reached a storage constructor")

    def calculation(*args: object, **kwargs: object) -> Never:
        calls.append("calculation")
        raise AssertionError("Rejected HTTP request reached a financial calculation")

    monkeypatch.setattr(case_routes, "CaseStore", storage)
    monkeypatch.setattr(scenario_routes, "CaseStore", storage)
    monkeypatch.setattr(analysis_routes, "analyze_commercial", calculation)
    monkeypatch.setattr(analysis_routes, "analyze_saved_revision", calculation)
    for name in (
        "assess_commercial",
        "decide_commercial",
        "decide_consumer",
        "evaluate_sba",
        "load_size_table",
    ):
        monkeypatch.setattr(main, name, calculation)
    return calls


def _assert_no_secret(response: Response, *additional: str) -> None:
    public = response.text + repr(dict(response.headers))
    for value in (TOKEN, WRONG_TOKEN, *additional):
        if value:
            assert value not in public


def _assert_unauthorized(response: Response) -> None:
    assert response.status_code == 401, (response.status_code, response.text[:300])
    assert response.headers.get("www-authenticate", "").split(" ", 1)[0].lower() == "bearer"
    _assert_no_secret(response)


def _dated_input() -> object:
    return json.loads((FIXTURES / "alpine_dated.json").read_text())


def _create(runtime: AuthRuntime, *, key: str | None = None) -> Response:
    return runtime.client.post(
        "/cases",
        headers={**runtime.headers, "Idempotency-Key": key or str(uuid4())},
        json={"input": _dated_input(), "rationale": "Authenticated synthetic case"},
    )


@pytest.mark.parametrize("method,path", PROTECTED_ROUTES)
@pytest.mark.parametrize("credential", ("missing", "wrong", "duplicate"))
def test_every_financial_storage_and_documentation_route_requires_one_bearer(
    runtime: AuthRuntime, sensitive_calls: list[str], method: str, path: str, credential: str
) -> None:
    headers = []
    if credential == "wrong":
        headers = [("Authorization", "Bearer " + WRONG_TOKEN)]
    elif credential == "duplicate":
        headers = [
            ("Authorization", "Bearer " + TOKEN),
            ("authorization", "Bearer " + TOKEN),
        ]
    response = runtime.client.request(method, path, headers=headers, json={} if method == "POST" else None)
    assert sensitive_calls == []
    _assert_unauthorized(response)
    assert not runtime.database.exists()


@pytest.mark.parametrize(
    "authorization",
    (
        b"",
        b"Bearer",
        b"Bearer ",
        b"Basic " + TOKEN.encode(),
        b"Bearer " + WRONG_TOKEN.encode(),
        b"Bearer " + TOKEN.encode() + b" extra",
        b"Bearer " + TOKEN.encode() + b", Bearer " + TOKEN.encode(),
        b"Bearer " + b"x" * 4097,
        b"Bearer \xff",
        b"Bearer " + TOKEN.encode() + b"\x00",
        b"Bearer " + TOKEN.encode() + b"\r\n",
    ),
    ids=("empty", "scheme-only", "empty-token", "basic", "wrong", "extra", "combined", "oversized", "non-ascii", "nul", "newline"),
)
def test_malformed_bearer_headers_fail_before_storage(
    runtime: AuthRuntime, sensitive_calls: list[str], authorization: bytes
) -> None:
    response = runtime.client.get("/cases", headers=[(b"authorization", authorization)])
    assert sensitive_calls == []
    _assert_unauthorized(response)
    assert not runtime.database.exists()


@pytest.mark.parametrize("first_correct", (False, True))
def test_duplicate_correct_and_wrong_headers_never_select_one_credential(
    runtime: AuthRuntime, sensitive_calls: list[str], first_correct: bool
) -> None:
    values = (TOKEN, WRONG_TOKEN) if first_correct else (WRONG_TOKEN, TOKEN)
    response = runtime.client.get("/cases", headers=[("Authorization", "Bearer " + value) for value in values])
    assert sensitive_calls == []
    _assert_unauthorized(response)


@pytest.mark.parametrize("endpoint,fixture", (("/commercial/assessment", "alpine_dated.json"), ("/commercial/decision", "alpine.json")))
def test_unauthorized_valid_financial_inputs_never_reach_arithmetic(
    runtime: AuthRuntime, sensitive_calls: list[str], endpoint: str, fixture: str
) -> None:
    response = runtime.client.post(endpoint, content=(FIXTURES / fixture).read_bytes(), headers={"Content-Type": "application/json"})
    assert sensitive_calls == []
    _assert_unauthorized(response)


def test_unauthorized_body_is_not_read_or_parsed(
    runtime: AuthRuntime, sensitive_calls: list[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    body_reads: list[str] = []

    def body() -> Iterator[bytes]:
        body_reads.append("read")
        yield b"{" + b" " * 1_000_001

    def parse(*args: object, **kwargs: object) -> Never:
        body_reads.append("parsed")
        raise AssertionError("Unauthenticated request JSON was parsed")

    monkeypatch.setattr(main, "parse_structured", parse)
    monkeypatch.setattr(json_transport, "parse_structured", parse)
    response = runtime.client.post("/commercial/assessment", content=body())
    assert body_reads == []
    assert sensitive_calls == []
    _assert_unauthorized(response)


@pytest.mark.parametrize("variable", ("SPREADLINE_API_TOKEN", "SPREADLINE_OPERATOR_ID"))
@pytest.mark.parametrize("missing", (True, False), ids=("unset", "blank"))
def test_unconfigured_access_fails_closed_with_named_nonsecret_error(
    runtime: AuthRuntime, sensitive_calls: list[str], monkeypatch: pytest.MonkeyPatch, variable: str, missing: bool
) -> None:
    if missing:
        monkeypatch.delenv(variable)
    else:
        monkeypatch.setenv(variable, " ")
    response = runtime.client.get("/cases", headers=runtime.headers)
    assert sensitive_calls == []
    assert response.status_code == 503, response.text
    assert variable in response.text
    _assert_no_secret(response)
    assert not runtime.database.exists()


@pytest.mark.parametrize(
    "variable,value",
    (
        ("SPREADLINE_API_TOKEN", "x" * 31),
        ("SPREADLINE_API_TOKEN", "x" * 4097),
        ("SPREADLINE_API_TOKEN", "x" * 32 + "\n"),
        ("SPREADLINE_API_TOKEN", "x" * 32 + "é"),
        ("SPREADLINE_OPERATOR_ID", "x" * 129),
        ("SPREADLINE_OPERATOR_ID", "forged\noperator"),
        ("SPREADLINE_OPERATOR_ID", "opérateur"),
        ("SPREADLINE_OPERATOR_ID", "prototype-demo-unverified"),
    ),
    ids=("short-token", "long-token", "token-control", "token-nonascii", "long-operator", "operator-control", "operator-nonascii", "reserved-actor"),
)
def test_invalid_protection_configuration_is_bounded_and_never_echoed(
    runtime: AuthRuntime, sensitive_calls: list[str], monkeypatch: pytest.MonkeyPatch, variable: str, value: str
) -> None:
    monkeypatch.setenv(variable, value)
    response = runtime.client.get("/cases", headers=runtime.headers)
    assert sensitive_calls == []
    assert response.status_code == 503, response.text
    assert variable in response.text
    _assert_no_secret(response, value)


def test_health_is_minimal_and_public_even_when_authentication_is_unconfigured(
    runtime: AuthRuntime, sensitive_calls: list[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.delenv("SPREADLINE_API_TOKEN")
    monkeypatch.delenv("SPREADLINE_OPERATOR_ID")
    response = runtime.client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert sensitive_calls == []
    assert not runtime.database.exists()
    _assert_no_secret(response)


@pytest.mark.parametrize("path", ("/healthz", "/health/cases", "/health/../cases"))
def test_public_health_exception_does_not_cover_other_paths(
    runtime: AuthRuntime, sensitive_calls: list[str], path: str
) -> None:
    response = runtime.client.get(path)
    assert sensitive_calls == []
    _assert_unauthorized(response)


@pytest.mark.parametrize("scheme", ("Bearer", "bearer", "BEARER"))
def test_valid_credentials_unlock_financial_routes_and_documentation(runtime: AuthRuntime, scheme: str) -> None:
    headers = {"Authorization": scheme + " " + TOKEN}
    response = runtime.client.post("/commercial/assessment", headers=headers, json=_dated_input())
    assert response.status_code == 200, response.text
    assert response.json()["schema_version"] == "commercial-assessment-v2"
    for path in ("/openapi.json", "/docs", "/redoc", "/docs/oauth2-redirect"):
        documented = runtime.client.get(path, headers=headers)
        assert documented.status_code == 200, documented.text
        _assert_no_secret(documented)
    _assert_no_secret(response)
    assert not runtime.database.exists()


@pytest.mark.parametrize("length", (32, 4096))
def test_documented_token_length_boundaries_remain_usable(
    runtime: AuthRuntime, monkeypatch: pytest.MonkeyPatch, length: int
) -> None:
    token = "s" * length
    monkeypatch.setenv("SPREADLINE_API_TOKEN", token)
    response = runtime.client.get("/openapi.json", headers={"Authorization": "Bearer " + token})
    assert response.status_code == 200, response.text
    _assert_no_secret(response, token)


@pytest.mark.parametrize("origin", ALLOWED_ORIGINS)
def test_allowed_preflight_is_public_and_cannot_initialize_storage(
    runtime: AuthRuntime, sensitive_calls: list[str], monkeypatch: pytest.MonkeyPatch, origin: str
) -> None:
    monkeypatch.delenv("SPREADLINE_API_TOKEN")
    monkeypatch.delenv("SPREADLINE_OPERATOR_ID")
    response = runtime.client.options("/cases", headers={
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type,idempotency-key,if-match",
    })
    assert response.status_code in (200, 204), response.text
    assert response.headers.get("access-control-allow-origin") == origin
    assert "authorization" in response.headers.get("access-control-allow-headers", "").lower()
    assert response.headers.get("access-control-allow-credentials") != "true"
    assert sensitive_calls == []
    assert not runtime.database.exists()


@pytest.mark.parametrize("origin", ("https://untrusted.example", "null", "http://localhost:5173.untrusted.example"))
def test_untrusted_preflight_has_no_cross_origin_permission(
    runtime: AuthRuntime, sensitive_calls: list[str], origin: str
) -> None:
    response = runtime.client.options("/cases", headers={
        "Origin": origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization",
    })
    assert response.status_code in (400, 403)
    assert "access-control-allow-origin" not in response.headers
    assert sensitive_calls == []
    assert not runtime.database.exists()


@pytest.mark.parametrize("origin", (*ALLOWED_ORIGINS, "https://untrusted.example"))
def test_authentication_failures_keep_only_explicit_cors_permissions(
    runtime: AuthRuntime, sensitive_calls: list[str], origin: str
) -> None:
    response = runtime.client.get("/cases", headers={"Origin": origin})
    assert sensitive_calls == []
    _assert_unauthorized(response)
    if origin in ALLOWED_ORIGINS:
        assert response.headers.get("access-control-allow-origin") == origin
        assert "origin" in response.headers.get("vary", "").lower()
    else:
        assert "access-control-allow-origin" not in response.headers
    assert response.headers.get("access-control-allow-credentials") != "true"


@pytest.mark.parametrize("spoofed_field", ("actor", "owner", "operator_id", "database"))
def test_case_create_rejects_caller_supplied_authority(runtime: AuthRuntime, spoofed_field: str) -> None:
    response = runtime.client.post("/cases", headers={**runtime.headers, "Idempotency-Key": str(uuid4())}, json={
        "input": _dated_input(), "rationale": "Refused authority override", spoofed_field: "forged-operator",
    })
    assert response.status_code == 422, response.text
    _assert_no_secret(response)
    if runtime.database.exists():
        with sqlite3.connect(runtime.database) as connection:
            assert connection.execute("SELECT count(*) FROM events").fetchone()[0] == 0


def test_new_events_and_comparisons_use_server_identity_and_never_store_token(
    runtime: AuthRuntime, caplog: pytest.LogCaptureFixture
) -> None:
    key = str(uuid4())
    created = runtime.client.post("/cases", headers={**runtime.headers, "Idempotency-Key": key,
        "X-Actor": "forged-actor", "X-Operator-ID": "forged-operator", "X-Database": "untrusted.sqlite3"},
        json={"input": _dated_input(), "rationale": "Authenticated synthetic case"})
    assert created.status_code == 201, created.text
    first = created.json()
    assert first["event"]["actor"] == OPERATOR
    edited = runtime.client.post(f"/cases/{first['case_id']}/revisions", headers={**runtime.headers,
        "Idempotency-Key": str(uuid4()), "If-Match": created.headers["etag"], "X-Actor": "forged-actor"},
        json={"field_path": "/proposed_loan/annual_rate", "new_value": "0.125", "rationale": "Authenticated rate review"})
    assert edited.status_code == 201, edited.text
    current = edited.json()
    assert current["event"]["actor"] == OPERATOR
    path = f"/cases/{first['case_id']}/revisions/2"
    command = {"schema_version": "commercial-scenario-preview-v2", "baseline_run_id": current["run_id"],
        "scenarios": [{"scenario_key": "zero", "name": "Zero shock", "rationale": "Authenticated review",
            "assumptions": {"revenue_change": "0", "cogs_change": "0", "operating_expense_change": "0", "proposed_rate_change_bps": "0"}}]}
    previewed = runtime.client.post(path + "/scenarios/preview", headers=runtime.headers, json=command)
    assert previewed.status_code == 200, previewed.text
    retained = runtime.client.post(path + "/scenario-comparisons", headers={**runtime.headers,
        "Idempotency-Key": str(uuid4()), "X-Actor": "forged-actor"}, json={**command,
        "schema_version": "commercial-scenario-comparison-create-v2",
        "expected_preview_fingerprint": previewed.json()["fingerprint"]["value"]})
    assert retained.status_code == 201, retained.text
    assert retained.json()["actor"] == OPERATOR
    for response in (created, edited, previewed, retained):
        _assert_no_secret(response)
        assert "forged-actor" not in response.text
        assert "forged-operator" not in response.text
    assert runtime.database.exists()
    assert TOKEN.encode() not in runtime.database.read_bytes()
    with sqlite3.connect(runtime.database) as connection:
        dump = "\n".join(connection.iterdump())
        assert TOKEN not in dump
        assert "forged-actor" not in dump
        assert "forged-operator" not in dump
    assert TOKEN not in caplog.text


def test_operator_and_token_rotation_preserve_old_receipt_bytes(
    runtime: AuthRuntime, monkeypatch: pytest.MonkeyPatch
) -> None:
    key = str(uuid4())
    created = _create(runtime, key=key)
    assert created.status_code == 201, created.text
    first = created.json()
    assert first["event"]["actor"] == OPERATOR
    token, operator = "rotated-synthetic-secret-" + "z" * 48, "rotated-audit-operator"
    monkeypatch.setenv("SPREADLINE_API_TOKEN", token)
    monkeypatch.setenv("SPREADLINE_OPERATOR_ID", operator)
    old = runtime.client.get(f"/cases/{first['case_id']}", headers=runtime.headers)
    _assert_unauthorized(old)
    new_headers = {"Authorization": "Bearer " + token}
    recovered = runtime.client.post("/cases", headers={**new_headers, "Idempotency-Key": key},
        json={"input": _dated_input(), "rationale": "Authenticated synthetic case"})
    assert recovered.status_code == 201, recovered.text
    assert recovered.headers.get("idempotency-replayed") == "true"
    assert recovered.content == created.content
    assert recovered.headers["etag"] == created.headers["etag"]
    assert recovered.json()["event"]["actor"] == OPERATOR
    edited = runtime.client.post(f"/cases/{first['case_id']}/revisions", headers={**new_headers,
        "Idempotency-Key": str(uuid4()), "If-Match": created.headers["etag"]}, json={
        "field_path": "/proposed_loan/amount", "new_value": "600000", "rationale": "New credential identity"})
    assert edited.status_code == 201, edited.text
    assert edited.json()["event"]["actor"] == operator
    original = runtime.client.get(f"/cases/{first['case_id']}/revisions/1", headers=new_headers)
    assert original.status_code == 200
    assert original.content == created.content
    for response in (old, recovered, edited, original):
        _assert_no_secret(response, token)
    assert token.encode() not in runtime.database.read_bytes()


def test_maximum_operator_identifier_is_recorded_without_truncation(
    runtime: AuthRuntime, monkeypatch: pytest.MonkeyPatch
) -> None:
    operator = "o" * 128
    monkeypatch.setenv("SPREADLINE_OPERATOR_ID", operator)
    created = _create(runtime)
    assert created.status_code == 201, created.text
    assert created.json()["event"]["actor"] == operator
    _assert_no_secret(created)


def test_operator_identity_cannot_be_the_secret_credential(
    runtime: AuthRuntime, sensitive_calls: list[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("SPREADLINE_OPERATOR_ID", TOKEN)
    response = runtime.client.get("/cases", headers=runtime.headers)
    assert response.status_code == 503
    assert "SPREADLINE_OPERATOR_ID" in response.text
    assert sensitive_calls == []
    assert not runtime.database.exists()
    _assert_no_secret(response)
