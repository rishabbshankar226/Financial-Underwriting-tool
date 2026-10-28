#!/usr/bin/env bash
# Usage: run-measure.sh <label>. Three runs per host, sequential.
set -u
cd "$(dirname "$0")"
for host in standalone streamlit; do
  for run in 1 2 3; do
    FRICTION_LABEL="$1" FRICTION_RUN=$run FRICTION_HOST=$host ./node_modules/.bin/playwright test tasks.spec.ts 2>&1 | grep -E "passed|failed|skipped|Error" | head -5 | sed "s/^/[$host run $run] /"
  done
done
