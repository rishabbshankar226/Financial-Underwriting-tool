from __future__ import annotations
import json
from pathlib import Path
from .config import DEFAULT_POLICY, PolicyConfig
from .schemas import SBACase, SBASizeRow, DISCLAIMER

# Current source identified 2026-09-08:
# https://data.sba.gov/dataset/small-business-size-standards
# SOP versions/effective dates:
# https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs
DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "sba_size_standards.json"


def load_size_table(path: Path = DATA_FILE) -> list[SBASizeRow]:
    payload = json.loads(path.read_text())
    return [SBASizeRow(**row) for row in payload.get("rows", [])]


def size_eligible(case: SBACase, rows: list[SBASizeRow]) -> tuple[bool, str]:
    row = next((r for r in rows if r.naics == case.naics), None)
    if row is None:
        raise ValueError(f"No current size-standard row is loaded for NAICS {case.naics}. Do not infer eligibility; load the dated SBA table first.")
    if row.measure == "receipts_millions":
        if case.annual_receipts_millions is None: raise ValueError("annual_receipts_millions is required for this NAICS row")
        return case.annual_receipts_millions <= row.threshold, f"receipts <= {row.threshold}M"
    if case.employees is None: raise ValueError("employees is required for this NAICS row")
    return case.employees <= row.threshold, f"employees <= {int(row.threshold)}"


def credit_elsewhere(case: SBACase) -> dict:
    if case.sop_version == "8":
        return {"applied": False, "passes": True, "reason": "Prototype does not apply the SOP 8.1 personal-resources test under SOP 8."}
    protected = case.retirement_allowance + case.college_allowance + case.medical_allowance
    excess = max(0.0, case.owner_liquid_resources - protected)
    return {"applied": True, "passes": excess < case.requested_loan, "excess_liquid_resources": excess, "reason": "Limited personal-resources screen; lender must document specific credit-elsewhere reasons."}


def evaluate_sba(case: SBACase, rows: list[SBASizeRow], policy: PolicyConfig = DEFAULT_POLICY) -> dict:
    eligible, size_reason = size_eligible(case, rows)
    elsewhere = credit_elsewhere(case)
    floor = policy.sba_global_dscr_floor_acquisition if case.transaction_type in {"acquisition", "buyout", "esop"} else policy.sba_global_dscr_floor_expansion
    coverage = case.global_dscr >= floor
    return {
        "borrower": case.borrower_name,
        "sop_version": case.sop_version,
        "size_eligible": eligible,
        "size_reason": size_reason,
        "credit_elsewhere": elsewhere,
        "global_dscr": case.global_dscr,
        "configured_global_dscr_floor": floor,
        "coverage_pass": coverage,
        "outcome": "pass" if eligible and elsewhere["passes"] and coverage else "review_or_fail",
        "disclaimer": DISCLAIMER,
    }
