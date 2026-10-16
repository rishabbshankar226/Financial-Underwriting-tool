"""Bounded, session-local transport into the existing authenticated ASGI app."""

import asyncio
import json
import os
import re
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass
from typing import TypedDict, cast
from urllib.parse import parse_qsl, urlsplit
from uuid import UUID

from starlette.types import ASGIApp, Message, Scope

from backend.app.main import app

MAX_BODY = 1_000_000
MAX_RESPONSE = 16_777_216
MAX_BATCH = 4
MAX_BATCH_RESPONSE = 20_971_520
_UUID = r"[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}"
_CASE = rf"/cases/{_UUID}"
_REVISION = rf"{_CASE}/revisions/[1-9][0-9]{{0,18}}"
_ROUTES = {
    "GET": re.compile(
        rf"(?:/cases|{_CASE}|{_CASE}/revisions|{_REVISION}|{_CASE}/scenario-comparisons(?:/{_UUID})?)"
    ),
    "POST": re.compile(
        rf"(?:/commercial/(?:assessment|decision)|/cases|{_CASE}/revisions|{_REVISION}/(?:replay|scenarios/preview|scenario-comparisons))"
    ),
}
_REQUEST_HEADERS = {"content-type", "accept", "idempotency-key", "if-match"}
_RESPONSE_HEADERS = {
    "content-type",
    "etag",
    "location",
    "retry-after",
    "idempotency-replayed",
    "cache-control",
}


class BridgeReply(TypedDict, total=False):
    id: str
    status: int
    headers: dict[str, str]
    body: str
    error: str


class CommandError(Exception):
    def __init__(self, status: int, code: str, message: str) -> None:
        self.status, self.code, self.message = status, code, message


def _uuid(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("Expected a UUID")
    if str(UUID(value)) != value:
        raise ValueError("Expected a canonical UUID")
    return value


@dataclass(frozen=True)
class BridgeRequest:
    id: str
    generation: str
    method: str
    path: str
    body: bytes
    headers: tuple[tuple[str, str], ...]

    @classmethod
    def parse(cls, value: object) -> "BridgeRequest":
        if not isinstance(value, dict) or set(value) != {
            "id",
            "generation",
            "method",
            "path",
            "body",
            "headers",
        }:
            raise ValueError("Invalid bridge command fields")
        command = cast(dict[str, object], value)
        method, path, body = command["method"], command["path"], command["body"]
        if not isinstance(method, str) or method not in _ROUTES:
            raise ValueError("Unsupported bridge method")
        if not isinstance(path, str) or len(path) > 2048 or not path.isascii():
            raise ValueError("Invalid bridge route")
        target = urlsplit(path)
        if (
            target.scheme
            or target.netloc
            or target.fragment
            or _ROUTES[method].fullmatch(target.path) is None
        ):
            raise ValueError("Unsupported bridge route")
        pairs = parse_qsl(target.query, keep_blank_values=True, strict_parsing=True)
        if pairs and (method != "GET" or any(k not in {"limit", "after"} for k, _ in pairs)):
            raise ValueError("Unsupported bridge query")
        if len({k for k, _ in pairs}) != len(pairs):
            raise ValueError("Duplicate query parameters")
        if not isinstance(body, str) or method == "GET" and body:
            raise ValueError("Invalid bridge body")
        encoded = body.encode("utf-8")
        if len(encoded) > MAX_BODY:
            raise CommandError(413, "request_too_large", "Use a request no larger than 1,000,000 bytes.")
        supplied = command["headers"]
        if not isinstance(supplied, dict) or len(supplied) > len(_REQUEST_HEADERS):
            raise ValueError("Invalid bridge headers")
        headers: dict[str, str] = {}
        for key, item in supplied.items():
            if not isinstance(key, str) or not isinstance(item, str) or key.lower() not in _REQUEST_HEADERS:
                raise ValueError("Unsupported bridge header")
            if (
                key.lower() in headers
                or len(item) > 4096
                or not item.isascii()
                or "\r" in item
                or "\n" in item
            ):
                raise ValueError("Invalid bridge header value")
            headers[key.lower()] = item
        return cls(
            _uuid(command["id"]),
            _uuid(command["generation"]),
            method,
            path,
            encoded,
            tuple(sorted(headers.items())),
        )


def _rejection(identifier: str, status: int, code: str, message: str) -> BridgeReply:
    return {
        "id": identifier,
        "status": status,
        "headers": {"content-type": "application/json"},
        "body": json.dumps({"detail": {"code": code, "message": message}}),
    }


async def _invoke(request: BridgeRequest, application: ASGIApp) -> BridgeReply:
    """Cap response bytes while ASGI sends them, before aggregating the body."""
    headers = [(k.encode("ascii"), v.encode("ascii")) for k, v in request.headers]
    token = os.environ.get("SPREADLINE_API_TOKEN", "")
    if token:
        headers.append((b"authorization", ("Bearer " + token).encode("ascii")))
    target = urlsplit(request.path)
    scope: Scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "scheme": "http",
        "method": request.method,
        "root_path": "",
        "path": target.path,
        "raw_path": target.path.encode("ascii"),
        "query_string": target.query.encode("ascii"),
        "headers": headers,
        "server": ("spreadline-embedded", 80),
        "client": ("127.0.0.1", 0),
    }
    received = False
    status = 0
    response_headers: dict[str, str] = {}
    body = bytearray()

    async def receive() -> Message:
        nonlocal received
        if not received:
            received = True
            return {"type": "http.request", "body": request.body, "more_body": False}
        await asyncio.Event().wait()
        return {"type": "http.disconnect"}

    async def send(message: Message) -> None:
        nonlocal status
        if message["type"] == "http.response.start":
            status = message["status"]
            for name, value in message.get("headers", []):
                key = name.decode("latin-1").lower()
                if key in _RESPONSE_HEADERS:
                    response_headers[key] = value.decode("latin-1")
        elif message["type"] == "http.response.body":
            chunk = message.get("body", b"")
            if len(body) + len(chunk) > MAX_RESPONSE:
                raise ValueError("Response exceeds the embedded transport limit")
            body.extend(chunk)

    async with asyncio.timeout(30):
        await application(scope, receive, send)
    if not status:
        raise ValueError("Missing application response")
    return {"id": request.id, "status": status, "headers": response_headers, "body": body.decode("utf-8")}


