"""Field-mapped validation errors: an additive envelope beside the unchanged ``detail``.

Each item names the submitted JSON field (RFC 6901 pointer), a stable code and a plain
message. Messages never repeat submitted values; the original ``detail`` stays the record
of exactly what the contract rejected.
"""

from __future__ import annotations

from collections.abc import Sequence
from decimal import Decimal
from json import JSONDecodeError
from typing import Literal

from pydantic import Field, ValidationError
from pydantic_core import ErrorDetails

from .assessment_contracts import ContractModel
from .field_errors import ContractValueError, escape_pointer_token, split_pointer
from .finance import decimal_text

FIELD_ERRORS_VERSION: Literal["field-errors-v1"] = "field-errors-v1"
MAX_FIELD_ERRORS = 200

# Codes whose legacy text can repeat submitted input, or reads poorly outside the API.
FIXED_MESSAGES = {
    "invalid_decimal": "Enter a finite decimal number such as 3900000 or 3900000.50.",
    "invalid_date": "Use a calendar date in YYYY-MM-DD format.",
    "period_after_as_of": "Financial periods cannot end after the assessment date.",
    "duplicate_key": "The JSON document repeats an object key.",
    "non_finite_number": "Numbers must be finite.",
    "nesting_too_deep": "The JSON document is nested too deeply.",
    "invalid_json": "The request body is not valid JSON.",
    "invalid_encoding": "The request body must be UTF-8 encoded JSON.",
    "invalid_value": "This value is not valid.",
}
TYPE_MESSAGES = {
    "int_type": "Must be a whole number.",
    "int_parsing": "Must be a whole number.",
    "int_from_float": "Must be a whole number.",
    "string_type": "Must be text.",
    "bool_type": "Must be true or false.",
    "list_type": "Must be a list.",
    "dict_type": "Must be an object.",
    "model_type": "Must be an object.",
    "model_attributes_type": "Must be an object.",
}
BOUNDS = {
    "greater_than_equal": ("too_small", "ge", "Must be at least {}."),
    "greater_than": ("too_small", "gt", "Must be greater than {}."),
    "less_than_equal": ("too_large", "le", "Must be at most {}."),
    "less_than": ("too_large", "lt", "Must be less than {}."),
}
LENGTHS = {
    "too_short": ("too_few_items", "min_length", "Must contain at least {}.", "item"),
    "too_long": ("too_many_items", "max_length", "Must contain at most {}.", "item"),
    "string_too_short": ("text_too_short", "min_length", "Must contain at least {}.", "character"),
    "string_too_long": ("text_too_long", "max_length", "Must contain at most {}.", "character"),
}
SCENARIO_INVALID = "This scenario's projected values exceed the supported calculation contract."


class FieldError(ContractModel):
    pointer: str
    code: str
    message: str
    limit: str | None


class FieldErrors(ContractModel):
    version: Literal["field-errors-v1"] = FIELD_ERRORS_VERSION
    items: list[FieldError] = Field(max_length=MAX_FIELD_ERRORS)
    truncated: bool


def _sentence(text: str) -> str:
    text = text.strip()
    return text if text.endswith((".", "!", "?")) else text + "."


def _limit(value: object) -> str | None:
    if isinstance(value, Decimal):
        return decimal_text(value)
    if type(value) is int:
        return str(value)
    return None


def _contract_error(error: ContractValueError) -> tuple[str, str, str | None]:
    return error.code, FIXED_MESSAGES.get(error.code) or _sentence(str(error)), error.limit


def _described(error: ErrorDetails) -> tuple[str, str, str | None, str | None]:
    """Code, message, limit and the raised relative pointer for one pydantic error."""
    kind = error["type"]
    context = error.get("ctx", {})
    raised = context.get("error")
    if isinstance(raised, ContractValueError):
        return *_contract_error(raised), raised.pointer
    if kind == "missing":
        return "required", "This value is required.", None, None
    if kind == "extra_forbidden":
        return "unknown_field", "This field is not part of the contract.", None, None
    if kind in TYPE_MESSAGES:
        return "invalid_type", TYPE_MESSAGES[kind], None, None
    if kind in ("literal_error", "enum"):
        expected = context.get("expected")
        message = f"Must be one of the supported values: {expected}." if isinstance(expected, str) else (
            "Must be one of the supported values."
        )
        return "invalid_choice", message, None, None
    if kind in BOUNDS:
        code, key, template = BOUNDS[kind]
        limit = _limit(context.get(key))
        return code, template.format(limit) if limit else "Is outside the supported range.", limit, None
    if kind in LENGTHS:
        code, key, template, noun = LENGTHS[kind]
        limit = _limit(context.get(key))
        if limit is None:
            return code, "Has an unsupported length.", None, None
        return code, template.format(f"{limit} {noun}" + ("" if limit == "1" else "s")), limit, None
    if kind == "string_pattern_mismatch":
        return "invalid_format", "Does not match the required format.", None, None
    if kind.endswith(("_type", "_parsing")):
        return "invalid_type", "Has an unsupported type.", None, None
    return "invalid_value", FIXED_MESSAGES["invalid_value"], None, None


def _pointer(loc: Sequence[str | int], document: object, raised: str | None) -> str:
    """Follow ``loc`` through the submitted document; validator-internal segments end the walk."""
    tokens: list[str] = []
    node = document
    for position, part in enumerate(loc):
        if isinstance(node, dict) and isinstance(part, str):
            if part in node:
                tokens.append(part)
                node = node[part]
                continue
            if position == len(loc) - 1:
                tokens.append(part)  # a missing member is named where it belongs
            break
        if isinstance(node, list) and type(part) is int and 0 <= part < len(node):
            tokens.append(str(part))
            node = node[part]
            continue
        break
    if raised:
        tokens.extend(split_pointer(raised))
    return "".join("/" + escape_pointer_token(token) for token in tokens)


def _envelope(items: list[FieldError], total: int) -> FieldErrors:
    return FieldErrors(items=items, truncated=total > MAX_FIELD_ERRORS)


def validation_field_errors(exc: ValidationError, document: object) -> FieldErrors:
    errors = exc.errors(include_url=False, include_input=False, include_context=True)
    items = []
    for error in errors[:MAX_FIELD_ERRORS]:
        code, message, limit, raised = _described(error)
        items.append(
            FieldError(pointer=_pointer(error["loc"], document, raised), code=code, message=message, limit=limit)
        )
    return _envelope(items, len(errors))


def parse_field_errors(exc: BaseException) -> FieldErrors:
    """A failure before the document exists is reported at the document root."""
    if isinstance(exc, ContractValueError):
        code, message, limit = _contract_error(exc)
    elif isinstance(exc, UnicodeDecodeError):
        code, message, limit = "invalid_encoding", FIXED_MESSAGES["invalid_encoding"], None
    elif isinstance(exc, JSONDecodeError):
        code, message, limit = "invalid_json", FIXED_MESSAGES["invalid_json"], None
    elif isinstance(exc, RecursionError):
        code, message, limit = "nesting_too_deep", FIXED_MESSAGES["nesting_too_deep"], None
    else:
        code, message, limit = "invalid_value", FIXED_MESSAGES["invalid_value"], None
    return _envelope([FieldError(pointer="", code=code, message=message, limit=limit)], 1)


def scenario_field_errors(index: int) -> FieldErrors:
    error = FieldError(
        pointer=f"/scenarios/{index}/assumptions", code="scenario_invalid", message=SCENARIO_INVALID, limit=None
    )
    return _envelope([error], 1)
