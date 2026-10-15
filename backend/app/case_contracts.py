"""Commands are strict; stored assessment JSON remains readable without replay."""

from typing import Literal, Self

from pydantic import Field, JsonValue, field_validator, model_validator

from .assessment_contracts import CommercialAssessmentRequest, ContractModel
from .finance import FinancialDecimal, as_decimal

STORAGE_VERSION: Literal["case-json-v1"] = "case-json-v1"
REPLAY_HEADER = "Idempotency-Replayed"


class CaseCreate(ContractModel):
    input: CommercialAssessmentRequest
    rationale: str = Field(max_length=2000)

    @field_validator("rationale")
    @classmethod
    def nonblank_rationale(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("A nonblank rationale is required")
        return value.strip()


class CaseEdit(ContractModel):
    field_path: str = Field(max_length=160)
    new_value: int | FinancialDecimal
    rationale: str = Field(max_length=2000)

    @field_validator("rationale")
    @classmethod
    def nonblank_rationale(cls, value: str) -> str:
        return CaseCreate.nonblank_rationale(value)

    @field_validator("new_value", mode="before")
    @classmethod
    def strict_number(cls, value: object) -> object:
        if type(value) is int:
            as_decimal(value)
            return value
        return as_decimal(value)

    @model_validator(mode="after")
    def integer_term(self) -> Self:
        if self.field_path == "/proposed_loan/term_months" and type(self.new_value) is not int:
            raise ValueError("Loan term edits require a JSON integer")
        return self


class EventContext(ContractModel):
    basis: Literal["case_creation", "annual_financials", "working_capital", "current_assumptions"]
    assessment_as_of: str
    period_start: str | None = None
    period_end: str | None = None
    guarantor_index: int | None = None
    guarantor_name: str | None = None
    unit: str | None = None


class CaseEvent(ContractModel):
    kind: Literal["creation", "edit"]
    case_id: str
    revision: int
    run_id: str
    field_path: str | None
    before: str | float | int | None
    after: str | float | int | None
    context: EventContext
    rationale: str
    actor: Literal["prototype-demo-unverified"]
    recorded_at: str


class RecordingMetadata(ContractModel):
    python_version: str
    sqlite_version: str
    packages: dict[str, str]
    dependency_baseline_sha256: str
    source_revision: str | None
    source_status: Literal["build_reported", "development_unverified"]


class CaseSnapshot(ContractModel):
    storage_serialization_version: Literal["case-json-v1"] = STORAGE_VERSION
    case_id: str
    revision: int = Field(ge=1)
    parent_revision: int | None
    run_id: str
    recorded_at: str
    normalized_input: dict[str, JsonValue]
    input_hash: str
    assessment: dict[str, JsonValue]
    event: CaseEvent
    recording: RecordingMetadata
    payload_hash: str


class CaseSummary(ContractModel):
    case_id: str
    borrower_name: str
    created_at: str
    revision: int
    run_id: str
    recorded_at: str


class CasePage(ContractModel):
    items: list[CaseSummary]
    next_cursor: str | None


class RevisionSummary(ContractModel):
    case_id: str
    revision: int
    parent_revision: int | None
    run_id: str
    recorded_at: str
    rationale: str


class RevisionPage(ContractModel):
    items: list[RevisionSummary]
    next_cursor: str | None


class ReplayResult(ContractModel):
    case_id: str
    revision: int
    run_id: str
    status: Literal["matched", "mismatch", "replay_unavailable"]
    differences: list[str]
    explanation: str
