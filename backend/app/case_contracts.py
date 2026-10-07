"""Commands are strict; stored assessment JSON remains readable without replay."""
from math import isfinite
from typing import Any, Literal

from pydantic import Field, field_validator

from .assessment_contracts import CommercialAssessmentRequest, ContractModel

STORAGE_VERSION = "case-json-v1"
REPLAY_HEADER = "Idempotency-Replayed"


class CaseCreate(ContractModel):
    input: CommercialAssessmentRequest
    rationale: str = Field(max_length=2000)

    @field_validator("rationale")
    @classmethod
    def nonblank_rationale(cls, value):
        if not value.strip():
            raise ValueError("A nonblank rationale is required")
        return value.strip()


class CaseEdit(ContractModel):
    field_path: str = Field(max_length=160)
    new_value: float | int
    rationale: str = Field(max_length=2000)

    _rationale = field_validator("rationale")(CaseCreate.nonblank_rationale.__func__)

    @field_validator("new_value", mode="before")
    @classmethod
    def strict_number(cls, value):
        try:
            if type(value) not in (int, float) or not isfinite(value):
                raise ValueError("Edit values must be finite JSON numbers")
        except OverflowError as exc:
            raise ValueError("Edit exceeds the supported finite range") from exc
        return value


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
    before: float | int | None
    after: float | int | None
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
    normalized_input: dict[str, Any]
    input_hash: str
    assessment: dict[str, Any]
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
