"""Explicit authenticated HTTP client for legacy API regression tests."""

from __future__ import annotations

from typing import TYPE_CHECKING, Literal

from fastapi.testclient import TestClient as FrameworkTestClient
from starlette.types import ASGIApp

if TYPE_CHECKING:
    from httpx2._types import CookieTypes

TEST_API_TOKEN = "synthetic-backend-regression-secret-" + "t" * 48
TEST_OPERATOR_ID = "backend-regression-operator"
AUTHORIZATION_ASGI_HEADER = (b"authorization", ("Bearer " + TEST_API_TOKEN).encode("ascii"))


class TestClient(FrameworkTestClient):
    __test__ = False

    def __init__(
        self,
        app: ASGIApp,
        base_url: str = "http://testserver",
        raise_server_exceptions: bool = True,
        root_path: str = "",
        backend: Literal["asyncio", "trio"] = "asyncio",
        backend_options: dict[str, object] | None = None,
        cookies: CookieTypes | None = None,
        headers: dict[str, str] | None = None,
        follow_redirects: bool = True,
        client: tuple[str, int] = ("testclient", 50000),
    ) -> None:
        supplied_headers = dict(headers or {})
        if not any(name.lower() == "authorization" for name in supplied_headers):
            supplied_headers["Authorization"] = "Bearer " + TEST_API_TOKEN
        super().__init__(
            app,
            base_url=base_url,
            raise_server_exceptions=raise_server_exceptions,
            root_path=root_path,
            backend=backend,
            backend_options=backend_options,
            cookies=cookies,
            headers=supplied_headers,
            follow_redirects=follow_redirects,
            client=client,
        )
