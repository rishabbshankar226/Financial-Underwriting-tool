#!/usr/bin/env bash
set -euo pipefail
python3 gate/reference_calculator.py --selftest
(cd backend && pytest -q)
