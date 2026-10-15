import sys
from pathlib import Path

import pytest
from api_client import TEST_API_TOKEN, TEST_OPERATOR_ID

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture(autouse=True)
def configure_legacy_http_credentials(request: pytest.FixtureRequest, monkeypatch: pytest.MonkeyPatch) -> None:
    if request.node.path.name == "test_authentication.py":
        return
    monkeypatch.setenv("SPREADLINE_API_TOKEN", TEST_API_TOKEN)
    monkeypatch.setenv("SPREADLINE_OPERATOR_ID", TEST_OPERATOR_ID)
