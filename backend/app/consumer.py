from __future__ import annotations
from .config import DEFAULT_POLICY, PolicyConfig
from .core import consumer_dti
from .schemas import ConsumerRequest, DISCLAIMER

# Regulation Z current resource checked 2026-09-08:
# https://www.consumerfinance.gov/rules-policy/regulations/1026/43/
# General QM no longer uses 43% as a fixed legal DTI ceiling; this module treats
# 43% only as a named prototype review boundary.

def evaluate_consumer(req: ConsumerRequest, policy: PolicyConfig = DEFAULT_POLICY) -> dict:
    front, back = consumer_dti(req.gross_monthly_income, req.proposed_housing_pi, req.proposed_housing_tax_ins, req.other_monthly_debt)
    docs_complete = bool(req.atr_documentation) and all(req.atr_documentation.values())
    if back >= policy.consumer_decline_dti:
        status = "decline_boundary"
    elif back >= policy.consumer_review_dti:
        status = "review_boundary"
    else:
        status = "within_prototype_boundary"
    return {"front_end_dti": front, "back_end_dti": back, "atr_documentation_complete": docs_complete, "prototype_boundary_status": status, "disclaimer": DISCLAIMER}
