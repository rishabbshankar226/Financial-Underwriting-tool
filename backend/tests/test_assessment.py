import json
from dataclasses import replace
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import DEFAULT_POLICY
from app.main import app

ROOT = Path(__file__).resolve().parents[1]
client = TestClient(app)


@pytest.fixture
def payload():
    data = json.loads((ROOT / "fixtures/alpine.json").read_text())
    data.pop("overrides")
    data.update(schema_version="commercial-assessment-v1", assessment_as_of="2026-10-06",
                units={"currency": "USD", "monetary_unit": "dollars", "annual_rate_unit": "decimal_nominal"})
    for year, calendar_year in zip(data["years"], (2024, 2025)):
        year.update(period_start=f"{calendar_year}-01-01", period_end=f"{calendar_year}-12-31")
    data["working_capital"].update(period_start="2025-01-01", period_end="2025-12-31")
    data["proposed_loan"].update(rate_type="fixed", repayment_type="fully_amortizing", payment_frequency="monthly")
    return data


def assess(data):
    response = client.post("/commercial/assessment", json=data)
    assert response.status_code == 200, response.text
    return response.json()


def test_dated_alpine_has_pinned_results_and_legacy_decision(payload):
    result = assess(payload)
    facts = result["current_facts"]
    # Independent fixture constants, not another call to the production calculator.
    expected = {"ordinary_business_income": 423000, "ebitda": 630000,
                "proposed_annual_payment": 80960.998065328193, "debt_service": 200960.998065328193,
                "dscr": 3.1349366596756265, "fccr": 2.8004854415566264,
                "global_dscr": 2.9015509813043215, "uca_cash_flow": 385000}
    for name, value in expected.items():
        assert facts[name]["raw_value"] == pytest.approx(value, rel=1e-10, abs=1e-8)
    assert facts["k1_history"]["raw_value"] == "stable"
    assert result["decision"] == client.post("/commercial/decision", json=json.loads((ROOT / "fixtures/alpine.json").read_text())).json()
    assert result["selected_period"] == {"period_start": "2025-01-01", "period_end": "2025-12-31"}
    assert result["coverage_basis"] == "current_pro_forma"
    assert len(result["historical_spread"]) == 2


def test_factors_and_trace_share_actual_facts(payload):
    result = assess(payload)
    rows = {row["fact_id"]: row for row in result["calculation_trace"]}
    for factor in result["decision"]["factors"]:
        name = "uca_cash_flow" if factor["name"] == "uca_positive" else factor["name"]
        fact = result["current_facts"][name]
        assert factor["raw_value"] == fact["raw_value"]
        assert rows[fact["fact_id"]]["raw_value"] == fact["raw_value"]
    debt = rows[result["current_facts"]["debt_service"]["fact_id"]]
    assert [o["raw_value"] for o in debt["operands"]] == pytest.approx([62000, 58000, 80960.998065328193])
    assert debt["operands"][0]["reference"] == "/years/1/interest_expense"
    assert sum(o["raw_value"] for o in debt["operands"]) == debt["raw_value"]


@pytest.mark.parametrize("kind", ["single", "gap", "fiscal_change"])
def test_incomparable_history_is_insufficient(payload, kind):
    if kind == "single":
        payload["years"] = payload["years"][-1:]
    elif kind == "gap":
        payload["years"][0].update(period_start="2023-01-01", period_end="2023-12-31")
    else:
        payload["years"][0].update(period_start="2023-07-01", period_end="2024-06-30")
    result = assess(payload)
    assert result["current_facts"]["k1_history"]["raw_value"] == "insufficient_history"
    assert result["decision"]["outcome"] == "review"


def test_no_debt_and_no_guarantors_are_explicitly_unavailable(payload):
    payload["guarantors"] = []
    payload["existing_debt"] = {"cpltd_annual": 0, "operating_lease_annual": 0}
    payload["proposed_loan"]["amount"] = 0
    payload["years"][-1]["interest_expense"] = 0
    result = assess(payload)
    for name in ("dscr", "fccr", "global_dscr"):
        assert result["current_facts"][name]["raw_value"] is None
        assert result["current_facts"][name]["status"] == "not_applicable"
        factor = next(f for f in result["decision"]["factors"] if f["name"] == name)
        assert factor["passed"] is None
    assert result["decision"]["outcome"] == "review"
    assert "NaN" not in json.dumps(result) and "Infinity" not in json.dumps(result)


