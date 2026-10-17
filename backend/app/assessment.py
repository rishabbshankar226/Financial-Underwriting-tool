"""Pure dated assessment: one calculation supplies the decision and its trace."""

import json
from dataclasses import asdict
from datetime import timedelta
from hashlib import sha256

from pydantic import TypeAdapter

from .assessment_contracts import (
    SCHEMA_VERSION,
    SERIALIZATION_VERSION,
    AssessmentFingerprint,
    CommercialAssessment,
    CommercialAssessmentRequest,
    CurrentFacts,
    DatedFinancialYear,
    GuarantorContribution,
    HistoricalPeriod,
    Metric,
    Period,
    ReportedFinancialYear,
    TraceRow,
)
from .config import DEFAULT_POLICY, PolicyConfig
from .core import CALCULATION_VERSION, Calculation, commercial_facts
from .decision import decision_from_commercial_facts
from .finance import calculation, finite_result, quantize, reconcile


def _metric(row: Calculation) -> Metric:
    return Metric.model_validate({key: getattr(row, key) for key in Metric.model_fields})


@calculation
def _reported_year(year: DatedFinancialYear, calculated: dict[str, Calculation]) -> ReportedFinancialYear:
    gross = quantize(finite_result(calculated["gross_profit"].raw_value))
    income = quantize(finite_result(calculated["ordinary_business_income"].raw_value))
    cash = quantize(finite_result(calculated["ebitda"].raw_value))
    receipts, negative_cogs = reconcile([year.gross_receipts, -year.cogs], gross)
    expenses = reconcile(
        [year.operating_expense_excl_dna_interest_comp, year.officer_compensation], gross - cash
    )
    addbacks = reconcile(
        [year.depreciation, year.amortization, year.interest_expense, year.section_179], cash - income
    )
    return ReportedFinancialYear(
        period_start=year.period_start,
        period_end=year.period_end,
        gross_receipts=receipts,
        cogs=-negative_cogs,
        operating_expense_excl_dna_interest_comp=expenses[0],
        officer_compensation=expenses[1],
        depreciation=addbacks[0],
        amortization=addbacks[1],
        interest_expense=addbacks[2],
        section_179=addbacks[3],
        k1_distribution=quantize(year.k1_distribution),
    )


def comparable_periods(previous: Period, latest: Period) -> bool:
    """Adjacent periods that share a fiscal start month can be compared year over year."""
    return (
        previous.period_end + timedelta(days=1) == latest.period_start
        and previous.period_start.month == latest.period_start.month
    )


def assess_commercial(
    request: CommercialAssessmentRequest, policy: PolicyConfig = DEFAULT_POLICY
) -> CommercialAssessment:
    latest_index = len(request.years) - 1
    selected_history = [latest_index]
    if latest_index:
        previous, latest = request.years[-2:]
        if comparable_periods(previous, latest):
            selected_history.insert(0, latest_index - 1)
    # Calculation records retain the operands that produced each raw result.
    facts = commercial_facts(
        request, policy.k1_stability_band, history_indices=selected_history, include_spread=True
    )
    by_id = {row.fact_id: row for row in facts.trace}
    historical = [
        HistoricalPeriod(
            period_start=year.period_start,
            period_end=year.period_end,
            financials=year,
            reported_financials=_reported_year(year, calculated),
            **{key: _metric(row) for key, row in calculated.items()},
        )
        for year, calculated in zip(request.years, facts.history, strict=True)
    ]
    fingerprint_content = {
        "normalized_input": request.model_dump(mode="json"),
        "policy_snapshot": TypeAdapter(PolicyConfig).dump_python(policy, mode="json"),
        "calculation_version": CALCULATION_VERSION,
        "schema_version": SCHEMA_VERSION,
        "serialization_version": SERIALIZATION_VERSION,
    }
    serialized = json.dumps(
        fingerprint_content, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False
    ).encode("utf-8")
    latest = request.years[-1]
    return CommercialAssessment(
        schema_version=SCHEMA_VERSION,
        calculation_version=CALCULATION_VERSION,
        serialization_version=SERIALIZATION_VERSION,
        normalized_input=request,
        selected_period=Period(period_start=latest.period_start, period_end=latest.period_end),
        coverage_basis="current_pro_forma",
        assumptions_as_of=request.assessment_as_of,
        historical_spread=historical,
        current_facts=CurrentFacts(**{name: _metric(row) for name, row in facts.current.items()}),
        guarantor_contributions=[
            GuarantorContribution(
                guarantor_index=index,
                name=guarantor.name,
                **{
                    name: _metric(by_id[f"current.guarantors.{index}.{name}"])
                    for name in ("business_ebitda", "outside_income", "personal_debt")
                },
            )
            for index, guarantor in enumerate(request.guarantors)
        ],
        k1_history_periods=[
            Period(period_start=request.years[i].period_start, period_end=request.years[i].period_end)
            for i in selected_history
        ],
        calculation_trace=[
            TraceRow.model_validate({**asdict(row), "operands": [asdict(o) for o in row.operands]})
            for row in facts.trace
        ],
        decision=decision_from_commercial_facts(facts, policy),
        policy_snapshot=policy,
        fingerprint=AssessmentFingerprint(
            algorithm="sha256",
            value=sha256(serialized).hexdigest(),
            content="normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version",
        ),
    )
