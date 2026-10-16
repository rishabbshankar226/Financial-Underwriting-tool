"""Canonical JSON and checked shapes shared by transport and retained evidence."""

from __future__ import annotations

import json
from datetime import date
from decimal import Decimal
from typing import cast

from pydantic import JsonValue

from .finance import decimal_text

JsonObject = dict[str, JsonValue]


def json_object(value: object) -> JsonObject:
    if not isinstance(value, dict) or any(not isinstance(key, str) for key in value):
        raise ValueError("Expected a JSON object")
    return cast(JsonObject, value)


def json_array(value: object) -> list[JsonValue]:
    if not isinstance(value, list):
        raise ValueError("Expected a JSON array")
    return cast(list[JsonValue], value)


def json_string(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("Expected a JSON string")
    return value


def json_integer(value: object) -> int:
    if type(value) is not int:
        raise ValueError("Expected a JSON integer")
    return value


def _encode(value: object) -> str:
    if isinstance(value, Decimal):
        return decimal_text(value)
    if isinstance(value, date):
        return value.isoformat()
    raise TypeError("Unsupported JSON value")


def canonical_json(value: object) -> str:
    return json.dumps(
        value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False, default=_encode
    )
