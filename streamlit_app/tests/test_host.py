from pathlib import Path

from streamlit.testing.v1 import AppTest

APP = Path(__file__).resolve().parents[1] / "app.py"


def test_initial_deployment_is_disabled_and_does_not_create_a_store(tmp_path, monkeypatch):
    path = tmp_path / "cases.sqlite3"
    monkeypatch.delenv("SPREADLINE_TESTING_ENABLED", raising=False)
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(path))
    app = AppTest.from_file(str(APP)).run()
    assert not app.exception
    assert "disabled" in app.info[0].value
    assert not path.exists()


def test_enabled_host_requires_an_operator_credential_before_opening_storage(tmp_path, monkeypatch):
    path = tmp_path / "cases.sqlite3"
    monkeypatch.setenv("SPREADLINE_TESTING_ENABLED", "true")
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(path))
    monkeypatch.delenv("SPREADLINE_API_TOKEN", raising=False)
    monkeypatch.delenv("SPREADLINE_OPERATOR_ID", raising=False)
    app = AppTest.from_file(str(APP)).run()
    assert not app.exception
    assert "credential" in app.error[0].value
    assert not path.exists()
