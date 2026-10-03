from __future__ import annotations
from dataclasses import dataclass
from datetime import date
from math import isfinite

# Policy values are named/versioned here; arithmetic functions do not bury them.
# Sources checked 2026-09-08:
# SBA SOP 50 10: https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs
# SBA size standards: https://data.sba.gov/dataset/small-business-size-standards
# Regulation B: https://www.consumerfinance.gov/rules-policy/regulations/1002/9/
# Regulation Z: https://www.consumerfinance.gov/rules-policy/regulations/1026/43/

@dataclass(frozen=True)
class PolicyConfig:
    version: str = "prototype-2026-10-03"
    commercial_min_dscr: float = 1.25
    commercial_min_fccr: float = 1.20
    commercial_min_global_dscr: float = 1.25
    commercial_decline_dscr: float = 1.0
    commercial_decline_fccr: float = 1.0
    commercial_decline_global_dscr: float = 1.0
    commercial_min_uca_cash_flow: float = 0.0
    # Prototype policy boundaries, not asserted as General-QM legal ceilings.
    consumer_required_atr_fields: tuple[str, ...] = ("income", "assets", "debts")
    consumer_review_dti: float = 0.43
    consumer_decline_dti: float = 0.50
    consumer_min_credit_score: int = 620
    extraction_confidence_threshold: float = 0.90
    k1_stability_band: float = 0.15
    sba_sop_8_effective: date = date(2025, 6, 1)
    sba_sop_8_1_effective: date = date(2026, 10, 1)
    # Illustrative prototype values pending exact transaction-specific SOP policy loading.
    sba_global_dscr_floor_expansion: float = 1.15
    sba_global_dscr_floor_acquisition: float = 1.25

    def __post_init__(self):
        numeric_fields = (
            "commercial_min_dscr", "commercial_min_fccr", "commercial_min_global_dscr",
            "commercial_decline_dscr", "commercial_decline_fccr", "commercial_decline_global_dscr",
            "consumer_review_dti", "consumer_decline_dti", "extraction_confidence_threshold",
            "k1_stability_band", "sba_global_dscr_floor_expansion", "sba_global_dscr_floor_acquisition",
            "commercial_min_uca_cash_flow",
        )
        for name in numeric_fields:
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not isfinite(value):
                raise ValueError(f"{name} must be a finite number")
        for ratio in ("dscr", "fccr", "global_dscr"):
            approval = getattr(self, f"commercial_min_{ratio}")
            decline = getattr(self, f"commercial_decline_{ratio}")
            if approval <= 0 or not 0 <= decline <= approval:
                raise ValueError(f"{ratio} decline floor must be nonnegative and no higher than its approval floor")
        if not 0 < self.consumer_review_dti < self.consumer_decline_dti:
            raise ValueError("Consumer review DTI must be positive and below decline DTI")
        if not 0 <= self.extraction_confidence_threshold <= 1 or self.k1_stability_band < 0:
            raise ValueError("Invalid extraction confidence or K-1 stability band")
        if min(self.sba_global_dscr_floor_expansion, self.sba_global_dscr_floor_acquisition) <= 0:
            raise ValueError("SBA coverage floors must be positive")
        if self.commercial_min_uca_cash_flow < 0:
            raise ValueError("Commercial UCA cash-flow floor must be nonnegative")
        if (isinstance(self.consumer_min_credit_score, bool)
                or not isinstance(self.consumer_min_credit_score, int)
                or not 300 <= self.consumer_min_credit_score <= 850):
            raise ValueError("Consumer synthetic credit floor must be an integer from 300 to 850")
        required = self.consumer_required_atr_fields
        if (not isinstance(required, tuple) or not required
                or any(not isinstance(name, str) or not name.strip() or name != name.strip() for name in required)
                or len(set(required)) != len(required)):
            raise ValueError("Required ATR fields must be a nonempty tuple of unique nonblank names")
        if not isinstance(self.version, str) or not self.version.strip():
            raise ValueError("A nonblank policy version is required")
        if (type(self.sba_sop_8_effective) is not date or type(self.sba_sop_8_1_effective) is not date
                or self.sba_sop_8_1_effective <= self.sba_sop_8_effective):
            raise ValueError("SBA SOP effective dates must be dates in version order")

DEFAULT_POLICY = PolicyConfig()
