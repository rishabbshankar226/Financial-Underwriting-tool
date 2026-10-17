"""Contract rejections keep their original `detail` bytes and add field-mapped `errors`."""

import json
from copy import deepcopy
from pathlib import Path
from uuid import uuid4

import pytest
from api_client import TestClient
from app.main import app

ROOT = Path(__file__).resolve().parents[1]
BASE = json.loads((ROOT / "fixtures/alpine_dated_v2.json").read_text())
client = TestClient(app, raise_server_exceptions=False)


def variant(change):
    data = deepcopy(BASE)
    change(data)
    return json.dumps(data).encode()


def assign(*path, value):
    def change(data):
        node = data
        for key in path[:-1]:
            node = node[key]
        node[path[-1]] = value

    return change


def remove(*path):
    def change(data):
        node = data
        for key in path[:-1]:
            node = node[key]
        del node[path[-1]]

    return change


def reversed_years(data):
    data["years"].reverse()


def second_guarantor(data):
    data["guarantors"].append({**data["guarantors"][0], "name": "Second", "ownership_percentage": "0.5"})


def earlier_working_capital(data):
    data["working_capital"].update(period_start="2024-01-01", period_end="2024-12-31")


def offset_period(data):
    data["years"][0].update(period_start="2024-01-02", period_end="2025-01-01")


def assert_detail(response, golden):
    """The original body is a prefix: only a new trailing member may follow it."""
    assert response.status_code == 422, response.text
    prefix = b'{"detail":' + golden.encode()
    assert response.content.startswith(prefix), response.text
    assert response.content[len(prefix) : len(prefix) + 1] in (b"}", b",")


