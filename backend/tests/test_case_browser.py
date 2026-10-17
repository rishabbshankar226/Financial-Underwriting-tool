"""Saved-case listings can be searched, filtered and re-sorted without a schema change."""

import base64
import json
import os
import sqlite3
from copy import deepcopy
from pathlib import Path
from uuid import uuid4

import pytest
from api_client import TestClient
from app.main import app

ROOT = Path(__file__).resolve().parents[1]
BASE = json.loads((ROOT / "fixtures/alpine_dated_v2.json").read_text())


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(tmp_path / "cases.sqlite3"))
    with TestClient(app, raise_server_exceptions=False) as instance:
        yield instance


def create(client, name, amount="500000"):
    data = deepcopy(BASE)
    data["borrower_name"] = name
    data["proposed_loan"]["amount"] = amount
    response = client.post(
        "/cases", json={"input": data, "rationale": "Listing example"}, headers={"Idempotency-Key": str(uuid4())}
    )
    assert response.status_code == 201, response.text
    return {**response.json(), "etag": response.headers["etag"]}


@pytest.fixture
def cases(client):
    # Created oldest first; outcomes follow from the proposed principal alone.
    return {
        "approve": create(client, "Alpine Fabrication"),
        "review": create(client, "Cedar Logistics", "2500000"),
        "decline": create(client, "Bristle 100% Supply_Co", "6000000"),
        "backslash": create(client, "Back\\slash Partners"),
    }


def listing(client, **params):
    response = client.get("/cases", params=params)
    assert response.status_code == 200, response.text
    return response.json()


def names(page):
    return [row["borrower_name"] for row in page["items"]]


def test_summary_rows_carry_outcome_coverage_amount_and_date(client, cases):
    page = listing(client)
    assert page["listing_version"] == "case-listing-v2"
    alpine = next(row for row in page["items"] if row["case_id"] == cases["approve"]["case_id"])
    assert {key: alpine[key] for key in ("definition_supported", "outcome", "dscr", "requested_amount", "assessment_as_of")} == {
        "definition_supported": True,
        "outcome": "approve",
        "dscr": "3.1349",
        "requested_amount": "500000",
        "assessment_as_of": "2026-10-06",
    }
    assert {row["borrower_name"]: row["outcome"] for row in page["items"]} == {
        "Alpine Fabrication": "approve",
        "Cedar Logistics": "review",
        "Bristle 100% Supply_Co": "decline",
        "Back\\slash Partners": "approve",
    }
    assert "assessment" not in alpine


def test_default_listing_order_and_v1_cursor_are_unchanged(client, cases):
    first = listing(client, limit=2)
    assert names(first) == ["Back\\slash Partners", "Bristle 100% Supply_Co"]
    decoded = json.loads(base64.urlsafe_b64decode(first["next_cursor"] + "=" * (-len(first["next_cursor"]) % 4)))
    assert set(decoded) == {"kind", "version", "created_at", "case_id"} and decoded["version"] == 1
    assert names(listing(client, limit=2, after=first["next_cursor"])) == ["Cedar Logistics", "Alpine Fabrication"]


@pytest.mark.parametrize(
    "q, expected",
    [
        ("alpine", ["Alpine Fabrication"]),
        ("  LOGISTICS ", ["Cedar Logistics"]),
        ("100%", ["Bristle 100% Supply_Co"]),
        ("y_c", ["Bristle 100% Supply_Co"]),
        ("\\", ["Back\\slash Partners"]),
        ("%", ["Bristle 100% Supply_Co"]),
        ("_", ["Bristle 100% Supply_Co"]),
        ("zz-no-match", []),
    ],
)
def test_search_matches_literal_borrower_text(client, cases, q, expected):
    assert names(listing(client, q=q)) == expected


def test_outcome_filter_and_combined_search(client, cases):
    assert names(listing(client, outcome="decline")) == ["Bristle 100% Supply_Co"]
    assert names(listing(client, outcome="approve")) == ["Back\\slash Partners", "Alpine Fabrication"]
    assert names(listing(client, outcome="approve", q="alp")) == ["Alpine Fabrication"]


