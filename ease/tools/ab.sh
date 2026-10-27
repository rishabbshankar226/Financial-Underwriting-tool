#!/usr/bin/env bash
# Same-machine A/B for a task's wait: base frontend/src (at <base>) against HEAD, back to back,
# three runs per host each. Restores HEAD's frontend/src, Streamlit build and stamp at the end.
# Usage: bash ease/tools/ab.sh "<task title regex>"   (labels ab-base and ab-after)
set -u
repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo"
export PATH="$repo/.venv/bin:$PATH"
base=2fbfdef90d4477b478593afb7766ca20469c171d
title="${1:?task title regex}"

bundle() {
  npm --prefix frontend run build:streamlit > /dev/null 2>&1
  uv pip install --python "$repo/.venv/bin/python" --reinstall-package spreadline-workspace --no-deps ./streamlit_app/component > /dev/null 2>&1
}
runs() {
  rm -rf "ease/data/raw/$1"
  for run in 1 2 3; do
    EASE_LABEL="$1" EASE_RUN="$run" npm --prefix frontend run test:e2e -- tests/ease-tasks.spec.ts --grep "$title" --reporter=line 2>&1 | grep -E 'passed|failed' | head -2
    EASE_LABEL="$1" EASE_RUN="$run" npm --prefix frontend run test:e2e:streamlit -- streamlit-tests/ease-tasks.spec.ts --grep "$title" --reporter=line 2>&1 | grep -E 'passed|failed' | head -2
  done
  python3 ease/tools/metrics.py "$1"
}

git checkout "$base" -- frontend/src
bundle
runs ab-base
git checkout HEAD -- frontend/src streamlit_app
bundle
git checkout HEAD -- streamlit_app
runs ab-after
git status --porcelain | head -5
