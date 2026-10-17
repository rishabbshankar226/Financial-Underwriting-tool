"""The read-only commercial analysis contract: derived views of one assessment, never a decision."""

from __future__ import annotations

from datetime import date
from typing import Literal, Self

from pydantic import Field, model_validator

from .assessment_contracts import (
    AssessmentFingerprint,
    ContractModel,
    Metric,
    Period,
    TraceRow,
)
from .finance import ReportedDecimal, ResultDecimal, Scalar
from .schemas import DISCLAIMER

ANALYSIS_SCHEMA_VERSION: Literal["commercial-analysis-v1"] = "commercial-analysis-v1"
ANALYSIS_DEFINITION_VERSION: Literal["commercial-analysis-definition-v1"] = "commercial-analysis-definition-v1"
ANALYSIS_SERIALIZATION_VERSION: Literal["analysis-json-v1"] = "analysis-json-v1"
MAX_MONTHLY_ROWS = 360
MAX_ANNUAL_ROWS = 1000

CoverageName = Literal["dscr", "fccr", "global_dscr"]
Outcome = Literal["approve", "review", "decline"]


class AnalysisCommand(ContractModel):
    """The saved-revision route analyzes the retained revision; its body carries nothing."""


class AnalysisBaseline(ContractModel):
    case_id: str
    revision: int = Field(ge=1)
    run_id: str
    input_hash: str
    payload_hash: str


class LineMetrics(ContractModel):
    gross_receipts: Metric
    cogs: Metric
    operating_expense_excl_dna_interest_comp: Metric
    officer_compensation: Metric
    depreciation: Metric
    amortization: Metric
    interest_expense: Metric
    section_179: Metric
    k1_distribution: Metric
    gross_profit: Metric
    ordinary_business_income: Metric
    ebitda: Metric


class PeriodAnalysis(Period):
    period_index: int = Field(ge=0)
    common_size: LineMetrics
    prior_period: Period | None
    prior_period_adjacent: bool | None
    change_vs_prior: LineMetrics | None


class CapacityConstraint(ContractModel):
    constraint: CoverageName
    approval_minimum: ResultDecimal
    # Unfloored: a negative amount means existing obligations already exceed the minimum.
    max_annual_payment: Metric


class DebtCapacity(ContractModel):
    basis: Literal["latest_period_current_pro_forma"]
    constraints: list[CapacityConstraint] = Field(min_length=3, max_length=3)
    binding_constraint: CoverageName
    max_annual_payment: Metric
    max_monthly_payment: Metric
    max_principal: Metric
    requested_principal: Metric
    principal_headroom: Metric
    has_capacity: bool


class CoverageBreakeven(ContractModel):
    constraint: CoverageName
    threshold_kind: Literal["approval_minimum", "decline_floor"]
    threshold: ResultDecimal
    ebitda_breakeven: Metric
    ebitda_cushion: Metric
    revenue_cushion: Metric


class Breakevens(ContractModel):
    ownership_weight: Metric
    rows: list[CoverageBreakeven] = Field(min_length=6, max_length=6)
    binding_approval_constraint: CoverageName | None
    binding_decline_constraint: CoverageName | None


class AmortizationMonth(ContractModel):
    month: int = Field(ge=1)
    payment: ReportedDecimal
    interest: ReportedDecimal
    principal: ReportedDecimal
    ending_balance: ReportedDecimal


class AmortizationYear(ContractModel):
    loan_year: int = Field(ge=1, le=MAX_ANNUAL_ROWS)
    months: int = Field(ge=1, le=12)
    payments: ReportedDecimal
    interest: ReportedDecimal
    principal: ReportedDecimal
    ending_balance: ReportedDecimal


class PaymentReconciliation(ContractModel):
    annuity_monthly_payment: ResultDecimal
    scheduled_monthly_payment: ReportedDecimal
    monthly_rounding_difference: ResultDecimal
    coverage_annual_payment: ResultDecimal
    first_loan_year_payments: ReportedDecimal
    first_loan_year_difference: ResultDecimal
    explanation: str