def test_updated_sort_moves_a_revised_case_to_the_top(client, cases):
    alpine = cases["approve"]
    response = client.post(
        f"/cases/{alpine['case_id']}/revisions",
        json={"field_path": "/years/1/cogs", "new_value": "2760000", "rationale": "Corrected COGS"},
        headers={"Idempotency-Key": str(uuid4()), "If-Match": alpine["etag"]},
    )
    assert response.status_code == 201, response.text
    assert names(listing(client, sort="updated"))[0] == "Alpine Fabrication"
    assert names(listing(client, sort="created"))[-1] == "Alpine Fabrication"
    revised = next(row for row in listing(client, sort="updated")["items"] if row["case_id"] == alpine["case_id"])
    assert revised["revision"] == 2


def test_filtered_pages_use_a_cursor_bound_to_their_query(client, cases):
    first = listing(client, q="a", sort="updated", limit=2)
    decoded = json.loads(base64.urlsafe_b64decode(first["next_cursor"] + "=" * (-len(first["next_cursor"]) % 4)))
    assert set(decoded) == {"kind", "version", "sort", "filters", "key", "case_id"} and decoded["version"] == 2
    assert len(first["next_cursor"]) <= 512
    second = listing(client, q="a", sort="updated", limit=2, after=first["next_cursor"])
    seen = names(first) + names(second)
    assert sorted(seen) == sorted(names(listing(client, q="a", sort="updated")))
    for params in ({"q": "b", "sort": "updated"}, {"q": "a"}, {}):
        response = client.get("/cases", params={**params, "after": first["next_cursor"]})
        assert response.status_code == 400 and response.json()["detail"]["code"] == "invalid_cursor"
    legacy = listing(client, limit=1)["next_cursor"]
    response = client.get("/cases", params={"q": "a", "after": legacy})
    assert response.status_code == 400 and response.json()["detail"]["code"] == "invalid_cursor"
    tampered = base64.urlsafe_b64encode(
        json.dumps({**decoded, "filters": "0" * 64}, sort_keys=True, separators=(",", ":")).encode()
    ).decode().rstrip("=")
    response = client.get("/cases", params={"q": "a", "sort": "updated", "after": tampered})
    assert response.status_code == 400 and response.json()["detail"]["code"] == "invalid_cursor"


@pytest.mark.parametrize(
    "query",
    [
        "q=",
        "q=%20%20",
        "q=" + "a" * 121,
        "q=tab%09name",
        "outcome=maybe",
        "outcome=",
        "sort=name",
        "q=a&q=b",
        "outcome=approve&outcome=review",
        "sort=created&sort=updated",
    ],
)
def test_invalid_listing_queries_are_rejected(client, cases, query):
    response = client.get("/cases?" + query)
    assert response.status_code == 400, response.text
    assert response.json()["detail"]["code"] == "invalid_query"


def test_archived_v1_cases_list_without_unsupported_summaries(client, tmp_path, monkeypatch):
    fixture = ROOT / "tests/fixtures/schema_v1"
    database = tmp_path / "v1.sqlite3"
    with sqlite3.connect(database) as connection:
        connection.executescript((fixture / "store.sql").read_text())
    monkeypatch.setenv("SPREADLINE_CASE_DB", str(database))
    before = database.read_bytes()
    rows = listing(client)["items"]
    assert rows and all(
        (row["definition_supported"], row["outcome"], row["dscr"], row["requested_amount"], row["assessment_as_of"])
        == (False, None, None, None, None)
        for row in rows
    )
    for outcome in ("approve", "review", "decline"):
        assert listing(client, outcome=outcome)["items"] == []
    assert database.read_bytes() == before


def test_a_corrupted_supported_summary_fails_closed(client, cases):
    # Simulate an offline edit of a supported run; restore the immutability guard afterward.
    with sqlite3.connect(os.environ["SPREADLINE_CASE_DB"]) as connection:
        trigger = connection.execute("SELECT sql FROM sqlite_master WHERE name='runs_immutable_update'").fetchone()[0]
        connection.execute("DROP TRIGGER runs_immutable_update")
        connection.execute(
            "UPDATE runs SET assessment_json=json_set(assessment_json,'$.current_facts.dscr.reported_value',3.1349)"
            " WHERE run_id=?",
            (cases["approve"]["run_id"],),
        )
        connection.execute(trigger)
    response = client.get("/cases")
    assert response.status_code == 503
    assert response.json()["detail"] == {
        "code": "storage_integrity",
        "message": "Stored case summary failed verification",
    }