@pytest.mark.parametrize("path,value", [
    (("years", 0, "gross_receipts"), True),
    (("years", 0, "gross_receipts"), "3900000"),
    (("years", 0, "extra"), 0),
    (("units", "monetary_unit"), "thousands"),
    (("proposed_loan", "term_months"), 11),
    (("proposed_loan", "term_months"), 120.0),
    (("proposed_loan", "annual_rate"), 1.01),
    (("proposed_loan", "repayment_type"), "interest_only"),
    (("working_capital", "period_start"), "2024-01-01"),
    (("assessment_as_of",), "2025-12-30"),
])
def test_strict_contract_rejects_invalid_inputs(payload, path, value):
    target = payload
    for part in path[:-1]:
        target = target[part]
    target[path[-1]] = value
    response = client.post("/commercial/assessment", json=payload)
    assert response.status_code == 422, response.text


def test_missing_amount_is_not_defaulted(payload):
    del payload["years"][0]["section_179"]
    assert client.post("/commercial/assessment", json=payload).status_code == 422


def test_exact_body_limit_and_cors(payload):
    body = json.dumps(payload).encode()
    body += b" " * (1_000_000 - len(body))
    headers = {"content-type": "application/json", "origin": "http://localhost:5173"}
    assert client.post("/commercial/assessment", content=body, headers=headers).status_code == 200
    response = client.post("/commercial/assessment", content=body + b" ", headers=headers)
    assert response.status_code == 413
    assert response.headers["access-control-allow-origin"] == headers["origin"]


@pytest.mark.parametrize("body", [b'{"a":1,"a":2}', b'{"a":NaN}', b'{"a":1e999}', b'\xff', b'{'])
def test_raw_json_errors_are_422_with_cors(body):
    response = client.post("/commercial/assessment", content=body, headers={"origin": "http://localhost:5173"})
    assert response.status_code == 422
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_duplicate_supported_field_cannot_be_silently_discarded(payload):
    body = json.dumps(payload).replace('"amount": 500000.0', '"amount": 1, "amount": 500000.0')
    response = client.post("/commercial/assessment", content=body)
    assert response.status_code == 422
    assert "Duplicate JSON key" in response.json()["detail"]


@pytest.mark.parametrize("token", ["NaN", "Infinity", "-Infinity", "1e999", "-1e999"])
def test_nonfinite_token_guard_precedes_model_decoding(payload, token):
    body = json.dumps(payload).replace('"amount": 500000.0', '"amount": ' + token)
    response = client.post("/commercial/assessment", content=body)
    assert response.status_code == 422
    assert "Non-finite JSON" in response.json()["detail"]


def test_policy_and_normalized_fingerprint(payload):
    from app.assessment import assess_commercial
    from app.assessment_contracts import CommercialAssessmentRequest
    request = CommercialAssessmentRequest.model_validate_json(json.dumps(payload))
    first = assess_commercial(request)
    reordered = CommercialAssessmentRequest.model_validate_json(json.dumps(payload, sort_keys=True))
    assert first.fingerprint == assess_commercial(reordered).fingerprint
    policy = replace(DEFAULT_POLICY, version="test-policy", commercial_min_dscr=3.2)
    changed = assess_commercial(request, policy)
    assert changed.policy_snapshot.commercial_min_dscr == 3.2
    assert changed.decision.policy_version == "test-policy"
    assert first.fingerprint != changed.fingerprint
    payload["years"][-1]["gross_receipts"] += 1
    assert first.fingerprint != assess_commercial(CommercialAssessmentRequest.model_validate_json(json.dumps(payload))).fingerprint


def test_openapi_has_typed_assessment_request():
    schema = app.openapi()
    body = schema["paths"]["/commercial/assessment"]["post"]["requestBody"]
    ref = body["content"]["application/json"]["schema"]["$ref"]
    request = schema["components"]["schemas"][ref.rsplit("/", 1)[-1]]
    assert request["additionalProperties"] is False
    assert "assessment_as_of" in request["required"]


def test_history_period_selection_is_explicit(payload):
    result = assess(payload)
    assert result["k1_history_periods"] == [
        {"period_start": "2024-01-01", "period_end": "2024-12-31"},
        {"period_start": "2025-01-01", "period_end": "2025-12-31"},
    ]
    payload["years"][0].update(period_start="2023-01-01", period_end="2023-12-31")
    assert assess(payload)["k1_history_periods"] == result["k1_history_periods"][-1:]


