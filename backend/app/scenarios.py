"""Pure stress previews under a retained policy, with frozen observed history."""

from __future__ import annotations

from dataclasses import asdict, replace
from decimal import Decimal
from hashlib import sha256

from .assessment import assess_commercial
from .assessment_contracts import (
    SCHEMA_VERSION,
    SERIALIZATION_VERSION,
    CommercialAssessment,
    CommercialAssessmentRequest,
    CurrentFacts,
    GuarantorContribution,
    Metric,
    TraceRow,
)
from .case_contracts import CaseSnapshot
from .case_replay import replay_snapshot
from .cases import AssessmentOperation, CaseStoreError, require_uuid
from .core import CALCULATION_VERSION, Calculation, Operand, _finite, projected_commercial_facts
from .decision import decision_from_commercial_facts
from .finance import BASIS_POINTS_PER_UNIT, ONE, calculation, finite_result, quantize
from .json_values import canonical_json
from .scenario_contracts import (
    SCENARIO_DEFINITION_VERSION,
    SCENARIO_SCHEMA_VERSION,
    SCENARIO_SERIALIZATION_VERSION,
    BaselineEvidence,
    FactorChange,
    MetricComparison,
    OutcomeChange,
    PolicyHeadroom,
    PreviewFingerprint,
    ProjectionInputs,
    ReasonChange,
    ScenarioCommand,
    ScenarioPreview,
    ScenarioPreviewCommand,
    ScenarioResult,
)
from .schemas import Decision

HELD_FIXED = [
    "Observed periods, historical financials and K-1 history are unchanged.",
    "Officer compensation, depreciation, amortization, existing interest and Section 179 are fixed.",
    "Existing debt, CPLTD, operating lease, proposed principal and loan term are fixed.",
    "Guarantor identity, ownership, outside income and personal debt are fixed.",
    "Working-capital movements and cash taxes are fixed; this is not a complete forecast.",
]
TARGETS = {
    "gross_receipts": "revenue_change",
    "cogs": "cogs_change",
    "operating_expense_excl_dna_interest_comp": "operating_expense_change",
}


def _canonical(value: object) -> str:
    return canonical_json(value)


def _supported_baseline(snapshot: CaseSnapshot, operation: AssessmentOperation) -> CommercialAssessment:
    raw = snapshot.assessment
    versions = tuple(
        raw.get(key) for key in ("schema_version", "calculation_version", "serialization_version")
    )
    if any(type(v) is not str for v in versions):
        raise CaseStoreError(503, "storage_integrity", "The stored assessment has invalid version metadata")
    if versions != (SCHEMA_VERSION, CALCULATION_VERSION, SERIALIZATION_VERSION):
        raise CaseStoreError(
            409, "baseline_unsupported", "The retained assessment definition cannot support this preview"
        )
    try:
        baseline = CommercialAssessment.model_validate_json(_canonical(raw))
        if baseline.normalized_input.model_dump(mode="json") != snapshot.normalized_input:
            raise ValueError("input mismatch")
    except (ValueError, TypeError, KeyError, OverflowError, RecursionError) as exc:
        raise CaseStoreError(503, "storage_integrity", "The stored baseline assessment is malformed") from exc
    replay = replay_snapshot(snapshot, operation)
    if replay.status != "matched":
        code = "baseline_replay_mismatch" if replay.status == "mismatch" else "baseline_replay_unavailable"
        raise CaseStoreError(
            409, code, "The retained baseline could not be reproduced under its stored policy"
        )
    if any(getattr(baseline.normalized_input.years[-1], name) < 0 for name in TARGETS):
        raise CaseStoreError(
            422, "scenario_baseline", "Percentage targets must have nonnegative baseline amounts"
        )
    return baseline


def _baseline_trace(baseline: CommercialAssessment) -> tuple[Calculation, ...]:
    """Preserve all retained operands; scope their evidence references."""
    rows = []
    for row in baseline.calculation_trace:
        operands = tuple(
            Operand(
                operand.reference_type,
                "baseline." + operand.reference
                if operand.reference_type == "fact"
                else "/baseline/assessment/normalized_input" + operand.reference
                if operand.reference_type == "input"
                else operand.reference,
                operand.raw_value,
                operand.unit,
                operand.reported_value,
            )
            for operand in row.operands
        )
        rows.append(
            Calculation(
                "baseline." + row.fact_id,
                row.definition_id,
                row.expression,
                operands,
                row.raw_value,
                row.unit,
                row.display_precision,
                row.status,
                row.explanation,
                row.reported_value,
            )
        )
    return tuple(rows)


