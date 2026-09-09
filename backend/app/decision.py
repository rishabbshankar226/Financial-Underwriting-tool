from __future__ import annotations
from .config import DEFAULT_POLICY, PolicyConfig
from .core import dscr, fccr, global_dscr, k1_history_flag, consumer_dti, uca_cash_flow
from .schemas import CommercialRequest, ConsumerRequest, Decision, DecisionFactor, ReasonCode, Vertical

# Regulation B §1002.9 current source checked 2026-09-08:
# https://www.consumerfinance.gov/rules-policy/regulations/1002/9/
# Reasons are selected only from the stored factors actually evaluated below.

def _reasons_from_factors(factors: list[DecisionFactor]) -> list[ReasonCode]:
    failed = [f for f in factors if f.passed is False]
    failed.sort(key=lambda f: abs(f.weight), reverse=True)
    return [ReasonCode(code=f"FACTOR_{f.name.upper()}",factor=f.name,message=f"{f.name} did not meet the configured prototype policy threshold",value=f.value) for f in failed[:4]]


def decide_commercial(req: CommercialRequest, policy: PolicyConfig = DEFAULT_POLICY) -> Decision:
    year=req.years[-1]
    d=dscr(year,req.existing_debt,req.proposed_loan)
    f=fccr(year,req.existing_debt,req.proposed_loan)
    g=global_dscr(year,req.existing_debt,req.proposed_loan,req.guarantors)
    k1=k1_history_flag(req.years,policy.k1_stability_band)
    uca=uca_cash_flow(year,req.working_capital)
    factors=[
      DecisionFactor(name="dscr",value=round(d,4),weight=.35,threshold=policy.commercial_min_dscr,passed=d>=policy.commercial_min_dscr,source="spread/coverage"),
      DecisionFactor(name="fccr",value=round(f,4),weight=.20,threshold=policy.commercial_min_fccr,passed=f>=policy.commercial_min_fccr,source="spread/fixed-charge"),
      DecisionFactor(name="global_dscr",value=round(g,4),weight=.30,threshold=policy.commercial_min_global_dscr,passed=g>=policy.commercial_min_global_dscr,source="global-cash-flow"),
      DecisionFactor(name="k1_history",value=k1,weight=.10,threshold="stable",passed=k1=="stable",source="K-1 history"),
      DecisionFactor(name="uca_positive",value=round(uca,2),weight=.05,threshold=0.0,passed=uca>0,source="UCA-style cash flow"),
    ]
    score=sum(x.weight for x in factors if x.passed)/sum(x.weight for x in factors)
    if all(x.passed for x in factors[:3]) and factors[4].passed: outcome="approve" if factors[3].passed else "review"
    elif d<1.0 or f<1.0 or g<1.0: outcome="decline"
    else: outcome="review"
    return Decision(vertical=Vertical.commercial,outcome=outcome,score=round(score,4),factors=factors,reasons=_reasons_from_factors(factors))


def decide_consumer(req: ConsumerRequest, policy: PolicyConfig = DEFAULT_POLICY) -> Decision:
    _,back=consumer_dti(req.gross_monthly_income,req.proposed_housing_pi,req.proposed_housing_tax_ins,req.other_monthly_debt)
    docs_complete=bool(req.atr_documentation) and all(req.atr_documentation.values())
    factors=[
      DecisionFactor(name="back_end_dti",value=round(back,4),weight=.65,threshold=policy.consumer_decline_dti,passed=back<policy.consumer_decline_dti,source="verified income/debt inputs"),
      DecisionFactor(name="atr_documentation",value=docs_complete,weight=.25,threshold=True,passed=docs_complete,source="ATR checklist"),
    ]
    if req.synthetic_credit_score is not None:
        factors.append(DecisionFactor(name="synthetic_credit_score",value=req.synthetic_credit_score,weight=.10,threshold=620,passed=req.synthetic_credit_score>=620,source="synthetic personal credit summary"))
    else:
        factors.append(DecisionFactor(name="synthetic_credit_score",value="not supplied",weight=.10,threshold="manual review",passed=None,source="synthetic personal credit summary"))
    decided=sum(x.weight for x in factors if x.passed is not None)
    score=sum(x.weight for x in factors if x.passed is True)/decided if decided else 0
    if back>=policy.consumer_decline_dti: outcome="decline"
    elif back>=policy.consumer_review_dti or not docs_complete or factors[-1].passed is not True: outcome="review"
    else: outcome="approve"
    return Decision(vertical=Vertical.consumer,outcome=outcome,score=round(score,4),factors=factors,reasons=_reasons_from_factors(factors))
