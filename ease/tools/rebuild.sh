#!/usr/bin/env bash
# Section 8's per-commit checks for a change under frontend/src/: standalone build, Streamlit rebuild, asset check.
# Stage the regenerated build directory in the same commit as the source change.
# Usage: bash ease/tools/rebuild.sh
set -euo pipefail
repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo"
export PATH="$repo/.venv/bin:$PATH"
npm --prefix frontend run build 2>&1 | grep -E 'error|built in' | head -5
npm --prefix frontend run build:streamlit 2>&1 | grep -E 'error|built in' | head -5
python3 scripts/streamlit_assets.py check
# build:streamlit also rewrites the bundle stamp on the last line of streamlit_app/requirements.txt; commit both.
git status --porcelain -- streamlit_app/component/spreadline_workspace/frontend/build streamlit_app/requirements.txt | head -6
