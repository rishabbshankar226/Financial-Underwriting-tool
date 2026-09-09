from __future__ import annotations
from .decision import decide_commercial
from .schemas import CommercialRequest, DISCLAIMER


def geography_proxy_self_test(base: CommercialRequest, geographies: list[str]) -> dict:
    """Illustrative synthetic fairness regression harness, not a disparate-impact test.

    Geography travels through the decision request but receives zero policy weight in the
    current engine. Varying it while holding creditworthiness constant catches a future
    accidental geography dependency if one is introduced.
    """
    outcomes={}
    for geo in geographies:
        candidate=base.model_copy(deep=True); candidate.geography=geo
        outcomes[geo]=decide_commercial(candidate).outcome
    rates={g:1.0 if outcome=="approve" else 0.0 for g,outcome in outcomes.items()}
    gap=max(rates.values())-min(rates.values()) if rates else 0.0
    return {"outcomes":outcomes,"approve_rate":sum(rates.values())/len(rates) if rates else 0.0,"outcome_rate_gap":gap,"geography_is_decision_factor":False,"label":"illustrative synthetic self-test; not a certified disparate-impact analysis","disclaimer":DISCLAIMER}
