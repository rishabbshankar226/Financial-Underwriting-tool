from __future__ import annotations

from decimal import Decimal
from typing import Literal

from .config import COMMERCIAL_FACTOR_WEIGHTS, CONSUMER_FACTOR_WEIGHTS, DEFAULT_POLICY, PolicyConfig
from .consumer import atr_documentation_complete
from .core import CommercialFacts, commercial_facts, consumer_dti
from .finance import ZERO, calculation, decimal_text, finite_result, quantize
from .schemas import CommercialRequest, ConsumerRequest, Decision, DecisionFactor, ReasonCode, Vertical

# Regulation B §1002.9 current source checked 2026-09-08:
# https://www.consumerfinance.gov/rules-policy/regulations/1002/9/
# Reasons are selected only from the stored factors actually evaluated below.


def _scalar_text(value: Decimal | str | bool | None) -> str:
    return decimal_text(value) if isinstance(value, Decimal) else str(value)


def _reasons_from_factors(factors: list[DecisionFactor]) -> list[ReasonCode]:
    failed = [f for f in factors if f.passed is not True]
    failed.sort(key=lambda f: abs(f.weight), reverse=True)
    reasons = []
    for factor in failed:
        if factor.passed is None:
            message = f"{factor.name}: {_scalar_text(factor.value)}; manual review required under the configured prototype policy"
        elif factor.decline_triggered:
            message = f"{factor.name}: {_scalar_text(factor.raw_value)} is below the configured prototype decline floor {_scalar_text(factor.decline_threshold)}"
        else:
            value = factor.raw_value if factor.raw_value is not None else factor.value
            message = f"{factor.name}: {_scalar_text(value)} did not satisfy {factor.comparison_operator} {_scalar_text(factor.threshold)} under the configured prototype policy"
        reasons.append(
            ReasonCode(
                code=f"FACTOR_{factor.name.upper()}", factor=factor.name, message=message, value=factor.value
            )
        )
    return reasons


def _coverage_factor(
    name: str,
    value: Decimal | None,
    weight: Decimal,
    threshold: Decimal,
    source: str,
    decline_threshold: Decimal,
) -> DecisionFactor:
    return DecisionFactor(
        name=name,
        value=quantize(value, 4) if value is not None else "Not applicable: no debt service",
        weight=weight,
        threshold=threshold,
        passed=value >= threshold if value is not None else None,
        source=source,
        raw_value=value if value is not None else None,
        comparison_operator=">=",
        decline_threshold=decline_threshold,
        decline_triggered=value < decline_threshold if value is not None else None,
    )


@calculation
def decide_commercial(req: CommercialRequest, policy: PolicyConfig = DEFAULT_POLICY) -> Decision:
    return decision_from_commercial_facts(commercial_facts(req, policy.k1_stability_band), policy)


@calculation
def decision_from_commercial_facts(facts: CommercialFacts, policy: PolicyConfig) -> Decision:
    values = {name: fact.raw_value for name, fact in facts.current.items()}
    d, f, g = (
        None if values[name] is None else finite_result(values[name])
        for name in ("dscr", "fccr", "global_dscr")
    )
    k1, uca = values["k1_history"], finite_result(values["uca_cash_flow"])
    if not isinstance(k1, str):
        raise ValueError("K-1 history must be an explicit category")
    factors = [
        _coverage_factor(
            "dscr",
            d,
            COMMERCIAL_FACTOR_WEIGHTS["dscr"],
            policy.commercial_min_dscr,
            "spread/coverage",
            policy.commercial_decline_dscr,
        ),
        _coverage_factor(
            "fccr",
            f,
            COMMERCIAL_FACTOR_WEIGHTS["fccr"],
            policy.commercial_min_fccr,
            "spread/fixed-charge",
            policy.commercial_decline_fccr,
        ),
        _coverage_factor(
            "global_dscr",
            g,
            COMMERCIAL_FACTOR_WEIGHTS["global_dscr"],
            policy.commercial_min_global_dscr,
            "global-cash-flow",
            policy.commercial_decline_global_dscr,
        ),
        DecisionFactor(
            name="k1_history",
            value=k1,
            weight=COMMERCIAL_FACTOR_WEIGHTS["k1_history"],
            threshold="stable",
            passed=k1 == "stable",
            source="K-1 history",
            raw_value=k1,
            comparison_operator="==",
        ),
        DecisionFactor(
            name="uca_positive",
            value=quantize(uca, 2),
            weight=COMMERCIAL_FACTOR_WEIGHTS["uca_positive"],
            threshold=policy.commercial_min_uca_cash_flow,
            passed=uca > policy.commercial_min_uca_cash_flow,
            source="UCA-style cash flow",
            raw_value=uca,
            comparison_operator=">",
        ),
    ]
    outcome: Literal["approve", "review", "decline"]
    score = sum((x.weight for x in factors if x.passed), ZERO) / sum((x.weight for x in factors), ZERO)
    if all(x.passed for x in factors[:3]) and factors[4].passed:
        outcome = "approve" if factors[3].passed else "review"
    elif any(factor.decline_triggered for factor in factors[:3]):
        outcome = "decline"
    else:
        outcome = "review"
    return Decision(
        vertical=Vertical.commercial,
        outcome=outcome,
        score=quantize(score, 4),
        factors=factors,
        reasons=_reasons_from_factors(factors),
        policy_version=policy.version,
    )


