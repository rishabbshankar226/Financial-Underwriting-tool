"""Single-operator access is checked before bodies, calculations or storage."""

import hmac
import os
import re
from contextvars import ContextVar

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

MIN_TOKEN_LENGTH = 32
MAX_TOKEN_LENGTH = 4096
MAX_OPERATOR_LENGTH = 128
DEMONSTRATION_ACTOR = "prototype-demo-unverified"
TOKEN_PATTERN = re.compile(r"[A-Za-z0-9._~+/-]+=*")
OPERATOR_PATTERN = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.:@-]{0,127}")
_operator: ContextVar[str | None] = ContextVar("spreadline_operator", default=None)


def authenticated_operator() -> str:
    operator = _operator.get()
    if operator is None:
        raise RuntimeError("Authenticated operator identity is unavailable")
    return operator


def valid_actor(actor: str) -> str:
    if OPERATOR_PATTERN.fullmatch(actor) is None:
        raise ValueError("Actor must be a bounded ASCII identifier")
    return actor


def _configuration() -> tuple[str, str]:
    token = os.environ.get("SPREADLINE_API_TOKEN", "")
    if not MIN_TOKEN_LENGTH <= len(token) <= MAX_TOKEN_LENGTH or TOKEN_PATTERN.fullmatch(token) is None:
        raise ValueError(
            "Authentication requires SPREADLINE_API_TOKEN to be set to a valid 32..4096 character bearer secret"
        )
    operator = os.environ.get("SPREADLINE_OPERATOR_ID", "")
    if (
        OPERATOR_PATTERN.fullmatch(operator) is None
        or operator == DEMONSTRATION_ACTOR
        or hmac.compare_digest(operator, token)
    ):
        raise ValueError(
            "Authentication requires SPREADLINE_OPERATOR_ID to be set to a non-reserved ASCII identifier of at most 128 characters"
        )
    return token, operator


class OperatorAuthenticationMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            if scope["type"] == "websocket":
                await send({"type": "websocket.close", "code": 1008})
            else:
                await self.app(scope, receive, send)
            return
        if scope["path"] == "/health" and scope["method"] in ("GET", "HEAD"):
            await self.app(scope, receive, send)
            return
        try:
            expected, operator = _configuration()
        except ValueError as exc:
            await JSONResponse(
                {"detail": {"code": "authentication_not_configured", "message": str(exc)}},
                status_code=503,
                headers={"Cache-Control": "no-store"},
            )(scope, receive, send)
            return
        headers = [value for name, value in scope.get("headers", []) if name.lower() == b"authorization"]
        accepted = False
        if len(headers) == 1 and len(headers[0]) <= MAX_TOKEN_LENGTH + 7:
            scheme, separator, value = headers[0].partition(b" ")
            if separator and scheme.lower() == b"bearer":
                try:
                    supplied = value.decode("ascii")
                except UnicodeDecodeError:
                    supplied = ""
                accepted = (
                    MIN_TOKEN_LENGTH <= len(supplied) <= MAX_TOKEN_LENGTH
                    and TOKEN_PATTERN.fullmatch(supplied) is not None
                    and hmac.compare_digest(supplied, expected)
                )
        if not accepted:
            await JSONResponse(
                {
                    "detail": {
                        "code": "authentication_required",
                        "message": "One valid Bearer credential is required",
                    }
                },
                status_code=401,
                headers={"WWW-Authenticate": "Bearer", "Cache-Control": "no-store"},
            )(scope, receive, send)
            return

        async def private_send(message: Message) -> None:
            if message["type"] == "http.response.start":
                message = dict(message)
                headers = [
                    (key, value)
                    for key, value in message.get("headers", [])
                    if key.lower() != b"cache-control"
                ]
                message["headers"] = [
                    *headers,
                    (b"cache-control", b"no-store"),
                    (b"x-content-type-options", b"nosniff"),
                ]
            await send(message)

        context = _operator.set(operator)
        try:
            await self.app(scope, receive, private_send)
        finally:
            _operator.reset(context)
