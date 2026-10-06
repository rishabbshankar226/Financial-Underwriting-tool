"""Pure dated assessment: one calculation supplies the decision and its trace."""
from dataclasses import asdict
from datetime import timedelta
from hashlib import sha256
import json

from pydantic import TypeAdapter

from .assessment_contracts import (
    AssessmentFingerprint, CommercialAssessment, CommercialAssessmentRequest,
    CurrentFacts, GuarantorContribution, HistoricalPeriod, Metric, Period,
    SCHEMA_VERSION, SERIALIZATION_VERSION, TraceRow,
)
from .config import DEFAULT_POLICY, PolicyConfig
from .core import CALCULATION_VERSION, commercial_facts
from .decision import decision_from_commercial_facts


def _metric(row):
    return Metric(**{key: getattr(row, key) for key in Metric.model_fields})


def assess_commercial(request: CommercialAssessmentRequest, policy: PolicyConfig = DEFAULT_POLICY) -> CommercialAssessment:
    latest_index = len(request.years) - 1
    selected_history = [latest_index]
    if latest_index:
        previous, latest = request.years[-2:]
        if previous.period_end + timedelta(days=1) == latest.period_start and previous.period_start.month == latest.period_start.month:
            selected_history.insert(0, latest_index - 1)
    # Calculation records retain the operands that produced each raw result.
    facts = commercial_facts(request, policy.k1_stability_band, history_indices=selected_history, include_spread=True)
    by_id = {row.fact_id: row for row in facts.trace}
    historical = [HistoricalPeriod(
        period_start=year.period_start, period_end=year.period_end, financials=year,
        **{key: _metric(row) for key, row in calculated.items()},
    ) for year, calculated in zip(request.years, facts.history)]
    fingerprint_content = {
        "normalized_input": request.model_dump(mode="json"),
        "policy_snapshot": TypeAdapter(PolicyConfig).dump_python(policy, mode="json"),
        "calculation_version": CALCULATION_VERSION,
        "schema_version": SCHEMA_VERSION,
        "serialization_version": SERIALIZATION_VERSION,
    }
    serialized = json.dumps(fingerprint_content, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode("utf-8")
    latest = request.years[-1]
    return CommercialAssessment(
        schema_version=SCHEMA_VERSION, calculation_version=CALCULATION_VERSION,
        serialization_version=SERIALIZATION_VERSION, normalized_input=request,
        selected_period=Period(period_start=latest.period_start, period_end=latest.period_end),
        coverage_basis="current_pro_forma", assumptions_as_of=request.assessment_as_of,
        historical_spread=historical, current_facts=CurrentFacts(**{name: _metric(row) for name, row in facts.current.items()}),
        guarantor_contributions=[GuarantorContribution(
            guarantor_index=index, name=guarantor.name,
            **{name: _metric(by_id[f"current.guarantors.{index}.{name}"])
               for name in ("business_ebitda", "outside_income", "personal_debt")},
        ) for index, guarantor in enumerate(request.guarantors)],
        k1_history_periods=[Period(period_start=request.years[i].period_start, period_end=request.years[i].period_end) for i in selected_history],
        calculation_trace=[TraceRow(**{**asdict(row), "operands": [asdict(o) for o in row.operands]}) for row in facts.trace],
        decision=decision_from_commercial_facts(facts, policy), policy_snapshot=policy,
        fingerprint=AssessmentFingerprint(algorithm="sha256", value=sha256(serialized).hexdigest(),
            content="normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version"),
    )