@calculation
def decide_consumer(req: ConsumerRequest, policy: PolicyConfig = DEFAULT_POLICY) -> Decision:
    _, back = consumer_dti(
        req.gross_monthly_income,
        req.proposed_housing_pi,
        req.proposed_housing_tax_ins,
        req.other_monthly_debt,
    )
    docs_complete = atr_documentation_complete(req, policy)
    factors = [
        DecisionFactor(
            name="back_end_dti",
            value=quantize(back, 4),
            weight=CONSUMER_FACTOR_WEIGHTS["back_end_dti"],
            threshold=policy.consumer_decline_dti,
            passed=back < policy.consumer_decline_dti,
            source="verified income/debt inputs",
            raw_value=back,
            comparison_operator="<",
        ),
        DecisionFactor(
            name="atr_documentation",
            value=docs_complete,
            weight=CONSUMER_FACTOR_WEIGHTS["atr_documentation"],
            threshold=True,
            passed=docs_complete,
            source="ATR checklist",
            raw_value=docs_complete,
            comparison_operator="==",
        ),
    ]
    if req.synthetic_credit_score is not None:
        factors.append(
            DecisionFactor(
                name="synthetic_credit_score",
                value=Decimal(str(req.synthetic_credit_score)),
                weight=CONSUMER_FACTOR_WEIGHTS["synthetic_credit_score"],
                threshold=Decimal(str(policy.consumer_min_credit_score)),
                passed=req.synthetic_credit_score >= policy.consumer_min_credit_score,
                source="synthetic personal credit summary",
                raw_value=Decimal(str(req.synthetic_credit_score)),
                comparison_operator=">=",
            )
        )
    else:
        factors.append(
            DecisionFactor(
                name="synthetic_credit_score",
                value="not supplied",
                weight=CONSUMER_FACTOR_WEIGHTS["synthetic_credit_score"],
                threshold="manual review",
                passed=None,
                source="synthetic personal credit summary",
            )
        )
    decided = sum((x.weight for x in factors if x.passed is not None), ZERO)
    outcome: Literal["approve", "review", "decline"]
    score = sum((x.weight for x in factors if x.passed is True), ZERO) / decided if decided else ZERO
    if back >= policy.consumer_decline_dti:
        outcome = "decline"
    elif back >= policy.consumer_review_dti or not docs_complete or factors[-1].passed is not True:
        outcome = "review"
    else:
        outcome = "approve"
    factors.append(
        DecisionFactor(
            name="back_end_dti_review",
            value=quantize(back, 4),
            weight=CONSUMER_FACTOR_WEIGHTS["back_end_dti_review"],
            threshold=policy.consumer_review_dti,
            passed=back < policy.consumer_review_dti,
            source="prototype review boundary",
            raw_value=back,
            comparison_operator="<",
        )
    )
    return Decision(
        vertical=Vertical.consumer,
        outcome=outcome,
        score=quantize(score, 4),
        factors=factors,
        reasons=_reasons_from_factors(factors),
        policy_version=policy.version,
    )
