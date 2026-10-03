from __future__ import annotations
from math import isfinite
from .consumer import atr_documentation_complete
from .config import DEFAULT_POLICY, PolicyConfig
from .core import dscr, fccr, global_dscr, k1_history_flag, consumer_dti, uca_cash_flow
from .schemas import CommercialRequest, ConsumerRequest, Decision, DecisionFactor, ReasonCode, Vertical

# Regulation B §1002.9 current source checked 2026-09-08:
# https://www.consumerfinance.gov/rules-policy/regulations/1002/9/
# Reasons are selected only from the stored factors actually evaluated below.

def _reasons_from_factors(factors: list[DecisionFactor]) -> list[ReasonCode]:
    failed = [f for f in factors if f.passed is not True]
    failed.sort(key=lambda f: abs(f.weight), reverse=True)
    reasons = []
    for factor in failed:
        if factor.passed is None:
            message = f"{factor.name}: {factor.value}; manual review required under the configured prototype policy"
        elif factor.decline_triggered:
            message = f"{factor.name}: {factor.raw_value} is below the configured prototype decline floor {factor.decline_threshold}"
        else:
            value = factor.raw_value if factor.raw_value is not None else factor.value
            message = f"{factor.name}: {value} did not satisfy {factor.comparison_operator} {factor.threshold} under the configured prototype policy"
        reasons.append(ReasonCode(code=f"FACTOR_{factor.name.upper()}", factor=factor.name, message=message, value=factor.value))
    return reasons


def _coverage_factor(name: str, value: float, weight: float, threshold: float, source: str, decline_threshold: float) -> DecisionFactor:
    return DecisionFactor(
        name=name, value=round(value, 4) if isfinite(value) else "Not applicable: no debt service",
        weight=weight, threshold=threshold,
        passed=value >= threshold if isfinite(value) else None, source=source,
        raw_value=value if isfinite(value) else None, comparison_operator=">=",
        decline_threshold=decline_threshold,
        decline_triggered=value < decline_threshold if isfinite(value) else None,
    )


def decide_commercial(req: CommercialRequest, policy: PolicyConfig = DEFAULT_POLICY) -> Decision:
    year=req.years[-1]
    d=dscr(year,req.existing_debt,req.proposed_loan)
    f=fccr(year,req.existing_debt,req.proposed_loan)
    g=global_dscr(year,req.existing_debt,req.proposed_loan,req.guarantors)
    k1=k1_history_flag(req.years,policy.k1_stability_band)
    uca=uca_cash_flow(year,req.working_capital)
    factors=[
      _coverage_factor("dscr", d, .35, policy.commercial_min_dscr, "spread/coverage", policy.commercial_decline_dscr),
      _coverage_factor("fccr", f, .20, policy.commercial_min_fccr, "spread/fixed-charge", policy.commercial_decline_fccr),
      _coverage_factor("global_dscr", g, .30, policy.commercial_min_global_dscr, "global-cash-flow", policy.commercial_decline_global_dscr),
      DecisionFactor(name="k1_history",value=k1,weight=.10,threshold="stable",passed=k1=="stable",source="K-1 history",raw_value=k1,comparison_operator="=="),
      DecisionFactor(name="uca_positive",value=round(uca,2),weight=.05,threshold=policy.commercial_min_uca_cash_flow,passed=uca>policy.commercial_min_uca_cash_flow,source="UCA-style cash flow",raw_value=uca,comparison_operator=">"),
    ]
    score=sum(x.weight for x in factors if x.passed)/sum(x.weight for x in factors)
    if all(x.passed for x in factors[:3]) and factors[4].passed: outcome="approve" if factors[3].passed else "review"
    elif any(factor.decline_triggered for factor in factors[:3]): outcome="decline"
    else: outcome="review"
    return Decision(vertical=Vertical.commercial,outcome=outcome,score=round(score,4),factors=factors,reasons=_reasons_from_factors(factors),policy_version=policy.version)


def decide_consumer(req: ConsumerRequest, policy: PolicyConfig = DEFAULT_POLICY) -> Decision:
    _,back=consumer_dti(req.gross_monthly_income,req.proposed_housing_pi,req.proposed_housing_tax_ins,req.other_monthly_debt)
    docs_complete=atr_documentation_complete(req, policy)
    factors=[
      DecisionFactor(name="back_end_dti",value=round(back,4),weight=.65,threshold=policy.consumer_decline_dti,passed=back<policy.consumer_decline_dti,source="verified income/debt inputs",raw_value=back,comparison_operator="<"),
      DecisionFactor(name="atr_documentation",value=docs_complete,weight=.25,threshold=True,passed=docs_complete,source="ATR checklist",raw_value=docs_complete,comparison_operator="=="),
    ]
    if req.synthetic_credit_score is not None:
        factors.append(DecisionFactor(name="synthetic_credit_score",value=req.synthetic_credit_score,weight=.10,threshold=policy.consumer_min_credit_score,passed=req.synthetic_credit_score>=policy.consumer_min_credit_score,source="synthetic personal credit summary",raw_value=req.synthetic_credit_score,comparison_operator=">="))
    else:
        factors.append(DecisionFactor(name="synthetic_credit_score",value="not supplied",weight=.10,threshold="manual review",passed=None,source="synthetic personal credit summary"))
    decided=sum(x.weight for x in factors if x.passed is not None)
    score=sum(x.weight for x in factors if x.passed is True)/decided if decided else 0
    if back>=policy.consumer_decline_dti: outcome="decline"
    elif back>=policy.consumer_review_dti or not docs_complete or factors[-1].passed is not True: outcome="review"
    else: outcome="approve"
    factors.append(DecisionFactor(name="back_end_dti_review",value=round(back,4),weight=0,threshold=policy.consumer_review_dti,passed=back<policy.consumer_review_dti,source="prototype review boundary",raw_value=back,comparison_operator="<"))
    return Decision(vertical=Vertical.consumer,outcome=outcome,score=round(score,4),factors=factors,reasons=_reasons_from_factors(factors),policy_version=policy.version)
