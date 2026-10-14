import pytest
from fastapi.testclient import TestClient

from app.assessment_contracts import MAX_REQUEST_BYTES
from app.main import app
from fixtures import alpine_request


@pytest.mark.parametrize("path", [
    "/commercial/decision", "/consumer/decision", "/sba/evaluate", "/commercial/assessment",
])
@pytest.mark.parametrize("media_type", [None, "application/json", "application/problem+json", "text/plain"])
def test_post_body_budget_is_enforced_before_decoding(path, media_type):
    headers = {"Origin": "http://localhost:5173", "Content-Length": "2"}
    if media_type is not None:
        headers["Content-Type"] = media_type
    response = TestClient(app, raise_server_exceptions=False).post(
        path, content=b"{}" + b" " * (MAX_REQUEST_BYTES - 1), headers=headers,
    )
    assert response.status_code == 413, f"Unexpected HTTP {response.status_code}"
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_request_at_budget_remains_readable_by_downstream_validation():
    raw = alpine_request().model_dump_json().encode()
    response = TestClient(app).post(
        "/commercial/decision", content=raw + b" " * (MAX_REQUEST_BYTES - len(raw)),
        headers={"Content-Type": "application/json"},
    )
    assert response.status_code == 200, response.text


def test_commercial_huge_integer_term_is_a_validation_error():
    payload = alpine_request().model_dump()
    payload["proposed_loan"]["term_months"] = 10 ** 400
    response = TestClient(app, raise_server_exceptions=False).post("/commercial/decision", json=payload)
    assert response.status_code == 422, response.text


@pytest.mark.parametrize("size", [0, 1, 99, 100, 101, 200])
def test_stream_budget_counts_actual_chunks_and_preserves_allowed_body(size):
    import asyncio

    from app.request_limits import RequestBodyLimitMiddleware

    calls, responses = [], []
    messages = iter([
        {"type": "http.request", "body": b"x" * min(size, 100), "more_body": size > 100},
        {"type": "http.request", "body": b"x" * max(0, size - 100), "more_body": False},
    ])

    async def receive():
        return next(messages)

    async def send(message):
        responses.append(message)

    async def downstream(scope, read, write):
        calls.append(await read())

    middleware = RequestBodyLimitMiddleware(downstream, max_bytes=100)
    asyncio.run(middleware({"type": "http", "method": "POST"}, receive, send))
    if size <= 100:
        assert calls == [{"type": "http.request", "body": b"x" * size, "more_body": False}]
        assert responses == []
    else:
        assert calls == []
        assert responses[0]["status"] == 413


def test_stream_budget_does_not_drain_after_limit_is_exceeded():
    import asyncio

    from app.request_limits import RequestBodyLimitMiddleware

    reads, responses = [], []

    async def receive():
        reads.append(True)
        if len(reads) > 1:
            raise AssertionError("Oversized requests must not be drained into memory")
        return {"type": "http.request", "body": b"x" * 101, "more_body": True}

    async def send(message):
        responses.append(message)

    async def downstream(scope, read, write):
        raise AssertionError("Oversized requests must not enter route processing")

    asyncio.run(RequestBodyLimitMiddleware(downstream, max_bytes=100)(
        {"type": "http", "method": "POST"}, receive, send,
    ))
    assert len(reads) == 1
    assert responses[0]["status"] == 413