class AmortizationSchedule(ContractModel):
    status: Literal["available", "not_applicable"]
    explanation: str | None
    schedule_principal: ReportedDecimal | None
    principal_rounding_difference: ResultDecimal | None
    scheduled_payment: ReportedDecimal | None
    final_payment: ReportedDecimal | None
    final_payment_adjustment: ReportedDecimal | None
    total_payments: ReportedDecimal | None
    total_interest: ReportedDecimal | None
    total_principal: ReportedDecimal | None
    payment_count: int | None
    early_payoff: bool | None
    annual_rows: list[AmortizationYear] = Field(max_length=MAX_ANNUAL_ROWS)
    monthly_rows: list[AmortizationMonth] = Field(max_length=MAX_MONTHLY_ROWS)
    monthly_rows_truncated: bool
    reconciliation: PaymentReconciliation | None

    @model_validator(mode="after")
    def consistent_state(self) -> Self:
        optional = (
            self.schedule_principal,
            self.principal_rounding_difference,
            self.scheduled_payment,
            self.final_payment,
            self.final_payment_adjustment,
            self.total_payments,
            self.total_interest,
            self.total_principal,
            self.payment_count,
            self.early_payoff,
            self.reconciliation,
        )
        if self.status == "not_applicable":
            if any(value is not None for value in optional) or self.annual_rows or self.monthly_rows:
                raise ValueError("An unavailable schedule carries no amounts or rows")
            if not self.explanation or not self.explanation.strip():
                raise ValueError("An unavailable schedule requires an explanation")
        elif any(value is None for value in optional) or not self.annual_rows or not self.monthly_rows:
            raise ValueError("An available schedule requires its amounts and rows")
        return self


class SensitivityCell(ContractModel):
    revenue_change: ResultDecimal
    proposed_rate_change_bps: ResultDecimal
    status: Literal["available", "not_applicable"]
    explanation: str | None
    resulting_annual_rate: ResultDecimal | None
    dscr: Metric
    fccr: Metric
    global_dscr: Metric
    outcome: Outcome | None


class SensitivityGrid(ContractModel):
    status: Literal["available", "not_applicable"]
    explanation: str | None
    scenario_definition_version: Literal["commercial-scenario-definition-v2"]
    coverage_basis: Literal["stressed_latest_period_current_pro_forma"]
    definition_ids: list[str]
    revenue_changes: list[ResultDecimal]
    rate_changes_bps: list[ResultDecimal]
    cells: list[SensitivityCell] = Field(max_length=20)
    held_fixed_assumptions: list[str]


FactorStatus = Literal["meets_approval", "review_band", "below_decline_floor", "not_applicable"]


class FactorExplanation(ContractModel):
    name: str
    label: str
    status: FactorStatus
    summary: str
    comparison_operator: str | None
    value: Scalar
    raw_value: Scalar | None
    threshold: Scalar | None
    decline_threshold: ResultDecimal | None
    approval_cushion: Metric
    decline_cushion: Metric
    weight: ResultDecimal
    score_contribution: ResultDecimal
    blocks_approval: bool
    triggers_decline: bool


class OutcomeCondition(ContractModel):
    condition_id: Literal[
        "coverage_meets_approval", "uca_meets_approval", "k1_history_stable", "coverage_below_decline_floor"
    ]
    description: str
    satisfied: bool


class ScoreBreakdown(ContractModel):
    passed_weight: ResultDecimal
    total_weight: ResultDecimal
    raw_score: ResultDecimal
    reported_score: ReportedDecimal
    note: str


class DecisionExplanation(ContractModel):
    outcome: Outcome
    matched_rule: Literal["approve_all_conditions", "review_k1_history", "decline_coverage_floor", "review_otherwise"]
    headline: str
    conditions: list[OutcomeCondition] = Field(min_length=4, max_length=4)
    rules: list[str]
    factors: list[FactorExplanation]
    score: ScoreBreakdown


class CommercialAnalysis(ContractModel):
    schema_version: Literal["commercial-analysis-v1"] = ANALYSIS_SCHEMA_VERSION
    definition_version: Literal["commercial-analysis-definition-v1"] = ANALYSIS_DEFINITION_VERSION
    serialization_version: Literal["analysis-json-v1"] = ANALYSIS_SERIALIZATION_VERSION
    calculation_version: str
    persisted: Literal[False] = False
    source: Literal["stateless_request", "saved_revision"]
    assessment_fingerprint: AssessmentFingerprint
    policy_version: str
    baseline: AnalysisBaseline | None
    selected_period: Period
    assumptions_as_of: date
    periods: list[PeriodAnalysis] = Field(min_length=1, max_length=10)
    debt_capacity: DebtCapacity
    breakevens: Breakevens
    amortization: AmortizationSchedule
    sensitivity: SensitivityGrid
    explanation: DecisionExplanation
    calculation_trace: list[TraceRow]
    disclaimer: str = DISCLAIMER

    @model_validator(mode="after")
    def baseline_matches_source(self) -> Self:
        if (self.source == "saved_revision") != (self.baseline is not None):
            raise ValueError("Only a saved-revision analysis identifies its baseline")
        return self