# Golden bodies recorded from the service before field-mapped errors existed.
ASSESSMENT_DETAIL = {
    "missing_annual_field": (
        variant(remove("years", 0, "section_179")),
        '[{"type":"missing","loc":["body","years",0,"section_179"],"msg":"Field required"}]',
    ),
    "grouped_amount": (
        variant(assign("years", 0, "gross_receipts", value="3,900,000")),
        '[{"type":"value_error","loc":["body","years",0,"gross_receipts"],'
        '"msg":"Value error, Financial values must be finite decimal values"}]',
    ),
    "boolean_amount": (
        variant(assign("years", 1, "cogs", value=True)),
        '[{"type":"value_error","loc":["body","years",1,"cogs"],'
        '"msg":"Value error, Financial values must be finite decimal values, not boolean"}]',
    ),
    "too_many_digits": (
        variant(assign("years", 1, "cogs", value="1" * 35)),
        '[{"type":"value_error","loc":["body","years",1,"cogs"],'
        '"msg":"Value error, Financial input exceeds 34 significant digits"}]',
    ),
    "out_of_range": (
        variant(assign("years", 1, "cogs", value="1e31")),
        '[{"type":"value_error","loc":["body","years",1,"cogs"],'
        '"msg":"Value error, Financial input exceeds the supported finite range [1e-30, 1e30]"}]',
    ),
    "negative_interest": (
        variant(assign("years", 1, "interest_expense", value="-1")),
        '[{"type":"greater_than_equal","loc":["body","years",1,"interest_expense"],'
        '"msg":"Input should be greater than or equal to 0"}]',
    ),
    "term_too_short": (
        variant(assign("proposed_loan", "term_months", value=11)),
        '[{"type":"greater_than_equal","loc":["body","proposed_loan","term_months"],'
        '"msg":"Input should be greater than or equal to 12"}]',
    ),
    "term_not_integer": (
        variant(assign("proposed_loan", "term_months", value="120")),
        '[{"type":"int_type","loc":["body","proposed_loan","term_months"],"msg":"Input should be a valid integer"}]',
    ),
    "rate_too_large": (
        variant(assign("proposed_loan", "annual_rate", value="1.5")),
        '[{"type":"less_than_equal","loc":["body","proposed_loan","annual_rate"],'
        '"msg":"Input should be less than or equal to 1"}]',
    ),
    "currency_choice": (
        variant(assign("units", "currency", value="EUR")),
        '[{"type":"literal_error","loc":["body","units","currency"],"msg":"Input should be \'USD\'"}]',
    ),
    "unknown_field": (
        variant(assign("years", 0, "revenue", value="1")),
        '[{"type":"extra_forbidden","loc":["body","years",0,"revenue"],"msg":"Extra inputs are not permitted"}]',
    ),
    "no_years": (
        variant(assign("years", value=[])),
        '[{"type":"too_short","loc":["body","years"],'
        '"msg":"List should have at least 1 item after validation, not 0"}]',
    ),
    "borrower_not_text": (
        variant(assign("borrower_name", value=7)),
        '[{"type":"string_type","loc":["body","borrower_name"],"msg":"Input should be a valid string"}]',
    ),
    "invalid_month": (
        variant(assign("assessment_as_of", value="2026-13-01")),
        '[{"type":"value_error","loc":["body","assessment_as_of"],"msg":"Value error, month must be in 1..12"}]',
    ),
    "non_iso_date": (
        variant(assign("assessment_as_of", value="10/06/2026")),
        '[{"type":"value_error","loc":["body","assessment_as_of"],'
        '"msg":"Value error, Invalid isoformat string: \'10/06/2026\'"}]',
    ),
    "period_start_not_first": (
        variant(offset_period),
        '[{"type":"value_error","loc":["body","years",0],'
        '"msg":"Value error, Annual periods must start on the first day of a month in a supported year"}]',
    ),
    "period_not_twelve_months": (
        variant(assign("years", 0, "period_end", value="2024-11-30")),
        '[{"type":"value_error","loc":["body","years",0],'
        '"msg":"Value error, Financial periods must contain twelve complete calendar months"}]',
    ),
    "period_order": (
        variant(reversed_years),
        '[{"type":"value_error","loc":["body"],'
        '"msg":"Value error, Financial periods must be oldest first, unique, and non-overlapping"}]',
    ),
    "period_after_as_of": (
        variant(assign("assessment_as_of", value="2025-12-30")),
        '[{"type":"value_error","loc":["body"],'
        '"msg":"Value error, Financial periods cannot end after assessment_as_of"}]',
    ),
    "working_capital_period": (
        variant(earlier_working_capital),
        '[{"type":"value_error","loc":["body"],'
        '"msg":"Value error, Working-capital period must match the latest financial period"}]',
    ),
    "ownership_total": (
        variant(second_guarantor),
        '[{"type":"value_error","loc":["body"],"msg":"Value error, Total guarantor ownership cannot exceed 100%"}]',
    ),
    "duplicate_key": (b'{"amount": 1, "amount": 2}', '"Duplicate JSON key: amount"'),
    "non_finite": (b'{"amount": NaN}', '"Non-finite JSON value: NaN"'),
    "invalid_json": (b"{", '"Expecting property name enclosed in double quotes: line 1 column 2 (char 1)"'),
    "json_root_array": (b"[]", '"JSON root must be an object"'),
    "invalid_utf8": (b"\xff", "\"'utf-8' codec can't decode byte 0xff in position 0: invalid start byte\""),
    "nesting": (b'{"extra":' + b"[" * 128 + b"0" + b"]" * 128 + b"}", '"JSON nesting exceeds the supported depth"'),
    "huge_exponent_token": (
        b'{"amount": 1e400}',
        '"Financial input exceeds the supported finite range [1e-30, 1e30]"',
    ),
}


@pytest.mark.parametrize("name", sorted(ASSESSMENT_DETAIL))
def test_assessment_rejection_keeps_original_detail_bytes(name):
    body, golden = ASSESSMENT_DETAIL[name]
    response = client.post("/commercial/assessment", content=body, headers={"Content-Type": "application/json"})
    assert_detail(response, golden)


@pytest.fixture
def store_client(tmp_path, monkeypatch):
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(tmp_path / "cases.sqlite3"))
    with TestClient(app, raise_server_exceptions=False) as instance:
        yield instance