class BridgeSession:
    """Own a bounded set of replies for one Streamlit session, never globally cached."""

    def __init__(
        self,
        generation: str,
        *,
        application: ASGIApp = app,
        storage_current: Callable[[], bool] = lambda: True,
    ) -> None:
        self.generation = _uuid(generation)
        self.application = application
        self.storage_current = storage_current
        self._replies: dict[str, tuple[BridgeRequest, BridgeReply]] = {}
        self._retired: deque[str] = deque(maxlen=256)

    def process(self, commands: object) -> list[BridgeReply]:
        if not isinstance(commands, list) or len(commands) > MAX_BATCH:
            raise ValueError("Invalid embedded request batch")
        replies: list[BridgeReply] = []
        active: dict[str, tuple[BridgeRequest, BridgeReply]] = {}
        response_bytes = 0
        for value in commands:
            identifier = value.get("id", "") if isinstance(value, dict) else ""
            identifier = identifier if isinstance(identifier, str) else ""
            try:
                request = BridgeRequest.parse(value)
                if request.generation != self.generation or not self.storage_current():
                    raise CommandError(
                        409,
                        "storage_generation_changed",
                        "The testing store restarted or changed. Review saved records before discarding old recovery tracking.",
                    )
                old = self._replies.get(request.id) or active.get(request.id)
                if old:
                    if old[0] != request:
                        raise CommandError(
                            409, "request_identity_changed", "A request ID cannot identify a changed command."
                        )
                    reply = old[1]
                elif request.id in self._retired:
                    raise CommandError(
                        409,
                        "request_already_acknowledged",
                        "This transport request was already acknowledged. Review the workspace before retrying.",
                    )
                else:
                    try:
                        reply = asyncio.run(_invoke(request, self.application))
                    except Exception:
                        # Execution can fail after a commit. Never turn this into a
                        # definite 4xx rejection that would clear recovery tracking.
                        reply = {
                            "id": request.id,
                            "error": "The response was unavailable. Keep any pending write and review it before an exact retry.",
                        }
                response_bytes += len(reply.get("body", "").encode("utf-8"))
                if response_bytes > MAX_BATCH_RESPONSE:
                    raise RuntimeError("Response batch exceeds the embedded transport budget")
                active[request.id] = (request, reply)
            except CommandError as exc:
                reply = _rejection(identifier, exc.status, exc.code, exc.message)
            except (ValueError, UnicodeError):
                reply = _rejection(
                    identifier, 400, "invalid_bridge_command", "The embedded request could not be validated."
                )
            except Exception:
                # Do not expose request data, credentials, filesystem paths, or internal traces.
                # A write might have committed before the failure: this is a transport error.
                reply = {
                    "id": identifier,
                    "error": "The response was unavailable. Keep any pending write and review it before an exact retry.",
                }
            replies.append(reply)
        self._retired.extend(identifier for identifier in self._replies if identifier not in active)
        self._replies = active
        return replies
