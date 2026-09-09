from __future__ import annotations
import csv, io, json, re
from .config import DEFAULT_POLICY
from .schemas import ExtractionField, ExtractionResult


def parse_structured(payload: str, kind: str) -> dict:
    if kind=="json":
        out=json.loads(payload)
        if not isinstance(out,dict): raise ValueError("JSON root must be an object")
        return out
    if kind=="csv":
        rows=list(csv.DictReader(io.StringIO(payload)))
        if len(rows)!=1: raise ValueError("CSV structured path expects exactly one data row")
        return dict(rows[0])
    raise ValueError("kind must be json or csv")


def extract_synthetic_text(text: str, confirmed_fields: set[str] | None=None) -> ExtractionResult:
    """Deterministic fixture extraction prototype, not production OCR.

    A field is eligible to cross the arithmetic boundary only when it meets the configured
    confidence threshold AND a human confirmed it.
    """
    confirmed_fields=confirmed_fields or set(); fields=[]
    pattern=re.compile(r"^([A-Z0-9_]+)\s*:\s*\$?([0-9,.]+)\s*$",re.MULTILINE)
    for match in pattern.finditer(text):
        name,raw=match.groups(); key=name.lower()
        fields.append(ExtractionField(name=key,value=float(raw.replace(',','')),confidence=.99,confirmed=key in confirmed_fields,source_line=match.group(0)))
    return ExtractionResult(fields=fields)


def confirmed_payload(result: ExtractionResult) -> dict[str,float]:
    return {f.name:float(f.value) for f in result.fields if f.value is not None and f.confidence>=DEFAULT_POLICY.extraction_confidence_threshold and f.confirmed}


def extraction_accuracy(result: ExtractionResult, truth: dict[str,float]) -> float:
    if not truth: raise ValueError("truth cannot be empty")
    got={f.name:float(f.value) for f in result.fields if f.value is not None}
    return sum(1 for k,v in truth.items() if k in got and abs(got[k]-v)<.01)/len(truth)