@pytest.mark.parametrize("periods", [
    [("2023-07-01", "2024-06-30"), ("2024-07-01", "2025-06-30")],
    [("2023-03-01", "2024-02-29"), ("2024-03-01", "2025-02-28")],
])
def test_valid_fiscal_and_leap_periods_are_comparable(payload, periods):
    for row, (start, end) in zip(payload["years"], periods):
        row.update(period_start=start, period_end=end)
    payload["working_capital"].update(period_start=periods[-1][0], period_end=periods[-1][1])
    assert assess(payload)["current_facts"]["k1_history"]["raw_value"] == "stable"


@pytest.mark.parametrize("kind", ["duplicate", "overlap", "reverse", "partial", "week_calendar", "mid_month", "empty", "eleven"])
def test_invalid_period_histories_are_rejected(payload, kind):
    if kind == "duplicate":
        payload["years"][0].update(period_start="2025-01-01", period_end="2025-12-31")
    elif kind == "overlap":
        payload["years"][0].update(period_start="2024-07-01", period_end="2025-06-30")
    elif kind == "reverse":
        payload["years"].reverse()
    elif kind == "partial":
        payload["years"][0]["period_end"] = "2024-06-30"
    elif kind == "week_calendar":
        payload["years"][0]["period_end"] = "2024-12-29"
    elif kind == "mid_month":
        payload["years"][0].update(period_start="2024-01-02", period_end="2025-01-01")
    elif kind == "empty":
        payload["years"] = []
    else:
        original = payload["years"][-1]
        payload["years"] = [dict(original, period_start=f"{year}-01-01", period_end=f"{year}-12-31") for year in range(2015, 2026)]
    assert client.post("/commercial/assessment", json=payload).status_code == 422


def test_ten_periods_and_integer_money_are_supported(payload):
    original = payload["years"][-1]
    payload["years"] = [dict(original, period_start=f"{year}-01-01", period_end=f"{year}-12-31", gross_receipts=4200000) for year in range(2016, 2026)]
    assert len(assess(payload)["historical_spread"]) == 10


@pytest.mark.parametrize("node", [(), ("units",), ("existing_debt",), ("proposed_loan",), ("working_capital",), ("guarantors", 0)])
def test_nested_unknown_fields_are_rejected(payload, node):
    target = payload
    for part in node:
        target = target[part]
    target["unrecognized"] = 1
    assert client.post("/commercial/assessment", json=payload).status_code == 422


@pytest.mark.parametrize("node,key", [
    (("existing_debt",), "operating_lease_annual"),
    (("working_capital",), "ar_increase"),
    (("guarantors", 0), "wages"),
    (("guarantors", 0), "name"),
    ((), "guarantors"),
])
def test_nested_required_values_are_not_defaulted(payload, node, key):
    target = payload
    for part in node:
        target = target[part]
    del target[key]
    assert client.post("/commercial/assessment", json=payload).status_code == 422


@pytest.mark.parametrize("field,value", [
    ("amount", True), ("annual_rate", "10.5%"), ("term_months", True),
    ("term_months", 10**400), ("amount", 10**400),
    ("annual_rate", -0.1), ("rate_type", "floating"), ("payment_frequency", "annual"),
])
def test_invalid_loan_types_and_ranges_are_rejected(payload, field, value):
    payload["proposed_loan"][field] = value
    response = client.post("/commercial/assessment", json=payload)
    assert response.status_code == 422, response.text


@pytest.mark.parametrize("kind", ["coverage", "payment", "history"])
def test_unsupported_calculation_range_is_422(payload, kind):
    if kind == "coverage":
        payload["years"][-1].update(gross_receipts=1e308, cogs=-1e308)
    elif kind == "payment":
        payload["proposed_loan"].update(amount=1.7e308, annual_rate=1, term_months=12)
    else:
        for key in payload["years"][0]:
            if key not in ("period_start", "period_end"):
                payload["years"][0][key] = 0
        payload["years"][0].update(gross_receipts=1e-300, k1_distribution=1e308)
    assert client.post("/commercial/assessment", json=payload).status_code == 422


def test_overflowing_history_difference_is_outside_the_new_contract(payload):
    for index, year in enumerate(payload["years"]):
        for name in year:
            if name not in ("period_start", "period_end"):
                year[name] = 0
        year.update(gross_receipts=1, k1_distribution=1e308 if index == 0 else -1e308)
    assert client.post("/commercial/assessment", json=payload).status_code == 422