def _project_inputs(
    request: CommercialAssessmentRequest, command: ScenarioCommand
) -> tuple[ProjectionInputs, tuple[Calculation, ...]]:
    latest = len(request.years) - 1
    raw = request.years[-1].model_dump()
    trace = []
    for name, shock in TARGETS.items():
        before, change = _finite(raw[name]), finite_result(getattr(command.assumptions, shock))
        after = _finite(before * (ONE + change))
        raw[name] = after
        trace.append(
            Calculation(
                "projection.inputs." + name,
                "scenario-percentage-v2",
                "baseline_amount * (1 + decimal_change)",
                (
                    Operand(
                        "input", f"/baseline/assessment/normalized_input/years/{latest}/{name}", before, "USD"
                    ),
                    Operand("input", "/assumptions/" + shock, change, "fraction"),
                ),
                after,
                "USD",
                2,
            )
        )
    loan = request.proposed_loan.model_dump()
    before, change = _finite(loan["annual_rate"]), command.assumptions.proposed_rate_change_bps
    loan["annual_rate"] = _finite(before + change / BASIS_POINTS_PER_UNIT)
    if not 0 <= loan["annual_rate"] <= 1:
        raise ValueError("Unsupported resulting rate")
    trace.append(
        Calculation(
            "projection.inputs.annual_rate",
            "scenario-rate-bps-v2",
            "baseline_annual_rate + change_bps / 10000",
            (
                Operand(
                    "input",
                    "/baseline/assessment/normalized_input/proposed_loan/annual_rate",
                    before,
                    "decimal_nominal_annual_rate",
                ),
                Operand("input", "/assumptions/proposed_rate_change_bps", change, "basis_points"),
            ),
            loan["annual_rate"],
            "decimal_nominal_annual_rate",
            4,
        )
    )
    inputs = ProjectionInputs.model_validate_json(
        _canonical(
            {
                "operating": raw,
                "proposed_loan": loan,
                "existing_debt": request.existing_debt.model_dump(mode="json"),
                "guarantors": [g.model_dump(mode="json") for g in request.guarantors],
                "working_capital": request.working_capital.model_dump(mode="json"),
            }
        )
    )
    return inputs, tuple(
        replace(row, reported_value=quantize(finite_result(row.raw_value), row.display_precision or 0))
        for row in trace
    )


def _difference(value: Decimal | None, threshold: Decimal) -> Decimal | None:
    return _finite(value - threshold) if value is not None else None


def _comparisons(
    baseline: CommercialAssessment, projected: CurrentFacts, decision: Decision
) -> list[MetricComparison]:
    factors = {factor.name: factor for factor in decision.factors}
    comparisons = []
    for name in CurrentFacts.model_fields:
        if name == "k1_history":
            continue  # A frozen category has no numeric delta or headroom.
        old, new = getattr(baseline.current_facts, name), getattr(projected, name)
        before = None if old.raw_value is None else finite_result(old.raw_value)
        after = None if new.raw_value is None else finite_result(new.raw_value)
        factor_name = "uca_positive" if name == "uca_cash_flow" else name
        factor = factors.get(factor_name)
        headroom = None
        if name in ("dscr", "fccr", "global_dscr", "uca_cash_flow"):
            if factor is None:
                raise ValueError("A financial comparison requires its decision factor")
            threshold, decline = finite_result(factor.threshold), factor.decline_threshold
            headroom = PolicyHeadroom(
                comparison_operator=">" if name == "uca_cash_flow" else ">=",
                approval_threshold=threshold,
                decline_threshold=decline,
                baseline_approval=_difference(before, threshold),
                projected_approval=_difference(after, threshold),
                baseline_decline=_difference(before, decline) if decline is not None else None,
                projected_decline=_difference(after, decline) if decline is not None else None,
            )
        unavailable = before is None or after is None
        comparisons.append(
            MetricComparison(
                metric=name,
                baseline_fact_id="baseline." + old.fact_id,
                projected_fact_id=new.fact_id,
                unit=new.unit,
                baseline_value=before,
                projected_value=after,
                delta=None if unavailable else _difference(after, before) if before is not None else None,
                delta_explanation="At least one compared metric is not applicable" if unavailable else None,
                policy_headroom=headroom,
            )
        )
    return comparisons


def _reason_changes(original: Decision, projected: Decision) -> list[ReasonChange]:
    old, new = ({reason.code: reason for reason in decision.reasons} for decision in (original, projected))
    changes = []
    for code in list(old) + [key for key in new if key not in old]:
        before, after = old.get(code), new.get(code)
        if before != after:
            changes.append(
                ReasonChange(
                    code=code,
                    baseline=before,
                    projected=after,
                    change="added" if before is None else "removed" if after is None else "changed",
                )
            )
    return changes


