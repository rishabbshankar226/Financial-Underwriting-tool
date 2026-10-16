#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

python3 -m pip check
python3 -m ruff check streamlit_app scripts/streamlit_assets.py frontend/tests/start_streamlit.py
python3 -m mypy --strict streamlit_app/app.py streamlit_app/bridge.py streamlit_app/runtime.py scripts/streamlit_assets.py
python3 -m pytest -q streamlit_app/tests
npm --prefix frontend run build:streamlit
python3 scripts/streamlit_assets.py check
npm --prefix frontend run test:e2e:streamlit
