from __future__ import annotations
from dataclasses import dataclass
from datetime import date

# Policy values are named/versioned here; arithmetic functions do not bury them.
# Sources checked 2026-09-08:
# SBA SOP 50 10: https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs
# SBA size standards: https://data.sba.gov/dataset/small-business-size-standards
# Regulation B: https://www.consumerfinance.gov/rules-policy/regulations/1002/9/
# Regulation Z: https://www.consumerfinance.gov/rules-policy/regulations/1026/43/

@dataclass(frozen=True)
class PolicyConfig:
    version: str = "prototype-2026-09-08"
    commercial_min_dscr: float = 1.25
    commercial_min_fccr: float = 1.20
    commercial_min_global_dscr: float = 1.25
    # Prototype policy boundaries, not asserted as General-QM legal ceilings.
    consumer_review_dti: float = 0.43
    consumer_decline_dti: float = 0.50
    extraction_confidence_threshold: float = 0.90
    k1_stability_band: float = 0.15
    sba_sop_8_effective: date = date(2025, 6, 1)
    sba_sop_8_1_effective: date = date(2026, 10, 1)
    # Illustrative prototype values pending exact transaction-specific SOP policy loading.
    sba_global_dscr_floor_expansion: float = 1.15
    sba_global_dscr_floor_acquisition: float = 1.25

DEFAULT_POLICY = PolicyConfig()