@pytest.mark.parametrize("rate", [0, 1e-16, 5e-324])
def test_zero_and_tiny_rates_converge_to_zero_rate_payment(payload, rate):
    payload["proposed_loan"]["annual_rate"] = rate
    assert assess(payload)["current_facts"]["proposed_annual_payment"]["raw_value"] == pytest.approx(50000, rel=1e-12)


def test_signed_working_capital_is_preserved(payload):
    payload["working_capital"].update(ar_increase=-100, inventory_increase=-200, ap_increase=-300, cash_taxes_paid=-50)
    assert assess(payload)["current_facts"]["uca_cash_flow"]["raw_value"] == 630050


@pytest.mark.parametrize("single", [False, True])
def test_nonpositive_obi_is_not_serialized_as_infinity(payload, single):
    payload["years"][-1]["gross_receipts"] = 0
    if single:
        payload["years"] = payload["years"][-1:]
    result = assess(payload)
    assert result["historical_spread"][-1]["k1_distribution_ratio"]["raw_value"] is None
    assert result["current_facts"]["k1_history"]["raw_value"] == ("insufficient_history" if single else "unstable")
    assert result["decision"]["outcome"] == "decline"


@pytest.mark.parametrize("metric", ["dscr", "fccr", "global_dscr"])
def test_coverage_boundaries_compare_raw_values(payload, metric):
    from app.assessment import assess_commercial
    from app.assessment_contracts import CommercialAssessmentRequest
    request = CommercialAssessmentRequest.model_validate_json(json.dumps(payload))
    raw = getattr(assess_commercial(request).current_facts, metric).raw_value
    between = (raw + round(raw, 4)) / 2
    policy = replace(DEFAULT_POLICY, **{f"commercial_min_{metric}": between, f"commercial_decline_{metric}": between})
    factor = next(f for f in assess_commercial(request, policy).decision.factors if f.name == metric)
    assert factor.passed is (raw >= between)
    assert factor.decline_triggered is (raw < between)
    exact = replace(DEFAULT_POLICY, **{f"commercial_min_{metric}": raw, f"commercial_decline_{metric}": raw})
    factor = next(f for f in assess_commercial(request, exact).decision.factors if f.name == metric)
    assert factor.passed is True and factor.decline_triggered is False


def test_positive_uca_can_display_zero_and_still_pass(payload):
    payload["working_capital"]["ar_increase"] = 524999.996
    result = assess(payload)
    factor = next(f for f in result["decision"]["factors"] if f["name"] == "uca_positive")
    assert factor["value"] == 0
    assert factor["raw_value"] > 0
    assert factor["passed"] is True


def test_fingerprint_is_stable_for_normalized_numeric_types_and_versions(payload, monkeypatch):
    from app import assessment
    from app.assessment_contracts import CommercialAssessmentRequest
    first = assessment.assess_commercial(CommercialAssessmentRequest.model_validate_json(json.dumps(payload)))
    payload["years"][-1]["gross_receipts"] = 4200000
    assert assessment.assess_commercial(CommercialAssessmentRequest.model_validate_json(json.dumps(payload))).fingerprint == first.fingerprint
    assert len(first.fingerprint.value) == 64
    monkeypatch.setattr(assessment, "CALCULATION_VERSION", "commercial-calculation-test")
    assert assessment.assess_commercial(CommercialAssessmentRequest.model_validate_json(json.dumps(payload))).fingerprint != first.fingerprint


def test_every_trace_operand_resolves_to_its_original_value(payload):
    result = assess(payload)
    rows = {row["fact_id"]: row for row in result["calculation_trace"]}
    for row in rows.values():
        assert row["definition_id"] and row["expression"]
        for operand in row["operands"]:
            if operand["reference_type"] == "fact":
                expected = rows[operand["reference"]]["raw_value"]
            else:
                expected = result if operand["reference_type"] == "policy" else result["normalized_input"]
                for part in operand["reference"].strip("/").split("/"):
                    expected = expected[int(part)] if isinstance(expected, list) else expected[part]
            assert operand["raw_value"] == expected


