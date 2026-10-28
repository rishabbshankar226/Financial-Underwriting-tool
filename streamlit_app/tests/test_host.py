from pathlib import Path

import pytest
import streamlit as st
from streamlit.testing.v1 import AppTest

APP = Path(__file__).resolve().parents[1] / "app.py"
TOKEN = "synthetic-streamlit-host-" + "x" * 40
PASSWORD = "synthetic-viewer-password"


def enable_host(monkeypatch, path, password, public=None):
    monkeypatch.setenv("SPREADLINE_TESTING_ENABLED", "true")
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(path))
    monkeypatch.setenv("SPREADLINE_API_TOKEN", TOKEN)
    monkeypatch.setenv("SPREADLINE_OPERATOR_ID", "streamlit-host-regression")
    if public is None:
        monkeypatch.delenv("SPREADLINE_PUBLIC_ACCESS", raising=False)
    else:
        monkeypatch.setenv("SPREADLINE_PUBLIC_ACCESS", public)
    if password is None:
        monkeypatch.delenv("SPREADLINE_ACCESS_PASSWORD", raising=False)
    else:
        monkeypatch.setenv("SPREADLINE_ACCESS_PASSWORD", password)


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


@pytest.mark.parametrize("password", [None, "", "short-password", TOKEN])
def test_enabled_host_requires_a_distinct_access_password_before_opening_storage(
    tmp_path, monkeypatch, password
):
    path = tmp_path / "cases.sqlite3"
    enable_host(monkeypatch, path, password)
    app = AppTest.from_file(str(APP)).run()
    assert not app.exception
    assert "SPREADLINE_ACCESS_PASSWORD" in app.error[0].value
    assert not app.text_input
    assert not path.exists()


def test_access_gate_rejects_a_wrong_password_without_opening_storage(tmp_path, monkeypatch):
    path = tmp_path / "cases.sqlite3"
    enable_host(monkeypatch, path, PASSWORD)
    app = AppTest.from_file(str(APP)).run()
    assert app.text_input[0].label == "Access password"
    app.text_input[0].input(PASSWORD + "-wrong")
    app.button[0].click().run()
    assert not app.exception
    assert "not correct" in app.error[0].value
    assert "_spreadline_access" not in app.session_state
    assert not path.exists()


def test_access_gate_opens_the_workspace_for_the_configured_password(tmp_path, monkeypatch):
    st.cache_resource.clear()
    path = tmp_path / "cases.sqlite3"
    enable_host(monkeypatch, path, PASSWORD)
    app = AppTest.from_file(str(APP)).run()
    assert not path.exists()
    app.text_input[0].input(PASSWORD)
    # The unlocked run imports the backend and opens the store.
    app.button[0].click().run(timeout=60)
    assert not app.exception
    assert not app.error
    assert app.session_state["_spreadline_access"] is True
    assert not app.text_input
    assert path.exists()
    st.cache_resource.clear()


@pytest.mark.parametrize("public", ["false", "1", "TRUE", ""])
def test_only_an_exact_public_flag_skips_the_access_gate(tmp_path, monkeypatch, public):
    path = tmp_path / "cases.sqlite3"
    enable_host(monkeypatch, path, None, public)
    app = AppTest.from_file(str(APP)).run()
    assert not app.exception
    assert "SPREADLINE_ACCESS_PASSWORD" in app.error[0].value
    assert not path.exists()


def test_public_host_opens_the_workspace_without_a_password(tmp_path, monkeypatch):
    st.cache_resource.clear()
    path = tmp_path / "cases.sqlite3"
    enable_host(monkeypatch, path, None, "true")
    # The first run imports the backend and opens the store.
    app = AppTest.from_file(str(APP)).run(timeout=60)
    assert not app.exception
    assert not app.error
    assert not app.text_input
    assert "_spreadline_access" not in app.session_state
    assert "Public demo" in app.caption[0].value
    assert path.exists()
    st.cache_resource.clear()
