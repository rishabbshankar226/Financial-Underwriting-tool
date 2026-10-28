#!/usr/bin/env bash
# Runs the ease task specs three times per host under one label, then aggregates the metrics.
# Usage: bash ease/tools/tasks.sh <label>   (base | after)
set -u
repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo"
export PATH="$repo/.venv/bin:$PATH"
label="${1:?label}"
rm -rf "ease/data/raw/$label"
for run in 1 2 3; do
  EASE_LABEL="$label" EASE_RUN="$run" npm --prefix frontend run test:e2e -- tests/ease-tasks.spec.ts --reporter=line 2>&1 |
    grep -E 'passed|failed|flaky|Error' | head -5
  EASE_LABEL="$label" EASE_RUN="$run" npm --prefix frontend run test:e2e:streamlit -- streamlit-tests/ease-tasks.spec.ts --reporter=line 2>&1 |
    grep -E 'passed|failed|flaky|Error' | head -5
done
python3 ease/tools/metrics.py "$label"
