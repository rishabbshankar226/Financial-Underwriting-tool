"""Bounded structured intake and deterministic, explicitly confirmed extraction."""

from __future__ import annotations

import csv
import io
import json
import re
from decimal import Decimal
from math import isfinite
from typing import NoReturn, cast

from pydantic import JsonValue

from .config import DEFAULT_POLICY, PolicyConfig
from .field_errors import ContractValueError
from .finance import ZERO, NumericInput, as_decimal, calculation, decimal_text, finite_result
from .json_values import JsonObject
from .schemas import ExtractionField, ExtractionResult

_MAX_JSON_DEPTH = 128
EXTRACTION_CONFIDENCE = Decimal("0.99")
ACCURACY_TOLERANCE = Decimal("0.01")


def _unique_json_object(pairs: list[tuple[str, JsonValue]]) -> JsonObject:
    out: JsonObject = {}
    for key, value in pairs:
        if key in out:
            raise ContractValueError(f"Duplicate JSON key: {key}", "duplicate_key")
        out[key] = value
    return out


def _reject_json_constant(value: str) -> NoReturn:
    raise ContractValueError(f"Non-finite JSON value: {value}", "non_finite_number")


def _finite_json_float(raw: str) -> float:
    # Retained v1 JSON must keep its original numeric representation and hashes.
    value = float(raw)
    if not isfinite(value) or value == 0 and Decimal(raw) != ZERO:
        raise ValueError("JSON number exceeds the supported finite range")
    return value


def _exact_json_number(raw: str) -> str:
    return decimal_text(as_decimal(raw))


def _validate_json_depth(payload: object) -> None:
    stack = [iter((payload,))]
    while stack:
        try:
            value = next(stack[-1])
        except StopIteration:
            stack.pop()
            continue
        if isinstance(value, dict):
            children = iter(value.values())
        elif isinstance(value, list):
            children = iter(value)
        else:
            continue
        if len(stack) > _MAX_JSON_DEPTH:
            raise ContractValueError("JSON nesting exceeds the supported depth", "nesting_too_deep")
        stack.append(children)


def parse_structured(payload: str, kind: str, *, exact_numbers: bool = False) -> JsonObject:
    if kind == "json":
        try:
            out: object = json.loads(
                payload,
                object_pairs_hook=_unique_json_object,
                parse_constant=_reject_json_constant,
                parse_float=_exact_json_number if exact_numbers else _finite_json_float,
            )
        except RecursionError as exc:
            raise ContractValueError("JSON nesting exceeds the supported depth", "nesting_too_deep") from exc
        if not isinstance(out, dict):
            raise ContractValueError("JSON root must be an object", "invalid_json")
        _validate_json_depth(out)
        return cast(JsonObject, out)
    if kind == "csv":
        try:
            rows = [row for row in csv.reader(io.StringIO(payload), strict=True) if row]
        except csv.Error as exc:
            raise ValueError("Malformed CSV input") from exc
        if len(rows) != 2:
            raise ValueError("CSV structured path expects a header and exactly one data row")
        headers = [header.strip() for header in rows[0]]
        if not all(headers) or len(set(headers)) != len(headers):
            raise ValueError("CSV headers must be nonblank and unique")
        if len(rows[1]) != len(headers):
            raise ValueError("CSV data row must match the header column count")
        return dict(zip(headers, rows[1], strict=True))
    raise ValueError("kind must be json or csv")


def extract_synthetic_text(text: str, confirmed_fields: set[str] | None = None) -> ExtractionResult:
    """Extract synthetic fixture fields; each needs explicit human confirmation."""
    confirmed_fields = confirmed_fields or set()
    fields = []
    number = r"(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.[0-9]+)?"
    pattern = re.compile(
        rf"^([A-Z0-9_]+)[ \t]*:[ \t]*(\$?-?{number}|-\$?{number}|\(\$?{number}\))[ \t\r]*$", re.MULTILINE
    )
    for match in pattern.finditer(text):
        name, raw = match.groups()
        key = name.lower()
        try:
            value = as_decimal(raw.replace(",", "").replace("$", "").strip("()"))
        except ValueError:
            continue
        if raw.startswith("("):
            value = value.copy_negate()
        fields.append(
            ExtractionField(
                name=key,
                value=value,
                confidence=EXTRACTION_CONFIDENCE,
                confirmed=key in confirmed_fields,
                source_line=match.group(0),
            )
        )
    return ExtractionResult(fields=fields)


def confirmed_payload(result: ExtractionResult, policy: PolicyConfig = DEFAULT_POLICY) -> dict[str, Decimal]:
    payload = {}
    names = set()
    for field in result.fields:
        if field.name in names:
            raise ValueError(f"Duplicate extracted field: {field.name}; resolve the source evidence first")
        names.add(field.name)
        if (
            field.value is None
            or field.confidence < policy.extraction_confidence_threshold
            or not field.confirmed
        ):
            continue
        payload[field.name] = as_decimal(field.value)
    return payload


@calculation
def extraction_accuracy(result: ExtractionResult, truth: dict[str, NumericInput]) -> Decimal:
    if not truth:
        raise ValueError("truth cannot be empty")
    names = set()
    for field in result.fields:
        if field.name in names:
            raise ValueError(f"Duplicate extracted field: {field.name}; resolve the source evidence first")
        names.add(field.name)
    got = {field.name: as_decimal(field.value) for field in result.fields if field.value is not None}
    matches = sum(
        1
        for key, value in truth.items()
        if key in got and abs(got[key] - as_decimal(value)) < ACCURACY_TOLERANCE
    )
    return finite_result(Decimal(str(matches)) / Decimal(str(len(truth))))
