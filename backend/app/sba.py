"""Dated SBA screens use a pinned official source and never imply full eligibility."""

from __future__ import annotations

import re
from datetime import date
from decimal import Decimal
from hashlib import sha256
from pathlib import Path
from typing import Literal
from xml.etree import ElementTree
from zipfile import BadZipFile, ZipFile

from .config import DEFAULT_POLICY, PolicyConfig
from .core import _finite
from .finance import ZERO, calculation
from .ingestion import parse_structured
from .json_values import canonical_json, json_array
from .schemas import DISCLAIMER, FiniteModel, SBACase, SBASizeRow

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "sba_size_standards.json"
SOURCE_FILE = "sba-size-standards-2023-03-17.xlsx"
SOURCE_URL = "https://data.sba.gov/sites/default/files/distribution/SBA-GCBD-2014-08-001/sba-table-of-size-standards_effective-march-17-2023_v0.xlsx"
SOURCE_SHA256 = "1e0777f83f6cc34767b97957a8e617b951d347f560538687e6bdfef32209bd74"
_XML = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
_NUMERIC = re.compile(r"[0-9]+(?:\.[0-9]+)?")
_MAX_SOURCE_BYTES = 1_000_000


class _SizeSource(FiniteModel):
    schema_version: Literal["sba-size-source-v2"]
    source_url: str
    source_file: str
    source_sha256: str
    source_effective_date: date
    verified_through: date
    checked_on: date


def _official_rows(path: Path, source: _SizeSource) -> list[SBASizeRow]:
    data = path.read_bytes()
    if len(data) > _MAX_SOURCE_BYTES or sha256(data).hexdigest() != source.source_sha256:
        raise ValueError("Official SBA workbook content hash does not match the verified source")
    with ZipFile(path) as book:
        strings = [
            "".join(node.itertext())
            for node in ElementTree.fromstring(book.read("xl/sharedStrings.xml")).findall("s:si", _XML)
        ]
        sheet = ElementTree.fromstring(book.read("xl/worksheets/sheet2.xml"))
    records: dict[str, dict[str, object]] = {}
    exceptions: set[str] = set()
    subsector_note = ""
    for row in sheet.findall("s:sheetData/s:row", _XML):
        cells: dict[str, str] = {}
        for cell in row.findall("s:c", _XML):
            value = cell.find("s:v", _XML)
            raw = "" if value is None or value.text is None else value.text
            text = strings[int(raw)] if cell.get("t") == "s" else raw
            cells[re.sub(r"[0-9]", "", cell.get("r", ""))] = text.strip()
        code = cells.get("A", "")
        if code.startswith("Subsector "):
            subsector_note = cells.get("E", "")
            continue
        if cells.get("B", "").startswith("Sector "):
            subsector_note = ""
        exceptional = re.fullmatch(r"([0-9]{6}) \(Exception(?: [0-9]+)?\)", code)
        if exceptional:
            exceptions.add(exceptional.group(1))
            continue
        if re.fullmatch(r"[0-9]{6}", code) is None:
            continue
        if code in records:
            raise ValueError(f"Duplicate NAICS size-standard row: {code}")
        receipts, employees = cells.get("C", ""), cells.get("D", "")
        reason = cells.get("E", "") or subsector_note
        measure = "receipts_millions" if receipts else "employees"
        number = receipts or employees
        if not _NUMERIC.fullmatch(number) or bool(receipts) == bool(employees):
            reason = "Unsupported asset-based, mixed or nonnumeric measure"
        records[code] = dict(
            naics=code,
            measure="unsupported" if reason else measure,
            threshold=None if reason else number,
            source_effective_date=source.source_effective_date.isoformat(),
            source_verified_through=source.verified_through.isoformat(),
            source_url=source.source_url,
            source_sha256=source.source_sha256,
            source_row=int(row.attrib["r"]),
            description=cells.get("B", ""),
            unsupported_reason=f"Source footnote or measure requires manual review: {reason}"
            if reason
            else None,
        )
    for code in exceptions:
        if code not in records:
            raise ValueError("Official exception is missing its parent NAICS row")
        records[code].update(
            measure="unsupported",
            threshold=None,
            unsupported_reason="Source contains industry exceptions requiring a separate applicability review",
        )
    return [SBASizeRow.model_validate_json(canonical_json(record)) for record in records.values()]


def load_size_table(path: Path = DATA_FILE) -> list[SBASizeRow]:
    try:
        payload = parse_structured(path.read_text(), "json")
        if isinstance(payload.get("rows"), list):
            supplied_rows = json_array(payload["rows"])
            if any(isinstance(row, dict) and row.get("synthetic_test_only") is True for row in supplied_rows):
                raise ValueError("Official SBA table loader cannot accept synthetic test rows")
        source = _SizeSource.model_validate_json(canonical_json(payload))
        if (source.source_url, source.source_file, source.source_sha256) != (
            SOURCE_URL,
            SOURCE_FILE,
            SOURCE_SHA256,
        ):
            raise ValueError("SBA source identity differs from the verified workbook")
        if source.source_effective_date != date(2023, 3, 17):
            raise ValueError("Official source effective date does not match the verified workbook")
        if not source.source_effective_date <= source.verified_through <= source.checked_on:
            raise ValueError("Official source dates are inconsistent")
        rows = _official_rows(path.parent / source.source_file, source)
        if len(rows) != 978:
            raise ValueError("Official source row count differs from the reviewed workbook")
        _validate_size_rows(rows)
        return rows
    except (OSError, BadZipFile, ElementTree.ParseError, KeyError, IndexError) as exc:
        raise ValueError("Verified official SBA source is unavailable or malformed") from exc


