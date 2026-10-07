"""HTTP adapter. All SQLite work runs in worker threads with owned connections."""
import os
import re
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Request, Response
from starlette.concurrency import run_in_threadpool

from .assessment_contracts import ContractModel
from .case_contracts import REPLAY_HEADER, CaseCreate, CaseEdit, CasePage, CaseSnapshot, ReplayResult, RevisionPage
from .cases import CaseStore, CaseStoreError, etag_for, require_etag, require_uuid, serialize_snapshot
from .json_transport import read_contract

router = APIRouter(tags=["Saved dated cases"])


class ReplayCommand(ContractModel):
    pass


def owns_case_json(path):
    path = path.rstrip("/")
    return path == "/cases" or re.fullmatch(r"/cases/[^/]+/revisions(?:/[^/]+/replay)?", path) is not None


def configured_store():
    path = os.environ.get("SPREADLINE_CASE_DB", "").strip()
    if not path:
        raise CaseStoreError(503, "storage_not_configured", "Set SPREADLINE_CASE_DB to enable local saved cases")
    return CaseStore(path)


Store = Annotated[CaseStore, Depends(configured_store)]
OperationKey = Annotated[str | None, Header(alias="Idempotency-Key", description="UUID identifying one write; retain for retries")]
Precondition = Annotated[str | None, Header(alias="If-Match", description="One strong ETag returned by the selected case revision")]


def _single_header(request, name, value):
    if len(request.headers.getlist(name)) > 1:
        raise CaseStoreError(400, "duplicate_header", f"Supply one {name} header")
    return value


def _write_response(receipt):
    return Response(status_code=receipt.status, content=serialize_snapshot(receipt.snapshot), media_type="application/json",
                    headers={"ETag": receipt.etag, REPLAY_HEADER: str(receipt.replayed).lower()})


def _body(model, required=True):
    return {"requestBody": {"required": required, "content": {"application/json": {
        "schema": {"$ref": "#/components/schemas/" + model.__name__}
    }}}}


@router.post("/cases/", response_model=CaseSnapshot, status_code=201, include_in_schema=False)
@router.post("/cases", response_model=CaseSnapshot, status_code=201, openapi_extra=_body(CaseCreate))
async def create_case(request: Request, store: Store, idempotency_key: OperationKey = None):
    command = await read_contract(request, CaseCreate, "Case")
    key = require_uuid(_single_header(request, "idempotency-key", idempotency_key), "Idempotency-Key")
    return _write_response(await run_in_threadpool(store.create, command, key))


def _limit(value):
    if not re.fullmatch(r"[1-9][0-9]{0,2}", value) or int(value) > 100:
        raise CaseStoreError(400, "invalid_limit", "Page limit must be an integer from 1 to 100")
    return int(value)


@router.get("/cases/", response_model=CasePage, include_in_schema=False)
@router.get("/cases", response_model=CasePage)
def list_cases(store: Store, limit: str = "25", after: str | None = None):
    return store.list_cases(_limit(limit), after)


@router.get("/cases/{case_id}/", response_model=CaseSnapshot, include_in_schema=False)
@router.get("/cases/{case_id}", response_model=CaseSnapshot)
def get_case(case_id: str, store: Store):
    snapshot = store.get(case_id)
    return Response(content=serialize_snapshot(snapshot), media_type="application/json", headers={"ETag": etag_for(snapshot)})


@router.get("/cases/{case_id}/revisions/", response_model=RevisionPage, include_in_schema=False)
@router.get("/cases/{case_id}/revisions", response_model=RevisionPage)
def list_revisions(case_id: str, store: Store, limit: str = "25", after: str | None = None):
    return store.list_revisions(case_id, _limit(limit), after)


@router.get("/cases/{case_id}/revisions/{number}/", response_model=CaseSnapshot, include_in_schema=False)
@router.get("/cases/{case_id}/revisions/{number}", response_model=CaseSnapshot)
def get_revision(case_id: str, number: int, store: Store):
    snapshot = store.get(case_id, number)
    return Response(content=serialize_snapshot(snapshot), media_type="application/json", headers={"ETag": etag_for(snapshot)})


@router.post("/cases/{case_id}/revisions/", response_model=CaseSnapshot, status_code=201, include_in_schema=False)
@router.post("/cases/{case_id}/revisions", response_model=CaseSnapshot, status_code=201, openapi_extra=_body(CaseEdit))
async def edit_case(case_id: str, request: Request, store: Store, idempotency_key: OperationKey = None,
                    if_match: Precondition = None):
    command = await read_contract(request, CaseEdit, "Case")
    etag = require_etag(_single_header(request, "if-match", if_match))
    key = require_uuid(_single_header(request, "idempotency-key", idempotency_key), "Idempotency-Key")
    return _write_response(await run_in_threadpool(store.edit, case_id, command, etag, key))


@router.post("/cases/{case_id}/revisions/{number}/replay/", response_model=ReplayResult, include_in_schema=False)
@router.post("/cases/{case_id}/revisions/{number}/replay", response_model=ReplayResult, openapi_extra=_body(ReplayCommand, False))
async def replay_revision(case_id: str, number: int, request: Request, store: Store):
    await read_contract(request, ReplayCommand, "Case", allow_empty=True)
    return await run_in_threadpool(store.replay, case_id, number)


def install_case_openapi(app):
    """Advertise typed commands while the route owns the bounded raw-body read."""
    original = app.openapi
    def case_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        schema = original()
        components = schema.setdefault("components", {}).setdefault("schemas", {})
        for model in (CaseCreate, CaseEdit, ReplayCommand):
            definition = model.model_json_schema(ref_template="#/components/schemas/{model}")
            for name, value in definition.pop("$defs", {}).items():
                components.setdefault(name, value)
            components[model.__name__] = definition
        return schema
    app.openapi = case_openapi
