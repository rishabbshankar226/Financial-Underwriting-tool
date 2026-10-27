#!/usr/bin/env bash
# Section 3's path check: prints every changed file outside presentation. Empty output passes.
# Usage: bash ease/tools/pathcheck.sh   (compares <base> from ease/STATE.md with HEAD)
set -euo pipefail
base=2fbfdef90d4477b478593afb7766ca20469c171d
git diff --name-only "$base"...HEAD | grep -v -E '^(ease/|docs/WORKSPACE\.md|docs/VERIFICATION\.md|frontend/tests/|frontend/streamlit-tests/|streamlit_app/component/spreadline_workspace/frontend/build/|frontend/src/(views/|components/|[A-Za-z]+\.tsx$|styles\.css$|errorCopy\.ts$|fieldCatalog\.ts$|workspaceSelectors\.ts$|workspaceTabs\.ts$|views/workspaceTabs\.ts$))' || true