@pytest.fixture
def saved(store_client):
    response = store_client.post(
        "/cases", json={"input": BASE, "rationale": "Initial"}, headers={"Idempotency-Key": str(uuid4())}
    )
    assert response.status_code == 201, response.text
    return {**response.json(), "etag": response.headers["etag"]}


def edit(store_client, saved, field_path, new_value, rationale="Analyst correction"):
    return store_client.post(
        f"/cases/{saved['case_id']}/revisions",
        json={"field_path": field_path, "new_value": new_value, "rationale": rationale},
        headers={"Idempotency-Key": str(uuid4()), "If-Match": saved["etag"]},
    )


SCENARIO = {
    "scenario_key": "a",
    "name": "A",
    "rationale": "Stress",
    "assumptions": {
        "revenue_change": "0",
        "cogs_change": "0",
        "operating_expense_change": "0",
        "proposed_rate_change_bps": "0",
    },
}


def preview(store_client, saved, scenarios):
    command = {
        "schema_version": "commercial-scenario-preview-v2",
        "baseline_run_id": saved["run_id"],
        "scenarios": scenarios,
    }
    return store_client.post(f"/cases/{saved['case_id']}/revisions/1/scenarios/preview", json=command)


def test_case_command_rejections_keep_original_detail_bytes(store_client, saved):
    blank = store_client.post(
        "/cases", json={"input": BASE, "rationale": "   "}, headers={"Idempotency-Key": str(uuid4())}
    )
    assert_detail(
        blank,
        '[{"type":"value_error","loc":["body","rationale"],"msg":"Value error, A nonblank rationale is required"}]',
    )
    nested = json.loads(variant(assign("years", 0, "gross_receipts", value="3,900,000")))
    invalid = store_client.post(
        "/cases", json={"input": nested, "rationale": "x"}, headers={"Idempotency-Key": str(uuid4())}
    )
    assert_detail(
        invalid,
        '[{"type":"value_error","loc":["body","input","years",0,"gross_receipts"],'
        '"msg":"Value error, Financial values must be finite decimal values"}]',
    )
    assert_detail(
        edit(store_client, saved, "/proposed_loan/term_months", "120.5"),
        '[{"type":"value_error","loc":["body"],"msg":"Value error, Loan term edits require a JSON integer"}]',
    )
    assert_detail(
        edit(store_client, saved, "/years/1/gross_receipts", "1", rationale="  "),
        '[{"type":"value_error","loc":["body","rationale"],"msg":"Value error, A nonblank rationale is required"}]',
    )
    assert_detail(
        edit(store_client, saved, "/guarantors/0/ownership_percentage", "1.5"),
        '{"code":"invalid_edit_value","message":"Edit violates the dated assessment contract"}',
    )


def test_scenario_rejections_keep_original_detail_bytes(store_client, saved):
    assert_detail(
        preview(store_client, saved, [SCENARIO, {**SCENARIO, "name": "B"}]),
        '[{"type":"value_error","loc":["body"],"msg":"Value error, Scenario keys must be unique within the request"}]',
    )
    huge = {**SCENARIO, "scenario_key": "b", "assumptions": {**SCENARIO["assumptions"], "revenue_change": "1e29"}}
    assert_detail(
        preview(store_client, saved, [SCENARIO, huge]),
        '{"code":"scenario_invalid","message":"Scenario 1 (b) exceeds the supported calculation contract"}',
    )


@pytest.mark.parametrize(
    "field_path, new_value, body",
    [
        (
            "/borrower_name",
            "1",
            b'{"detail":{"code":"invalid_edit_path","message":"Unsupported numeric input path"}}',
        ),
        (
            "/years/1/gross_receipts",
            "4200000",
            b'{"detail":{"code":"unchanged_edit","message":"Edit must change the selected input"}}',
        ),
    ],
)
def test_other_storage_rejections_have_no_field_errors(store_client, saved, field_path, new_value, body):
    response = edit(store_client, saved, field_path, new_value)
    assert response.status_code == 422
    assert response.content == body
