#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

python3 -m pip check
python3 -m ruff check backend/app backend/tools backend/tests gate
python3 -m mypy --strict backend/app backend/tools gate/reference_calculator.py
python3 gate/reference_calculator.py --selftest
python3 docs/precision_probe.py
(cd backend && python3 -m pytest -q)
(
  cd frontend
  npm audit --audit-level=high
  npm run test:decimal
  npm run build
  CI=1 npm run test:e2e
)
