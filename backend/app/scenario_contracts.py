"""A preview is a hypothetical context linked to observed evidence, never a saved run."""

from datetime import date
from typing import Literal, Self

from pydantic import Field, field_validator, model_validator

from .assessment_contracts import (
    AssessmentExistingDebt,
    AssessmentGuarantor,
    AssessmentLoan,
    AssessmentUnits,
    AssessmentWorkingCapital,
    CommercialAssessment,
    ContractModel,
    CurrentFacts,
    DatedFinancialYear,
    GuarantorContribution,
    Period,
    TraceRow,
)
from .config import PolicyConfig
from .field_errors import ContractValueError
from .finance import ExactFinancialDecimal, ResultDecimal, legacy_decimal_values
from .schemas import DISCLAIMER, Decision, DecisionFactor, ReasonCode

SCENARIO_SCHEMA_VERSION: Literal["commercial-scenario-preview-v2"] = "commercial-scenario-preview-v2"
SCENARIO_SERIALIZATION_VERSION: Literal["scenario-preview-json-v2"] = "scenario-preview-json-v2"
SCENARIO_DEFINITION_VERSION: Literal["commercial-scenario-definition-v2"] = (
    "commercial-scenario-definition-v2"
)


class ScenarioAssumptions(ContractModel):
    revenue_change: ExactFinancialDecimal = Field(ge=-1)
    cogs_change: ExactFinancialDecimal = Field(ge=-1)
    operating_expense_change: ExactFinancialDecimal = Field(ge=-1)
    proposed_rate_change_bps: ExactFinancialDecimal


class ScenarioCommand(ContractModel):
    scenario_key: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    name: str = Field(max_length=120)
    rationale: str = Field(max_length=2000)
    assumptions: ScenarioAssumptions

    @field_validator("name", "rationale", mode="before")
    @classmethod
    def nonblank_text(cls, value: object) -> object:
        if type(value) is not str:
            return value
        value = value.strip()
        if not value:
            raise ContractValueError("A nonblank name and rationale are required", "blank_text")
        return value


class ScenarioBatchCommand(ContractModel):
    baseline_run_id: str
    scenarios: list[ScenarioCommand] = Field(min_length=1, max_length=10)

    @model_validator(mode="after")
    def unique_keys(self) -> Self:
        seen: set[str] = set()
        for index, scenario in enumerate(self.scenarios):
            if scenario.scenario_key in seen:
                raise ContractValueError(
                    "Scenario keys must be unique within the request",
                    "duplicate_scenario_key",
                    pointer=f"/scenarios/{index}/scenario_key",
                )
            seen.add(scenario.scenario_key)
        return self


class ScenarioPreviewCommand(ScenarioBatchCommand):
    schema_version: Literal["commercial-scenario-preview-v2"]

    @model_validator(mode="before")
    @classmethod
    def legacy_version(cls, value: object) -> object:
        if isinstance(value, dict) and value.get("schema_version") == "commercial-scenario-preview-v1":
            converted = legacy_decimal_values(value)
            if isinstance(converted, dict):
                return {**converted, "schema_version": SCENARIO_SCHEMA_VERSION}
        return value


class ProjectionInputs(ContractModel):
    operating: DatedFinancialYear
    proposed_loan: AssessmentLoan
    existing_debt: AssessmentExistingDebt
    guarantors: list[AssessmentGuarantor]
    working_capital: AssessmentWorkingCapital


class PolicyHeadroom(ContractModel):
    comparison_operator: Literal[">=", ">"]
    approval_threshold: ResultDecimal
    decline_threshold: ResultDecimal | None
    baseline_approval: ResultDecimal | None
    projected_approval: ResultDecimal | None
    baseline_decline: ResultDecimal | None
    projected_decline: ResultDecimal | None


class MetricComparison(ContractModel):
    metric: str
    baseline_fact_id: str
    projected_fact_id: str
    unit: str
    baseline_value: ResultDecimal | None
    projected_value: ResultDecimal | None
    delta: ResultDecimal | None
    delta_explanation: str | None
    policy_headroom: PolicyHeadroom | None


class FactorChange(ContractModel):
    name: str
    baseline: DecisionFactor
    projected: DecisionFactor
    changed: bool
    projected_fact_id: str
    basis: Literal["projected_current", "observed_history"]


class OutcomeChange(ContractModel):
    baseline: Literal["approve", "review", "decline"]
    projected: Literal["approve", "review", "decline"]
    changed: bool


class ReasonChange(ContractModel):
    code: str
    baseline: ReasonCode | None
    projected: ReasonCode | None
    change: Literal["added", "removed", "changed"]


class ScenarioResult(ScenarioCommand):
    projection_inputs: ProjectionInputs
    coverage_basis: Literal["stressed_latest_period_current_pro_forma"]
    current_facts: CurrentFacts
    guarantor_contributions: list[GuarantorContribution]
    decision: Decision
    calculation_trace: list[TraceRow]
    comparisons: list[MetricComparison]
    factor_changes: list[FactorChange]
    outcome_change: OutcomeChange
    reason_changes: list[ReasonChange]


class BaselineEvidence(ContractModel):
    case_id: str
    revision: int = Field(ge=1)
    run_id: str
    input_hash: str
    payload_hash: str
    assessment: CommercialAssessment


class PreviewFingerprint(ContractModel):
    algorithm: Literal["sha256"] = "sha256"
    value: str
    content: Literal["baseline_identity+payload_hash+normalized_command+policy_snapshot+versions"] = (
        "baseline_identity+payload_hash+normalized_command+policy_snapshot+versions"
    )


class ScenarioPreview(ContractModel):
    schema_version: Literal["commercial-scenario-preview-v2"] = SCENARIO_SCHEMA_VERSION
    serialization_version: Literal["scenario-preview-json-v2"] = SCENARIO_SERIALIZATION_VERSION
    scenario_definition_version: Literal["commercial-scenario-definition-v2"] = SCENARIO_DEFINITION_VERSION
    calculation_version: str
    persisted: Literal[False] = False
    baseline: BaselineEvidence
    selected_period: Period
    assumptions_as_of: date
    units: AssessmentUnits
    policy_snapshot: PolicyConfig
    scenarios: list[ScenarioResult]
    fingerprint: PreviewFingerprint
    held_fixed_assumptions: list[str]
    disclaimer: str = DISCLAIMER
