"""Run from repository root: streamlit run streamlit_app/app.py."""

import hmac
import os
import sys
from pathlib import Path

import streamlit as st
from streamlit.errors import StreamlitSecretNotFoundError

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from streamlit_app.bridge import BridgeSession  # noqa: E402
from streamlit_app.runtime import TestingStore, open_testing_store  # noqa: E402

st.set_page_config(page_title="Spreadline | Credit workspace", page_icon="◈", layout="wide")
try:
    st.secrets.to_dict()
except StreamlitSecretNotFoundError:
    pass

if os.environ.get("SPREADLINE_TESTING_ENABLED") != "true":
    st.title("Spreadline")
    st.subheader("Testing workspace setup")
    st.info(
        "The workspace is disabled. Configure private app access before enabling the synthetic testing environment."
    )
    st.stop()

if not os.environ.get("SPREADLINE_API_TOKEN") or not os.environ.get("SPREADLINE_OPERATOR_ID"):
    st.error("The operator must configure the testing API credential and operator identity.")
    st.stop()

# Hosts without a viewer sign-in rely on this shared password; it gates storage and the bridge.
MIN_ACCESS_PASSWORD_LENGTH = 16
access_password = os.environ.get("SPREADLINE_ACCESS_PASSWORD", "")
if len(access_password) < MIN_ACCESS_PASSWORD_LENGTH or hmac.compare_digest(
    access_password.encode("utf-8"), os.environ["SPREADLINE_API_TOKEN"].encode("utf-8")
):
    st.error(
        "The operator must set SPREADLINE_ACCESS_PASSWORD to a viewer password of at least "
        f"{MIN_ACCESS_PASSWORD_LENGTH} characters that differs from the API credential."
    )
    st.stop()

if st.session_state.get("_spreadline_access") is not True:
    st.title("Spreadline")
    st.subheader("Testing workspace access")
    with st.form("spreadline_access", clear_on_submit=True):
        supplied = st.text_input("Access password", type="password")
        submitted = st.form_submit_button("Open workspace")
    if submitted and hmac.compare_digest(supplied.encode("utf-8"), access_password.encode("utf-8")):
        st.session_state["_spreadline_access"] = True
        st.rerun()
    if submitted:
        st.error("The access password is not correct.")
    st.stop()


@st.cache_resource
def testing_store() -> TestingStore:
    path = Path(os.environ.get("SPREADLINE_CASE_DB", str(ROOT / ".spreadline-data/streamlit/cases.sqlite3")))
    store = open_testing_store(path)
    os.environ["SPREADLINE_CASE_DB"] = str(store.path)
    return store


try:
    runtime = testing_store()
    if not runtime.is_current():
        st.error(
            "The temporary testing store changed. Restart the app, then review saved records and recovery tracking."
        )
        st.stop()
except Exception:
    st.error(
        "The temporary testing store is unavailable. The operator should review the deployment configuration."
    )
    st.stop()

session = st.session_state.get("_spreadline_session")
if not isinstance(session, BridgeSession) or session.generation != runtime.generation:
    session = BridgeSession(runtime.generation, storage_current=runtime.is_current)
    st.session_state["_spreadline_session"] = session

state = st.session_state.get("spreadline_workspace")
commands = getattr(state, "requests", [])
try:
    replies = session.process(commands)
except ValueError:
    st.error("The embedded request batch is invalid. Reload the workspace and review any pending save.")
    st.stop()

from spreadline_workspace import workspace  # noqa: E402

workspace(
    key="spreadline_workspace",
    default={"requests": []},
    data={"generation": runtime.generation, "responses": replies},
    on_requests_change=lambda: None,
    width="stretch",
    height="content",
)
