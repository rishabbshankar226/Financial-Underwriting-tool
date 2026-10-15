"""Bounded HTTP preview adapter; reads and calculations use owned worker threads."""

import os
import re
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, Request
from starlette.concurrency import run_in_threadpool

from .cases import CaseStore, CaseStoreError, require_uuid
from .json_transport import install_contract_openapi, read_contract
from .scenario_contracts import ScenarioPreview, ScenarioPreviewCommand
from .scenarios import preview_commercial_scenarios

router = APIRouter(tags=["Commercial stress previews"])


def owns_scenario_json(path: str) -> bool:
    return re.fullmatch(r"/cases/[^/]+/revisions/[^/]+/scenarios/preview", path.rstrip("/")) is not None


def configured_read_store() -> CaseStore:
    path = os.environ.get("SPREADLINE_CASE_DB", "").strip()
    if not path:
        raise CaseStoreError(
            503, "storage_not_configured", "Set SPREADLINE_CASE_DB to enable local saved cases"
        )
    return CaseStore(path, initialize=False)


ReadStore = Annotated[CaseStore, Depends(configured_read_store)]


def _preview(
    store: CaseStore, case_id: str, revision: str, command: ScenarioPreviewCommand
) -> ScenarioPreview:
    case_id = require_uuid(case_id)
    if not re.fullmatch(r"[1-9][0-9]{0,18}", revision) or int(revision) > 2**63 - 1:
        raise CaseStoreError(400, "invalid_revision", "Revision must be a supported positive integer")
    snapshot = store.get(case_id, int(revision))
    return preview_commercial_scenarios(snapshot, command, assessment_operation=store.assessment_operation)


@router.post(
    "/cases/{case_id}/revisions/{revision}/scenarios/preview/",
    response_model=ScenarioPreview,
    include_in_schema=False,
)
@router.post(
    "/cases/{case_id}/revisions/{revision}/scenarios/preview",
    response_model=ScenarioPreview,
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {"schema": {"$ref": "#/components/schemas/ScenarioPreviewCommand"}}
            },
        }
    },
    responses={
        400: {"description": "Malformed case/run UUID or revision locator"},
        404: {"description": "Selected saved case or revision does not exist"},
        409: {"description": "Baseline run, retained definition or replay cannot support comparison"},
        413: {"description": "Actual streamed request exceeds 1,000,000 bytes"},
        422: {"description": "Invalid command, target amounts or projected calculations"},
        503: {"description": "Case storage is unavailable or failed integrity checks"},
    },
)
async def preview_scenarios(
    case_id: str, revision: str, request: Request, store: ReadStore
) -> ScenarioPreview:
    command = await read_contract(request, ScenarioPreviewCommand, "Scenario preview")
    return await run_in_threadpool(_preview, store, case_id, revision, command)


def install_scenario_openapi(app: FastAPI) -> None:
    install_contract_openapi(app, (ScenarioPreviewCommand,))