def test_multiple_guarantor_contributions_reconcile(payload):
    first = payload["guarantors"][0]
    first["ownership_percentage"] = .6
    payload["guarantors"].append(dict(first, name="Second Synthetic Owner", ownership_percentage=.4, wages=10000))
    result = assess(payload)
    facts = result["current_facts"]
    assert facts["global_business_ebitda"]["raw_value"] == 630000
    assert facts["global_outside_income"]["raw_value"] == 81000
    assert facts["global_personal_debt"]["raw_value"] == 79200
    contributions = result["guarantor_contributions"]
    assert contributions[0]["business_ebitda"]["raw_value"] == 378000
    assert contributions[1]["business_ebitda"]["raw_value"] == 252000


def test_aggregate_ownership_limit_is_enforced(payload):
    payload["guarantors"].append(dict(payload["guarantors"][0], name="Second Synthetic Owner"))
    response = client.post("/commercial/assessment", json=payload)
    assert response.status_code == 422
    assert "ownership" in response.text.lower()


def test_current_coverage_decline_survives_insufficient_history(payload):
    payload["years"] = payload["years"][-1:]
    payload["years"][-1]["gross_receipts"] -= 600000
    result = assess(payload)
    assert result["current_facts"]["k1_history"]["raw_value"] == "insufficient_history"
    assert result["decision"]["outcome"] == "decline"


@pytest.mark.parametrize("media_type", [None, "application/problem+json", "text/plain"])
def test_bounded_json_intake_is_independent_of_media_type(payload, media_type):
    headers = {} if media_type is None else {"content-type": media_type}
    assert client.post("/commercial/assessment", content=json.dumps(payload), headers=headers).status_code == 200
    assert client.post("/commercial/assessment", content=b"x" * 1_000_001, headers=headers).status_code == 413


@pytest.mark.parametrize("declared_length", ["1", "2000000"])
def test_valid_body_uses_actual_length_not_declared_length(payload, declared_length):
    assert client.post("/commercial/assessment", content=json.dumps(payload), headers={"content-length": declared_length}).status_code == 200


def test_shipped_dated_fixture_is_complete_and_matches_the_example(payload):
    shipped = json.loads((ROOT / "fixtures/alpine_dated.json").read_text())
    assert shipped == payload
    assert assess(shipped)["decision"]["outcome"] == "approve"


def test_legacy_intake_retains_defaults_unknown_fields_and_subannual_terms():
    legacy = json.loads((ROOT / "fixtures/alpine.json").read_text())
    legacy["years"][0]["period_start"] = "ignored legacy metadata"
    legacy["proposed_loan"]["term_months"] = 6
    del legacy["guarantors"][0]["wages"]
    assert client.post("/commercial/decision", json=legacy).status_code == 200


def test_legacy_decision_does_not_evaluate_unused_older_financials():
    legacy = json.loads((ROOT / "fixtures/alpine.json").read_text())
    original = client.post("/commercial/decision", json=legacy).json()
    legacy["years"].insert(0, dict(legacy["years"][0], gross_receipts=1e308, cogs=-1e308))
    assert client.post("/commercial/decision", json=legacy).json() == original


@pytest.mark.parametrize("path", ["/commercial/assessment", "/commercial/assessment/"])
@pytest.mark.parametrize("declared_length", [None, b"1", b"2000000"])
def test_streamed_body_limit_counts_actual_bytes_before_parsing(path, declared_length):
    import asyncio
    headers = [(b"origin", b"http://localhost:5173")]
    if declared_length is not None:
        headers.append((b"content-length", declared_length))
    chunks = [b"x" * 600000, b"y" * 400001, b"not consumed"]
    sent, received = [], []

    async def receive():
        if len(received) < len(chunks):
            received.append(len(chunks[len(received)]))
            return {"type": "http.request", "body": chunks[len(received) - 1], "more_body": True}
        return {"type": "http.disconnect"}

    async def send(message):
        sent.append(message)

    scope = {"type": "http", "asgi": {"version": "3.0", "spec_version": "2.4"},
             "http_version": "1.1", "method": "POST", "scheme": "http", "path": path,
             "raw_path": path.encode(), "query_string": b"", "headers": headers,
             "server": ("test", 80), "client": ("test", 1234), "root_path": ""}
    asyncio.run(app(scope, receive, send))
    start = next(message for message in sent if message["type"] == "http.response.start")
    assert start["status"] == 413
    assert received == [600000, 400001]
    assert (b"access-control-allow-origin", b"http://localhost:5173") in start["headers"]
