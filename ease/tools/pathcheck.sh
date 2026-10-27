#!/usr/bin/env bash
# Section 3's path check: prints every changed file outside presentation. Empty output passes.
# Files the owner picked by name at STOP A (N-9, N-10, G-1) are listed separately, not as violations.
# Usage: bash ease/tools/pathcheck.sh   (compares <base> from ease/STATE.md with HEAD)
set -euo pipefail
base=2fbfdef90d4477b478593afb7766ca20469c171d
picked='^(frontend/src/excel/ExcelImport\.tsx|frontend/src/decisionPreparation\.ts|frontend/src/useAnalystWorkspace\.ts|streamlit_app/app\.py|README\.md)$'
outside=$(git diff --name-only "$base"...HEAD | grep -v -E '^(ease/|docs/WORKSPACE\.md|docs/VERIFICATION\.md|frontend/tests/|frontend/streamlit-tests/|streamlit_app/component/spreadline_workspace/frontend/build/|frontend/src/(views/|components/|[A-Za-z]+\.tsx$|styles\.css$|errorCopy\.ts$|fieldCatalog\.ts$|workspaceSelectors\.ts$|workspaceTabs\.ts$|views/workspaceTabs\.ts$))' || true)
[ -z "$outside" ] && exit 0
echo "$outside" | grep -E "$picked" | sed 's/^/owner-picked at STOP A: /' || true
echo "$outside" | grep -v -E "$picked" || true
