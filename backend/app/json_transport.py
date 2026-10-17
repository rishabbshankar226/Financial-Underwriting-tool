"""Bounded, duplicate-safe intake preserves the lexical precision of JSON numbers."""

from collections.abc import Sequence
from typing import TypeVar

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, ValidationError

from .assessment_contracts import MAX_REQUEST_BYTES
from .contract_errors import FieldErrors, parse_field_errors, validation_field_errors
from .ingestion import parse_structured
from .json_values import JsonObject, canonical_json, json_object

Model = TypeVar("Model", bound=BaseModel)


class ContractValidationError(HTTPException):
    """A 422 whose ``detail`` is unchanged; field-mapped errors are rendered beside it."""

    def __init__(self, detail: object, field_errors: FieldErrors) -> None:
        super().__init__(status_code=422, detail=detail)
        self.field_errors = field_errors


async def read_contract(
    request: Request, model: type[Model], label: str = "Assessment", *, allow_empty: bool = False
) -> Model:
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
        decoded = parse_structured(body.decode("utf-8"), "json", exact_numbers=True)
    except (ValueError, OverflowError, RecursionError) as exc:
        raise ContractValidationError(str(exc), parse_field_errors(exc)) from exc
    try:
        return model.model_validate_json(canonical_json(decoded))
    except ValidationError as exc:
        errors = exc.errors(include_url=False, include_input=False, include_context=False)
        for error in errors:
            error["loc"] = ("body", *error["loc"])
        raise ContractValidationError(errors, validation_field_errors(exc, decoded)) from exc
    except (ValueError, OverflowError, RecursionError) as exc:
        raise ContractValidationError(str(exc), parse_field_errors(exc)) from exc


def install_contract_openapi(app: "FastAPI", models: "Sequence[type[BaseModel]]") -> None:
    """Advertise schemas for routes that own their validated request streams."""
    original = app.openapi

    def contract_openapi() -> JsonObject:
        schema = json_object(app.openapi_schema or original())
        components = json_object(schema.setdefault("components", {}))
        definitions = json_object(components.setdefault("schemas", {}))
        schemes = json_object(components.setdefault("securitySchemes", {}))
        schemes["OperatorBearer"] = {"type": "http", "scheme": "bearer"}
        schema["security"] = [{"OperatorBearer": []}]
        paths = json_object(schema.get("paths", {}))
        health = json_object(paths.get("/health", {}))
        if isinstance(health.get("get"), dict):
            json_object(health["get"])["security"] = []
        for model in models:
            definition = json_object(model.model_json_schema(ref_template="#/components/schemas/{model}"))
            definitions.update(json_object(definition.pop("$defs", {})))
            definitions[model.__name__] = definition
        return schema

    # FastAPI extension point; static method assignment is rejected by mypy.
    setattr(app, "openapi", contract_openapi)  # noqa: B010
