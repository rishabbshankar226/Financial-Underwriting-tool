#!/usr/bin/env bash
# Runs every command of scripts/run_all_checks.sh, then scripts/run_streamlit_checks.sh,
# in their order, continuing past a failure so one early failure cannot hide later steps.
# Usage: bash ease/tools/steps.sh <label>   Writes ease/logs/<label>/ (gitignored).
set -u
repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo"
export PATH="$repo/.venv/bin:$PATH"
label="${1:-base}"
out="ease/logs/$label"
mkdir -p "$out"
summary="$out/summary.tsv"
: > "$summary"
n=0

step() {
  n=$((n + 1))
  local name="$1"
  shift
  local log start rc
  log="$(printf '%s/%02d-%s.log' "$out" "$n" "$name")"
  start=$(date +%s)
  ("$@") > "$log" 2>&1
  rc=$?
  printf '%02d\t%s\t%s\t%ss\n' "$n" "$name" "$rc" "$(($(date +%s) - start))" >> "$summary"
}

# scripts/run_all_checks.sh
step pip-check python3 -m pip check
step ruff python3 -m ruff check backend/app backend/tools backend/tests gate
step mypy python3 -m mypy --strict backend/app backend/tools gate/reference_calculator.py
step gate-selftest python3 gate/reference_calculator.py --selftest
step precision-probe python3 docs/precision_probe.py
step backend-pytest bash -c 'cd backend && python3 -m pytest -q'
step npm-audit bash -c 'cd frontend && npm audit --audit-level=high'
step test-decimal bash -c 'cd frontend && npm run test:decimal'
step build bash -c 'cd frontend && npm run build'
step e2e bash -c 'cd frontend && CI=1 npm run test:e2e -- --reporter=line'

# scripts/run_streamlit_checks.sh
step st-pip-check python3 -m pip check
step st-ruff python3 -m ruff check streamlit_app scripts/streamlit_assets.py frontend/tests/start_streamlit.py
step st-mypy python3 -m mypy --strict streamlit_app/app.py streamlit_app/bridge.py streamlit_app/runtime.py scripts/streamlit_assets.py
step st-pytest python3 -m pytest -q streamlit_app/tests
step build-streamlit bash -c 'cd frontend && npm run build:streamlit'
step assets-check python3 scripts/streamlit_assets.py check
# CI's streamlit job fails on any diff in the committed build.
step build-dir-diff git diff --exit-code --stat -- streamlit_app/component/spreadline_workspace/frontend/build
step e2e-streamlit bash -c 'cd frontend && npm run test:e2e:streamlit -- --reporter=line'

echo "node $(node --version)" >> "$summary"
