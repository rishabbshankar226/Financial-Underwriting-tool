"""Bounded retention transport; CaseStore owns transactions and original recovery."""

import re

from fastapi import APIRouter, FastAPI, Request, Response
from starlette.concurrency import run_in_threadpool

from .case_contracts import REPLAY_HEADER
from .case_routes import _body, _limit, _single_header
from .cases import CaseStore, CaseStoreError, require_uuid
from .comparison_contracts import ComparisonCreate, ComparisonPage, ComparisonRecord
from .comparison_storage import ComparisonReceipt, etag_for_comparison, serialize_comparison
from .json_transport import install_contract_openapi, read_contract
from .scenario_routes import ReadStore

router = APIRouter(tags=["Saved commercial comparisons"])


def owns_comparison_json(path: str) -> bool:
    return re.fullmatch(r"/cases/[^/]+/revisions/[^/]+/scenario-comparisons", path.rstrip("/")) is not None


def _retain(
    store: CaseStore, case_id: str, revision: str, command: ComparisonCreate, key: str
) -> ComparisonReceipt:
    if not re.fullmatch(r"[1-9][0-9]{0,18}", revision) or int(revision) > 2**63 - 1:
        raise CaseStoreError(400, "invalid_revision", "Revision must be a supported positive integer")
    return store.retain_comparison(case_id, int(revision), command, key)


@router.post(
    "/cases/{case_id}/revisions/{revision}/scenario-comparisons/",
    response_model=ComparisonRecord,
    status_code=201,
    include_in_schema=False,
)
@router.post(
    "/cases/{case_id}/revisions/{revision}/scenario-comparisons",
    response_model=ComparisonRecord,
    status_code=201,
    openapi_extra={
        **_body(ComparisonCreate),
        "parameters": [
            {
                "name": "Idempotency-Key",
                "in": "header",
                "required": True,
                "description": "One operation UUID; retain the exact command and UUID for retries",
                "schema": {"type": "string", "format": "uuid"},
            }
        ],
    },
    responses={
        400: {"description": "Malformed locator, missing/invalid/repeated operation UUID"},
        404: {"description": "Selected case or revision does not exist"},
        409: {"description": "Baseline/review fingerprint/key conflict or explicit storage upgrade required"},
        413: {"description": "Actual request stream exceeds 1,000,000 bytes"},
        422: {"description": "Invalid strict command/calculation or retained record exceeds 16 MiB"},
        503: {"description": "Storage unavailable, busy or failed schema/content verification"},
    },
)
async def retain_comparison(case_id: str, revision: str, request: Request, store: ReadStore) -> Response:
    command = await read_contract(request, ComparisonCreate, "Scenario comparison")
    key = require_uuid(
        _single_header(request, "idempotency-key", request.headers.get("idempotency-key")), "Idempotency-Key"
    )
    receipt = await run_in_threadpool(_retain, store, case_id, revision, command, key)
    record = receipt.record
    return Response(
        content=serialize_comparison(record),
        status_code=receipt.status,
        media_type="application/json",
        headers={
            "ETag": receipt.etag,
            REPLAY_HEADER: str(receipt.replayed).lower(),
            "Location": f"/cases/{record.case_id}/scenario-comparisons/{record.comparison_id}",
        },
    )


@router.get("/cases/{case_id}/scenario-comparisons/", response_model=ComparisonPage, include_in_schema=False)
@router.get("/cases/{case_id}/scenario-comparisons", response_model=ComparisonPage)
def list_comparisons(
    case_id: str, store: ReadStore, limit: str = "25", after: str | None = None
) -> ComparisonPage:
    return store.list_comparisons(case_id, _limit(limit), after)


@router.get(
    "/cases/{case_id}/scenario-comparisons/{comparison_id}/",
    response_model=ComparisonRecord,
    include_in_schema=False,
)
@router.get("/cases/{case_id}/scenario-comparisons/{comparison_id}", response_model=ComparisonRecord)
def get_comparison(case_id: str, comparison_id: str, store: ReadStore) -> Response:
    record = store.get_comparison(case_id, comparison_id)
    return Response(
        content=serialize_comparison(record),
        media_type="application/json",
        headers={"ETag": etag_for_comparison(record)},
    )


def install_comparison_openapi(app: FastAPI) -> None:
    install_contract_openapi(app, (ComparisonCreate,))
