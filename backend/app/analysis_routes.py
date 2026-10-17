"""Bounded HTTP adapters for read-only analysis; calculations run on owned worker threads."""

import re

from fastapi import APIRouter, FastAPI, HTTPException, Request
from starlette.concurrency import run_in_threadpool

from .analysis import analyze_commercial, analyze_saved_revision
from .analysis_contracts import AnalysisCommand, CommercialAnalysis
from .assessment_contracts import CommercialAssessmentRequest
from .cases import CaseStore, CaseStoreError, require_uuid
from .contract_errors import FieldErrors
from .json_transport import install_contract_openapi, read_contract
from .scenario_routes import ReadStore

router = APIRouter(tags=["Commercial analysis"])


def owns_analysis_json(path: str) -> bool:
    normalized = path.rstrip("/")
    return (
        normalized == "/commercial/analysis"
        or re.fullmatch(r"/cases/[^/]+/revisions/[^/]+/analysis", normalized) is not None
    )


def _stateless(request: CommercialAssessmentRequest) -> CommercialAnalysis:
    try:
        return analyze_commercial(request)
    except (ValueError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def _saved(store: CaseStore, case_id: str, revision: str) -> CommercialAnalysis:
    case_id = require_uuid(case_id)
    if not re.fullmatch(r"[1-9][0-9]{0,18}", revision) or int(revision) > 2**63 - 1:
        raise CaseStoreError(400, "invalid_revision", "Revision must be a supported positive integer")
    return analyze_saved_revision(store.get(case_id, int(revision)), assessment_operation=store.assessment_operation)


@router.post("/commercial/analysis/", response_model=CommercialAnalysis, include_in_schema=False)
@router.post(
    "/commercial/analysis",
    response_model=CommercialAnalysis,
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {"schema": {"$ref": "#/components/schemas/CommercialAssessmentRequest"}}
            },
        }
    },
    responses={
        413: {"description": "Actual streamed request exceeds 1,000,000 bytes"},
        422: {"description": "Invalid assessment input, with field-mapped errors, or unsupported calculation"},
    },
)
async def commercial_analysis(request: Request) -> CommercialAnalysis:
    validated = await read_contract(request, CommercialAssessmentRequest, "Analysis")
    return await run_in_threadpool(_stateless, validated)


@router.post(
    "/cases/{case_id}/revisions/{revision}/analysis/",
    response_model=CommercialAnalysis,
    include_in_schema=False,
)
@router.post(
    "/cases/{case_id}/revisions/{revision}/analysis",
    response_model=CommercialAnalysis,
    openapi_extra={
        "requestBody": {
            "required": False,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/AnalysisCommand"}}},
        }
    },
    responses={
        400: {"description": "Malformed case UUID or revision locator"},
        404: {"description": "Selected saved case or revision does not exist"},
        409: {"description": "The retained definition or replay cannot support analysis"},
        413: {"description": "Actual streamed request exceeds 1,000,000 bytes"},
        422: {"description": "Command content, or a revision outside the analysis contract"},
        503: {"description": "Case storage is unavailable or failed integrity checks"},
    },
)
async def saved_analysis(case_id: str, revision: str, request: Request, store: ReadStore) -> CommercialAnalysis:
    await read_contract(request, AnalysisCommand, "Analysis", allow_empty=True)
    return await run_in_threadpool(_saved, store, case_id, revision)


def install_analysis_openapi(app: FastAPI) -> None:
    install_contract_openapi(app, (AnalysisCommand, FieldErrors))
