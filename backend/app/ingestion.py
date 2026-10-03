from __future__ import annotations
import csv, io, json, re
from math import isfinite
from .config import DEFAULT_POLICY, PolicyConfig
from .schemas import ExtractionField, ExtractionResult


def _unique_json_object(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"Duplicate JSON key: {key}")
        out[key] = value
    return out


def _reject_json_constant(value: str):
    raise ValueError(f"Non-finite JSON value: {value}")


def _finite_json_float(raw: str) -> float:
    value = float(raw)
    if not isfinite(value):
        raise ValueError("Non-finite JSON number exceeds the supported calculation range")
    return value


def parse_structured(payload: str, kind: str) -> dict:
    if kind=="json":
        out=json.loads(payload, object_pairs_hook=_unique_json_object,
                       parse_constant=_reject_json_constant, parse_float=_finite_json_float)
        if not isinstance(out,dict): raise ValueError("JSON root must be an object")
        return out
    if kind=="csv":
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
        return dict(zip(headers, rows[1]))
    raise ValueError("kind must be json or csv")


def extract_synthetic_text(text: str, confirmed_fields: set[str] | None=None) -> ExtractionResult:
    """Deterministic fixture extraction prototype, not production OCR.

    A field is eligible to cross the arithmetic boundary only when it meets the configured
    confidence threshold AND a human confirmed it.
    """
    confirmed_fields=confirmed_fields or set(); fields=[]
    number = r"(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.[0-9]+)?"
    pattern = re.compile(rf"^([A-Z0-9_]+)[ \t]*:[ \t]*(\$?-?{number}|-\$?{number}|\(\$?{number}\))[ \t\r]*$", re.MULTILINE)
    for match in pattern.finditer(text):
        name, raw = match.groups()
        key = name.lower()
        value = float(raw.replace(',', '').replace('$', '').strip('()'))
        if raw.startswith('('): value = -value
        if not isfinite(value): continue
        fields.append(ExtractionField(name=key, value=value, confidence=.99,
                                      confirmed=key in confirmed_fields, source_line=match.group(0)))
    return ExtractionResult(fields=fields)


def confirmed_payload(result: ExtractionResult, policy: PolicyConfig = DEFAULT_POLICY) -> dict[str,float]:
    payload = {}
    names = set()
    for field in result.fields:
        if field.name in names:
            raise ValueError(f"Duplicate extracted field: {field.name}; resolve the source evidence first")
        names.add(field.name)
        if field.value is None or field.confidence < policy.extraction_confidence_threshold or not field.confirmed:
            continue
        value = float(field.value)
        if not isfinite(value):
            raise ValueError(f"Confirmed field {field.name} must be finite")
        payload[field.name] = value
    return payload


def extraction_accuracy(result: ExtractionResult, truth: dict[str,float]) -> float:
    if not truth: raise ValueError("truth cannot be empty")
    got={f.name:float(f.value) for f in result.fields if f.value is not None}
    return sum(1 for k,v in truth.items() if k in got and abs(got[k]-v)<.01)/len(truth)
