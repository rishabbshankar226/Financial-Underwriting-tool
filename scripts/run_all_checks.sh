#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

python3 -m pip check
python3 gate/reference_calculator.py --selftest
(cd backend && python3 -m pytest -q)
(
  cd frontend
  npm audit --audit-level=high
  npm run build
  CI=1 npm run test:e2e
)