def _scenario_result(
    baseline: CommercialAssessment, command: ScenarioCommand, observed: tuple[Calculation, ...]
) -> ScenarioResult:
    request = baseline.normalized_input
    inputs, assumption_trace = _project_inputs(request, command)
    facts = projected_commercial_facts(
        request,
        inputs.operating,
        inputs.proposed_loan,
        retained_trace=observed,
        assumption_trace=assumption_trace,
    )
    current = CurrentFacts(
        **{
            name: Metric.model_validate({key: getattr(row, key) for key in Metric.model_fields})
            for name, row in facts.current.items()
        }
    )
    decision = decision_from_commercial_facts(facts, baseline.policy_snapshot)
    by_id = {row.fact_id: row for row in facts.trace}
    contributions = [
        GuarantorContribution(
            guarantor_index=index,
            name=g.name,
            **{
                name: Metric.model_validate(
                    {
                        key: getattr(by_id[f"projection.current.guarantors.{index}.{name}"], key)
                        for key in Metric.model_fields
                    }
                )
                for name in ("business_ebitda", "outside_income", "personal_debt")
            },
        )
        for index, g in enumerate(request.guarantors)
    ]
    original = {factor.name: factor for factor in baseline.decision.factors}
    factor_changes = [
        FactorChange(
            name=factor.name,
            baseline=original[factor.name],
            projected=factor,
            changed=original[factor.name] != factor,
            projected_fact_id=getattr(
                current, "uca_cash_flow" if factor.name == "uca_positive" else factor.name
            ).fact_id,
            basis="observed_history" if factor.name == "k1_history" else "projected_current",
        )
        for factor in decision.factors
    ]
    return ScenarioResult(
        scenario_key=command.scenario_key,
        name=command.name,
        rationale=command.rationale,
        assumptions=command.assumptions,
        projection_inputs=inputs,
        coverage_basis="stressed_latest_period_current_pro_forma",
        current_facts=current,
        guarantor_contributions=contributions,
        decision=decision,
        calculation_trace=[
            TraceRow.model_validate({**asdict(row), "operands": [asdict(o) for o in row.operands]})
            for row in facts.trace
        ],
        comparisons=_comparisons(baseline, current, decision),
        factor_changes=factor_changes,
        outcome_change=OutcomeChange(
            baseline=baseline.decision.outcome,
            projected=decision.outcome,
            changed=baseline.decision.outcome != decision.outcome,
        ),
        reason_changes=_reason_changes(baseline.decision, decision),
    )


@calculation
def preview_commercial_scenarios(
    snapshot: CaseSnapshot,
    command: ScenarioPreviewCommand,
    *,
    assessment_operation: AssessmentOperation = assess_commercial,
) -> ScenarioPreview:
    """Evaluate a whole batch against one immutable, reproducible baseline; never write."""
    expected_run = require_uuid(command.baseline_run_id, "Baseline run ID")
    if expected_run != snapshot.run_id:
        raise CaseStoreError(
            409, "baseline_run_mismatch", "The selected revision does not contain the requested baseline run"
        )
    baseline = _supported_baseline(snapshot, assessment_operation)
    observed = _baseline_trace(baseline)
    results = []
    for index, scenario in enumerate(command.scenarios):
        try:
            results.append(_scenario_result(baseline, scenario, observed))
        except (ValueError, TypeError, OverflowError, RecursionError) as exc:
            raise CaseStoreError(
                422,
                "scenario_invalid",
                f"Scenario {index} ({scenario.scenario_key}) exceeds the supported calculation contract",
            ) from exc
    normalized = command.model_dump(mode="json")
    normalized["baseline_run_id"] = expected_run
    identity = dict(case_id=snapshot.case_id, revision=snapshot.revision, run_id=snapshot.run_id)
    content = {
        "baseline_identity": identity,
        "payload_hash": snapshot.payload_hash,
        "normalized_command": normalized,
        "policy_snapshot": baseline.model_dump(mode="json")["policy_snapshot"],
        "versions": dict(
            schema=SCENARIO_SCHEMA_VERSION,
            calculation=CALCULATION_VERSION,
            definition=SCENARIO_DEFINITION_VERSION,
            serialization=SCENARIO_SERIALIZATION_VERSION,
        ),
    }
    return ScenarioPreview(
        calculation_version=CALCULATION_VERSION,
        baseline=BaselineEvidence(
            case_id=snapshot.case_id,
            revision=snapshot.revision,
            run_id=snapshot.run_id,
            input_hash=snapshot.input_hash,
            payload_hash=snapshot.payload_hash,
            assessment=baseline,
        ),
        selected_period=baseline.selected_period,
        assumptions_as_of=baseline.assumptions_as_of,
        units=baseline.normalized_input.units,
        policy_snapshot=baseline.policy_snapshot,
        scenarios=results,
        fingerprint=PreviewFingerprint(value=sha256(_canonical(content).encode("utf-8")).hexdigest()),
        held_fixed_assumptions=list(HELD_FIXED),
    )
