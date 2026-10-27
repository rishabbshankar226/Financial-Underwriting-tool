#!/usr/bin/env bash
# Section 8's revert proof for the fix in HEAD: run one test with the fix's non-test files taken from HEAD~1
# (it must fail on its own expect), then restored from HEAD (it must pass).
# Usage: [FIX=<sha>] bash ease/tools/revert-proof.sh <e2e|streamlit> "<test title regex>" <spec path> <fix files...>
# FIX names the fix commit (default HEAD); the revert takes the files from its parent.
set -u
repo="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo"
export PATH="$repo/.venv/bin:$PATH"
kind="$1"; title="$2"; spec="$3"; shift 3
fix="${FIX:-HEAD}"
script="test:e2e"; [ "$kind" = streamlit ] && script="test:e2e:streamlit"

run() {
  if [ "$kind" = streamlit ]; then npm --prefix frontend run build:streamlit > /dev/null 2>&1; fi
  npm --prefix frontend run "$script" -- "$spec" --grep "$title" --reporter=line 2>&1
}

echo "== reverted to $fix~1: $*"
git checkout "$fix~1" -- "$@"
run | grep -E 'Expected|Received|passed|failed|Error:' | head -8
echo "== restored from HEAD"
git checkout HEAD -- "$@"
run | grep -E 'passed|failed|Error:' | head -4
if [ "$kind" = streamlit ]; then npm --prefix frontend run build:streamlit > /dev/null 2>&1; fi
git status --porcelain | head -5
