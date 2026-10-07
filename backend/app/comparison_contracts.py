"""Strict retention commands; original preview JSON does not require recalculation."""
from datetime import datetime, timedelta
from typing import Any, Literal
from uuid import UUID

from pydantic import Field, field_validator

from .assessment_contracts import ContractModel
from .case_contracts import RecordingMetadata
from .scenario_contracts import ScenarioPreviewCommand

COMPARISON_STORAGE_VERSION = "scenario-comparison-json-v1"
_HASH = r"^[0-9a-f]{64}$"


def canonical_uuid(value):
    if str(UUID(value)) != value:
        raise ValueError("Stored UUID must use its canonical representation")
    return value


def utc_timestamp(value):
    stamp = datetime.fromisoformat(value)
    if stamp.utcoffset() != timedelta(0) or stamp.isoformat(timespec="microseconds") != value:
        raise ValueError("Stored timestamp must be canonical UTC with microseconds")
    return value


class ComparisonCreate(ScenarioPreviewCommand):
    schema_version: Literal["commercial-scenario-comparison-create-v1"]
    expected_preview_fingerprint: str = Field(pattern=_HASH)

    def preview_command(self):
        return ScenarioPreviewCommand(schema_version="commercial-scenario-preview-v1",
                                      baseline_run_id=self.baseline_run_id, scenarios=self.scenarios)


class ComparisonRecord(ContractModel):
    schema_version: Literal["commercial-scenario-comparison-v1"] = "commercial-scenario-comparison-v1"
    storage_serialization_version: Literal["scenario-comparison-json-v1"] = COMPARISON_STORAGE_VERSION
    persisted: Literal[True] = True
    comparison_id: str
    case_id: str
    baseline_revision: int = Field(ge=1, le=2**63 - 1)
    baseline_run_id: str
    recorded_at: str
    actor: Literal["prototype-demo-unverified"] = "prototype-demo-unverified"
    recording: RecordingMetadata
    preview: dict[str, Any]
    payload_hash: str = Field(pattern=_HASH)

    _ids = field_validator("comparison_id", "case_id", "baseline_run_id")(canonical_uuid)
    _stamp = field_validator("recorded_at")(utc_timestamp)


class ComparisonScenarioSummary(ContractModel):
    scenario_key: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    name: str = Field(min_length=1, max_length=120)


class ComparisonSummary(ContractModel):
    comparison_id: str
    case_id: str
    baseline_revision: int = Field(ge=1, le=2**63 - 1)
    baseline_run_id: str
    recorded_at: str
    preview_fingerprint: str = Field(pattern=_HASH)
    scenario_count: int = Field(ge=1, le=10)
    scenarios: list[ComparisonScenarioSummary] = Field(min_length=1, max_length=10)
    policy_version: str
    schema_version: Literal["commercial-scenario-comparison-v1"]
    storage_serialization_version: Literal["scenario-comparison-json-v1"]
    preview_schema_version: Literal["commercial-scenario-preview-v1"]
    preview_serialization_version: Literal["scenario-preview-json-v1"]
    scenario_definition_version: str
    calculation_version: str

    _ids = field_validator("comparison_id", "case_id", "baseline_run_id")(canonical_uuid)
    _stamp = field_validator("recorded_at")(utc_timestamp)


class ComparisonPage(ContractModel):
    items: list[ComparisonSummary]
    next_cursor: str | None
