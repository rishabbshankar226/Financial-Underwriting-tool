"""Bounded JSON reading before framework decoding can discard duplicate keys."""
from fastapi import HTTPException
from pydantic import ValidationError

from .assessment_contracts import MAX_REQUEST_BYTES
from .ingestion import parse_structured


async def read_contract(request, model, label="Assessment", *, allow_empty=False):
    chunks, size = [], 0
    async for chunk in request.stream():
        size += len(chunk)
        if size > MAX_REQUEST_BYTES:
            raise HTTPException(status_code=413, detail=f"{label} request exceeds 1,000,000 bytes")
        chunks.append(chunk)
    body = b"".join(chunks)
    if allow_empty and not body:
        body = b"{}"
    try:
        parse_structured(body.decode("utf-8"), "json")
        return model.model_validate_json(body)
    except ValidationError as exc:
        errors = exc.errors(include_url=False, include_input=False, include_context=False)
        for error in errors:
            error["loc"] = ["body", *error["loc"]]
        raise HTTPException(status_code=422, detail=errors) from exc
    except (ValueError, OverflowError, RecursionError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