def _validate_size_rows(rows: list[SBASizeRow]) -> None:
    seen: set[str] = set()
    for row in rows:
        if row.naics in seen:
            raise ValueError(f"Duplicate NAICS size-standard row: {row.naics}")
        seen.add(row.naics)


def _checked_case(case: SBACase) -> SBACase:
    # Copied/mutated model instances must cross the same boundary as HTTP input.
    data: dict[str, object] = case.model_dump(mode="python", warnings=False)
    return SBACase.model_validate(data)


def size_eligible(case: SBACase, rows: list[SBASizeRow]) -> tuple[bool, str]:
    case = _checked_case(case)
    _validate_size_rows(rows)
    row = next((r for r in rows if r.naics == case.naics), None)
    if row is None:
        raise ValueError(
            f"No current size-standard row is loaded for NAICS {case.naics}. Do not infer eligibility; load the dated SBA table first."
        )
    if case.assessment_as_of < row.source_effective_date or (
        row.source_verified_through is not None and case.assessment_as_of > row.source_verified_through
    ):
        raise ValueError("Assessment date is outside the verified size-standard source range")
    if row.measure == "unsupported" or row.threshold is None:
        raise ValueError(f"NAICS {row.naics} is unsupported: {row.unsupported_reason}")
    if row.measure == "receipts_millions":
        if not case.size_evidence.basis.startswith("receipts") or case.annual_receipts_millions is None:
            raise ValueError("Average receipts evidence is required for this NAICS row")
        return case.annual_receipts_millions <= row.threshold, f"average receipts <= {row.threshold}M"
    if not case.size_evidence.basis.startswith("employees") or case.employees is None:
        raise ValueError("Average employee evidence is required for this NAICS row")
    return case.employees <= row.threshold, f"ceiling of average employees <= {int(row.threshold)}"


@calculation
def credit_elsewhere(case: SBACase) -> dict[str, Decimal | bool | str | None]:
    case = _checked_case(case)
    if case.sop_version == "8":
        return {
            "applied": False,
            "passes": None,
            "reason": "A lender credit-elsewhere determination is required; this helper does not establish it.",
        }
    protected = _finite(case.retirement_allowance + case.college_allowance + case.medical_allowance)
    excess = _finite(max(ZERO, _finite(case.owner_liquid_resources - protected)))
    return {
        "applied": True,
        "passes": None,
        "excess_liquid_resources": excess,
        "resource_indicator_below_requested": excess < case.requested_loan,
        "reason": "Limited supplied owner-resource arithmetic; applicant, family, conventional credit and lender evidence remain unresolved.",
    }


def evaluate_sba(
    case: SBACase, rows: list[SBASizeRow], policy: PolicyConfig = DEFAULT_POLICY
) -> dict[str, object]:
    case = _checked_case(case)
    if case.assessment_as_of < policy.sba_sop_8_effective:
        raise ValueError("Assessment predates the supported SOP versions")
    expected = "8.1" if case.assessment_as_of >= policy.sba_sop_8_1_effective else "8"
    if case.sop_version != expected:
        raise ValueError("Selected SOP version does not apply on the assessment date")
    eligible, size_reason = size_eligible(case, rows)
    elsewhere = credit_elsewhere(case)
    floor = (
        policy.sba_global_dscr_floor_acquisition
        if case.transaction_type in {"acquisition", "buyout", "esop"}
        else policy.sba_global_dscr_floor_expansion
    )
    coverage = case.global_dscr >= floor
    row = next(row for row in rows if row.naics == case.naics)
    return {
        "schema_version": "sba-screen-result-v2",
        "borrower": case.borrower_name,
        "assessment_as_of": case.assessment_as_of.isoformat(),
        "sop_version": case.sop_version,
        "size_eligible": eligible,
        "size_reason": size_reason,
        "size_evidence": case.size_evidence.model_dump(mode="json"),
        "size_standard_source": {
            "effective_date": row.source_effective_date.isoformat(),
            "verified_through": row.source_verified_through.isoformat()
            if row.source_verified_through
            else None,
            "url": row.source_url,
            "sha256": row.source_sha256,
            "row": row.source_row,
            "synthetic_test_only": row.synthetic_test_only,
        },
        "policy_version": policy.version,
        "credit_elsewhere": elsewhere,
        "global_dscr": case.global_dscr,
        "configured_global_dscr_floor": floor,
        "coverage_pass": coverage,
        "outcome": "review_required" if eligible and coverage else "screen_failed",
        "eligibility_status": "incomplete",
        "unresolved_requirements": [
            "lender_credit_elsewhere_determination",
            "industry_selection_and_affiliation_review",
            "alternative_size_standards_and_program_eligibility",
            "approved_lender_credit_policy",
        ],
        "disclaimer": DISCLAIMER,
    }
