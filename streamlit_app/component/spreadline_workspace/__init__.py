"""Register only public, generated frontend assets with Streamlit."""

import json
import re
from pathlib import Path

import streamlit as st

_manifest = json.loads((Path(__file__).parent / "frontend/build/manifest.json").read_text(encoding="utf-8"))
_entry = _manifest["bundle"]
if not isinstance(_entry, str) or re.fullmatch(r"index-[A-Za-z0-9_-]+\.js", _entry) is None:
    raise ValueError("Invalid generated component entry")

workspace = st.components.v2.component(
    "spreadline-workspace.workspace",
    js=_entry,
    html='<div class="react-root"></div>',
)
