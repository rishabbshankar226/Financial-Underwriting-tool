"""Projected facts cross the public preview interface; observed evidence stays fixed."""
from copy import deepcopy
from dataclasses import replace
from decimal import Decimal, localcontext
from hashlib import sha256
import json
from pathlib import Path
from uuid import uuid4

import pytest

from app.assessment import assess_commercial
from app.assessment_contracts import CommercialAssessmentRequest
from app.case_contracts import CaseCreate
from app.cases import CaseStore, CaseStoreError
from app.config import DEFAULT_POLICY
from app.decision import decide_commercial
from app.schemas import CommercialRequest

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
ZERO = dict(revenue_change=0, cogs_change=0, operating_expense_change=0, proposed_rate_change_bps=0)


def saved_baseline(tmp_path, payload=None, policy=DEFAULT_POLICY):
    payload = payload or json.loads((FIXTURES / "alpine_dated.json").read_text())
    command = CaseCreate.model_validate_json(json.dumps({"input": payload, "rationale": "Synthetic baseline"}))
    return CaseStore(tmp_path / (str(uuid4()) + ".sqlite3"), policy_provider=lambda: policy).create(command, str(uuid4())).snapshot


@pytest.fixture(scope="module")
def baseline(tmp_path_factory):
    return saved_baseline(tmp_path_factory.mktemp("scenario-baseline"))


def scenario(key="downside", **shocks):
    return dict(scenario_key=key, name="Illustrative downside", rationale="Other assumptions held fixed",
                assumptions={**ZERO, **shocks})


def preview(baseline, *scenarios):
    from app.scenario_contracts import ScenarioPreviewCommand
    from app.scenarios import preview_commercial_scenarios
    command = ScenarioPreviewCommand.model_validate_json(json.dumps({
        "schema_version": "commercial-scenario-preview-v1", "baseline_run_id": baseline.run_id,
        "scenarios": list(scenarios) or [scenario()],
    }))
    return preview_commercial_scenarios(baseline, command).model_dump(mode="json")


def values(result):
    return {name: fact["raw_value"] for name, fact in result["current_facts"].items()}


def test_zero_shock_preserves_original_facts_decision_history_and_snapshot(baseline):
    before = baseline.model_dump(mode="json")
    result = preview(baseline)
    projected = result["scenarios"][0]
    assert values(projected) == {name: fact["raw_value"] for name, fact in baseline.assessment["current_facts"].items()}
    assert projected["decision"] == baseline.assessment["decision"]
    assert result["baseline"]["assessment"] == baseline.assessment
    assert result["baseline"]["run_id"] == baseline.run_id
    assert result["persisted"] is False
    assert projected["coverage_basis"] == "stressed_latest_period_current_pro_forma"
    assert baseline.model_dump(mode="json") == before
    assert projected["reason_changes"] == []
    assert all(not row["changed"] for row in projected["factor_changes"])


@pytest.mark.parametrize("shocks,obi,ebitda,uca", [
    ({"revenue_change": -.1}, 3000, 210000, -35000),
    ({"cogs_change": .1}, 148000, 355000, 110000),
    ({"operating_expense_change": .1}, 359000, 566000, 321000),
    ({"revenue_change": -.1, "cogs_change": .1, "operating_expense_change": .1}, -336000, -129000, -374000),
])
def test_independent_operating_examples_preserve_history(baseline, shocks, obi, ebitda, uca):
    projected = preview(baseline, scenario(**shocks))["scenarios"][0]
    got = values(projected)
    assert got["ordinary_business_income"] == pytest.approx(obi, abs=1e-8)
    assert got["ebitda"] == pytest.approx(ebitda, abs=1e-8)
    assert got["uca_cash_flow"] == pytest.approx(uca, abs=1e-8)
    assert got["k1_history"] == "stable"
    k1 = next(f for f in projected["decision"]["factors"] if f["name"] == "k1_history")
    assert k1 == next(f for f in baseline.assessment["decision"]["factors"] if f["name"] == "k1_history")
    if ebitda < 0:
        assert projected["decision"]["outcome"] == "decline"
    assert projected["projection_inputs"]["working_capital"] == baseline.normalized_input["working_capital"]
    assert projected["projection_inputs"]["guarantors"] == baseline.normalized_input["guarantors"]


def test_rate_shock_reconciles_with_independent_high_precision_amortization(baseline):
    projected = preview(baseline, scenario(proposed_rate_change_bps=200))["scenarios"][0]
    with localcontext() as context:
        context.prec = 60
        r = Decimal("0.125") / 12
        annual = Decimal(500000) * r / (1 - (1 + r) ** -120) * 12
        dscr = Decimal(630000) / (Decimal(120000) + annual)
    got = values(projected)
    assert projected["projection_inputs"]["proposed_loan"]["annual_rate"] == .125
    assert got["proposed_annual_payment"] == pytest.approx(float(annual), rel=1e-12, abs=1e-8)
    assert got["dscr"] == pytest.approx(float(dscr), rel=1e-12)
    assert got["proposed_annual_payment"] > baseline.assessment["current_facts"]["proposed_annual_payment"]["raw_value"]
    assert got["ordinary_business_income"] == 423000
    assert projected["projection_inputs"]["operating"]["interest_expense"] == 62000


def test_scenarios_are_independent_and_request_order_only_orders_results(baseline):
    a, b = scenario("a", revenue_change=-.1), scenario("b", revenue_change=-.2)
    forward, reverse = preview(baseline, a, b), preview(baseline, b, a)
    assert [r["scenario_key"] for r in forward["scenarios"]] == ["a", "b"]
    assert {r["scenario_key"]: r for r in forward["scenarios"]} == {r["scenario_key"]: r for r in reverse["scenarios"]}
    assert forward["scenarios"][1]["projection_inputs"]["operating"]["gross_receipts"] == 3360000
    assert preview(baseline, a, b) == forward
    assert forward["fingerprint"]["value"] != reverse["fingerprint"]["value"]


@pytest.mark.parametrize("kind", ["single", "gap", "fiscal", "unavailable"])
def test_stress_never_replaces_observed_history(tmp_path, kind):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    if kind == "single":
        data["years"] = data["years"][-1:]
    elif kind == "gap":
        data["years"][0].update(period_start="2023-01-01", period_end="2023-12-31")
    elif kind == "fiscal":
        data["years"][0].update(period_start="2023-07-01", period_end="2024-06-30")
    else:
        data["years"][0]["gross_receipts"] = 0
    base = saved_baseline(tmp_path, data)
    result = preview(base, scenario(revenue_change=-1))
    assert result["baseline"]["assessment"]["historical_spread"] == base.assessment["historical_spread"]
    projected = result["scenarios"][0]
    for name in ("k1_history", "k1_ratio_difference"):
        assert projected["current_facts"][name]["raw_value"] == base.assessment["current_facts"][name]["raw_value"]
    assert next(f for f in projected["decision"]["factors"] if f["name"] == "k1_history") == next(
        f for f in base.assessment["decision"]["factors"] if f["name"] == "k1_history")


def test_retained_policy_and_raw_headroom_control_results(tmp_path):
    policy = replace(DEFAULT_POLICY, version="retained", commercial_min_dscr=3.2, commercial_min_uca_cash_flow=385000)
    base = saved_baseline(tmp_path, policy=policy)
    result = preview(base)
    assert result["policy_snapshot"] == base.assessment["policy_snapshot"]
    projected = result["scenarios"][0]
    comparisons = {r["metric"]: r for r in projected["comparisons"]}
    dscr = comparisons["dscr"]
    assert dscr["delta"] == 0
    assert dscr["policy_headroom"]["projected_approval"] == pytest.approx(3.1349366596756265 - 3.2)
    uca = comparisons["uca_cash_flow"]
    assert uca["policy_headroom"]["comparison_operator"] == ">"
    assert uca["policy_headroom"]["projected_approval"] == 0
    assert next(f for f in projected["decision"]["factors"] if f["name"] == "uca_positive")["passed"] is False
    assert projected["decision"] == base.assessment["decision"]


def test_no_service_keeps_metrics_delta_and_headroom_unavailable(tmp_path):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    data["guarantors"] = []
    data["proposed_loan"]["amount"] = 0
    data["existing_debt"] = dict(cpltd_annual=0, operating_lease_annual=0)
    data["years"][-1]["interest_expense"] = 0
    result = preview(saved_baseline(tmp_path, data), scenario(revenue_change=-.1))
    for row in result["scenarios"][0]["comparisons"]:
        if row["metric"] in ("dscr", "fccr", "global_dscr"):
            assert row["baseline_value"] is row["projected_value"] is row["delta"] is None
            assert row["policy_headroom"]["projected_approval"] is None
            assert row["delta_explanation"]


@pytest.mark.parametrize("variant,expected", [
    ("alpine", "2e1362076a27277037b435f81248757756a675614d0edb2d0b66babbc304842d"),
    ("single", "3881a4df9c1d201da0b084e5af018e01ae4677fa89c8318ef79e107c5b52e738"),
    ("gap", "ed64045bb385a28cf97db8f01f48992957701d02957f575ab72c0b66216b787f"),
    ("no_debt", "84e8c657cdc36491eddf6bc5679c8ddef863b9ad4a651e686bacb772250fdfa6"),
])
def test_pre_change_dated_assessment_serialization_is_pinned(variant, expected):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    if variant == "single":
        data["years"] = data["years"][-1:]
    elif variant == "gap":
        data["years"][0].update(period_start="2023-01-01", period_end="2023-12-31")
    elif variant == "no_debt":
        data["guarantors"] = []
        data["existing_debt"] = dict(cpltd_annual=0, operating_lease_annual=0)
        data["proposed_loan"]["amount"] = 0
        data["years"][-1]["interest_expense"] = 0
    result = assess_commercial(CommercialAssessmentRequest.model_validate_json(json.dumps(data))).model_dump(mode="json")
    canonical = json.dumps(result, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)
    assert sha256(canonical.encode()).hexdigest() == expected


def test_pre_change_legacy_decision_serialization_is_pinned():
    result = decide_commercial(CommercialRequest.model_validate_json((FIXTURES / "alpine.json").read_text())).model_dump(mode="json")
    canonical = json.dumps(result, sort_keys=True, separators=(",", ":"))
    assert sha256(canonical.encode()).hexdigest() == "59cbb86ae4d029cacf58838b0dd350e7d73435fda62dec22d4e0049572a7cc03"


def pointer(document, reference):
    for part in reference.lstrip("/").split("/"):
        document = document[int(part)] if isinstance(document, list) else document[part.replace("~1", "/").replace("~0", "~")]
    return document


def test_trace_operands_and_comparison_identities_resolve_to_actual_evidence(baseline):
    result = preview(baseline, scenario(revenue_change=-.1, cogs_change=.1, proposed_rate_change_bps=200))
    projected = result["scenarios"][0]
    rows = {r["fact_id"]: r for r in projected["calculation_trace"]}
    assert len(rows) == len(projected["calculation_trace"])
    document = {**projected, "baseline": result["baseline"], "policy_snapshot": result["policy_snapshot"]}
    for row in rows.values():
        for operand in row["operands"]:
            reference = operand["reference"]
            if operand["reference_type"] == "fact":
                assert rows[reference]["raw_value"] == operand["raw_value"]
                assert rows[reference]["unit"] == operand["unit"]
            else:
                assert pointer(document, reference) == operand["raw_value"]
    for metric in projected["current_facts"].values():
        assert rows[metric["fact_id"]]["raw_value"] == metric["raw_value"]
    for row in projected["comparisons"]:
        assert rows[row["baseline_fact_id"]]["raw_value"] == row["baseline_value"]
        assert rows[row["projected_fact_id"]]["raw_value"] == row["projected_value"]
    for change in projected["factor_changes"]:
        assert rows[change["projected_fact_id"]]["raw_value"] == change["projected"]["raw_value"]
    obi = rows["projection.operating.ordinary_business_income"]
    assert obi["operands"][0]["reference"] == "projection.operating.gross_profit"
    assert all(o["reference"].startswith(("/projection_inputs/", "projection.")) for o in obi["operands"])
    k1 = rows["baseline.current.k1_history"]
    assert k1["operands"][0]["reference"] == "baseline.current.k1_ratio_difference"


def test_trimmed_text_at_the_exact_limits_is_accepted(baseline):
    item = scenario()
    item.update(name="  " + "n" * 120 + "  ", rationale="  " + "r" * 2000 + "  ")
    result = preview(baseline, item)["scenarios"][0]
    assert result["name"] == "n" * 120
    assert result["rationale"] == "r" * 2000


@pytest.mark.parametrize("kind", ["zero_principal", "zero_rate", "zero_targets", "fractional_bps", "full_reduction"])
def test_supported_projection_edges_have_explicit_results(tmp_path, kind):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    shocks = {}
    if kind == "zero_principal":
        data["proposed_loan"]["amount"] = 0
        shocks["proposed_rate_change_bps"] = 200
    elif kind == "zero_rate":
        data["proposed_loan"]["annual_rate"] = 0
    elif kind == "zero_targets":
        for name in ("gross_receipts", "cogs", "operating_expense_excl_dna_interest_comp"):
            data["years"][-1][name] = 0
        shocks = dict(revenue_change=1e308, cogs_change=1e308, operating_expense_change=1e308)
    elif kind == "fractional_bps":
        shocks["proposed_rate_change_bps"] = 1.5
    else:
        shocks["revenue_change"] = -1
    projected = preview(saved_baseline(tmp_path, data), scenario(**shocks))["scenarios"][0]
    got = values(projected)
    if kind == "zero_principal":
        assert got["proposed_monthly_payment"] == got["proposed_annual_payment"] == 0
        assert got["debt_service"] == 120000
    elif kind == "zero_rate":
        assert got["proposed_annual_payment"] == 50000
    elif kind == "zero_targets":
        assert all(projected["projection_inputs"]["operating"][name] == 0 for name in
                   ("gross_receipts", "cogs", "operating_expense_excl_dna_interest_comp"))
    elif kind == "fractional_bps":
        assert projected["projection_inputs"]["proposed_loan"]["annual_rate"] == pytest.approx(.10515, rel=1e-15)
    else:
        assert projected["projection_inputs"]["operating"]["gross_receipts"] == 0
        assert got["ebitda"] == -3570000


@pytest.mark.parametrize("field", ["gross_receipts", "cogs", "operating_expense_excl_dna_interest_comp"])
def test_signed_negative_target_remains_readable_but_cannot_be_stressed(tmp_path, field):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    data["years"][-1][field] = -1
    base = saved_baseline(tmp_path, data)
    with pytest.raises(CaseStoreError) as failure:
        preview(base)
    assert failure.value.status == 422 and failure.value.code == "scenario_baseline"
    assert base.assessment["normalized_input"]["years"][-1][field] == -1


@pytest.mark.parametrize("kind,code,status", [
    ("unsupported", "baseline_unsupported", 409), ("missing_version", "storage_integrity", 503),
    ("malformed", "storage_integrity", 503), ("input_mismatch", "storage_integrity", 503),
    ("raw_comparison_drift", "baseline_replay_mismatch", 409),
])
def test_unusable_baseline_never_falls_back_to_current_assessment(baseline, kind, code, status):
    base = baseline.model_copy(deep=True)
    if kind == "unsupported":
        base.assessment["calculation_version"] = "retired-definition"
    elif kind == "missing_version":
        del base.assessment["calculation_version"]
    elif kind == "malformed":
        del base.assessment["current_facts"]
    elif kind == "input_mismatch":
        base.normalized_input["borrower_name"] = "Different accepted input"
    else:
        base.assessment["decision"]["factors"][0]["raw_value"] += 1e-13
    with pytest.raises(CaseStoreError) as failure:
        preview(base)
    assert (failure.value.code, failure.value.status) == (code, status)


def test_replay_is_once_per_batch_and_unavailable_replay_cannot_preview(baseline):
    from app.scenario_contracts import ScenarioPreviewCommand
    from app.scenarios import preview_commercial_scenarios
    command = ScenarioPreviewCommand.model_validate_json(json.dumps({
        "schema_version": "commercial-scenario-preview-v1", "baseline_run_id": baseline.run_id,
        "scenarios": [scenario(str(i), revenue_change=-i / 100) for i in range(10)],
    }))
    policies = []
    def recorded(request, policy):
        policies.append(policy.version)
        return assess_commercial(request, policy)
    result = preview_commercial_scenarios(baseline, command, assessment_operation=recorded)
    assert len(result.scenarios) == 10
    assert policies == [baseline.assessment["policy_snapshot"]["version"]]
    def unavailable(request, policy):
        raise ValueError("Unsupported retained input")
    with pytest.raises(CaseStoreError) as failure:
        preview_commercial_scenarios(baseline, command, assessment_operation=unavailable)
    assert failure.value.code == "baseline_replay_unavailable" and failure.value.status == 409


@pytest.mark.parametrize("ratio", ["dscr", "fccr", "global_dscr"])
@pytest.mark.parametrize("boundary", ["approval_equal", "below_approval", "decline_equal", "below_decline"])
def test_raw_coverage_boundaries_cannot_be_hidden_by_display_rounding(tmp_path, baseline, ratio, boundary):
    raw = baseline.assessment["current_facts"][ratio]["raw_value"]
    change = {f"commercial_min_{ratio}": raw if boundary == "approval_equal" else raw + 1e-12}
    if boundary in ("decline_equal", "below_decline"):
        change[f"commercial_decline_{ratio}"] = raw
    policy = replace(DEFAULT_POLICY, **change)
    base = saved_baseline(tmp_path, policy=policy)
    projected = preview(base, scenario(revenue_change=-1e-12 if boundary == "below_decline" else 0))["scenarios"][0]
    factor = next(f for f in projected["decision"]["factors"] if f["name"] == ratio)
    assert factor["passed"] is (boundary == "approval_equal")
    assert factor["decline_triggered"] is (boundary == "below_decline")
    headroom = next(row["policy_headroom"] for row in projected["comparisons"] if row["metric"] == ratio)
    if boundary == "approval_equal":
        assert headroom["projected_approval"] == 0
    elif boundary == "decline_equal":
        assert headroom["projected_decline"] == 0
    elif boundary == "below_decline":
        assert headroom["projected_decline"] < 0
        assert projected["decision"]["outcome"] == "decline"
        assert factor["value"] == next(f["value"] for f in base.assessment["decision"]["factors"] if f["name"] == ratio)


@pytest.mark.parametrize("has_guarantor", [True, False])
def test_projected_global_cash_flow_reuses_ownership_and_business_only_fallback(tmp_path, has_guarantor):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    if has_guarantor:
        data["guarantors"][0]["ownership_percentage"] = .65
    else:
        data["guarantors"] = []
    got = values(preview(saved_baseline(tmp_path, data), scenario(revenue_change=-.1))["scenarios"][0])
    assert got["global_business_ebitda"] == (136500 if has_guarantor else 210000)
    assert got["global_outside_income"] == (68000 if has_guarantor else 0)
    assert got["global_personal_debt"] == (39600 if has_guarantor else 0)
    assert got["global_dscr"] == pytest.approx((204500 if has_guarantor else 210000) /
                                             (240560.9980653282 if has_guarantor else 200960.9980653282), rel=1e-12)


def test_comparison_overflow_rejects_even_when_projected_facts_are_finite(tmp_path):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    data["years"] = data["years"][-1:]
    data["years"][0].update(gross_receipts=6e307, cogs=0, operating_expense_excl_dna_interest_comp=1.2e308,
                           officer_compensation=0, depreciation=0, amortization=0, interest_expense=0,
                           section_179=0, k1_distribution=0)
    data["guarantors"] = []
    data["working_capital"].update(ar_increase=0, inventory_increase=0, ap_increase=0, cash_taxes_paid=0)
    data["existing_debt"].update(cpltd_annual=1e308, operating_lease_annual=0)
    data["proposed_loan"].update(amount=0, annual_rate=0)
    base = saved_baseline(tmp_path, data)
    assert base.assessment["current_facts"]["ebitda"]["raw_value"] == -6e307
    with pytest.raises(CaseStoreError) as failure:
        preview(base, scenario(revenue_change=1, operating_expense_change=-1))
    assert failure.value.status == 422 and failure.value.code == "scenario_invalid"


def test_headroom_overflow_rejects_even_when_facts_and_delta_are_finite(tmp_path):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    data["years"] = data["years"][-1:]
    data["years"][0].update(gross_receipts=0, cogs=0, operating_expense_excl_dna_interest_comp=1.7e308,
                           officer_compensation=0, depreciation=0, amortization=0, interest_expense=0,
                           section_179=0, k1_distribution=0)
    data["guarantors"] = []
    data["working_capital"].update(ar_increase=0, inventory_increase=0, ap_increase=0, cash_taxes_paid=0)
    data["existing_debt"].update(cpltd_annual=1, operating_lease_annual=0)
    data["proposed_loan"].update(amount=0, annual_rate=0)
    policy = replace(DEFAULT_POLICY, commercial_min_dscr=1.7e308)
    base = saved_baseline(tmp_path, data, policy)
    assert base.assessment["current_facts"]["dscr"]["raw_value"] == -1.7e308
    with pytest.raises(CaseStoreError) as failure:
        preview(base)
    assert failure.value.status == 422 and failure.value.code == "scenario_invalid"


@pytest.mark.parametrize("bps,rate", [(-1050, 0), (8950, 1)])
def test_rate_endpoints_are_supported_without_clamping(baseline, bps, rate):
    projected = preview(baseline, scenario(proposed_rate_change_bps=bps))["scenarios"][0]
    assert projected["projection_inputs"]["proposed_loan"]["annual_rate"] == rate
    assert projected["current_facts"]["proposed_annual_payment"]["raw_value"] > 0


@pytest.mark.parametrize("starting_revenue,shock", [(4_200_000, -.1), (3_780_000, 1 / 9)])
def test_outcome_factor_and_reason_differences_reconcile_with_both_decisions(tmp_path, starting_revenue, shock):
    data = json.loads((FIXTURES / "alpine_dated.json").read_text())
    data["years"][-1]["gross_receipts"] = starting_revenue
    base = saved_baseline(tmp_path, data)
    projected = preview(base, scenario(revenue_change=shock))["scenarios"][0]
    before, after = base.assessment["decision"], projected["decision"]
    old_reasons, new_reasons = ({r["code"]: r for r in decision["reasons"]} for decision in (before, after))
    expected = {code for code in old_reasons.keys() | new_reasons.keys() if old_reasons.get(code) != new_reasons.get(code)}
    assert {change["code"] for change in projected["reason_changes"]} == expected
    assert projected["reason_changes"]
    for change in projected["reason_changes"]:
        assert change["baseline"] == old_reasons.get(change["code"])
        assert change["projected"] == new_reasons.get(change["code"])
        assert change["change"] == ("added" if change["baseline"] is None else "removed" if change["projected"] is None else "changed")
    assert projected["outcome_change"] == {"baseline": before["outcome"], "projected": after["outcome"],
                                             "changed": before["outcome"] != after["outcome"]}
    for change in projected["factor_changes"]:
        assert change["changed"] == (change["baseline"] != change["projected"])


def test_fingerprint_covers_normalized_command_and_saved_baseline_identity(baseline, tmp_path):
    from app.scenario_contracts import SCENARIO_DEFINITION_VERSION, SCENARIO_SCHEMA_VERSION, SCENARIO_SERIALIZATION_VERSION
    item = scenario(revenue_change=-.1)
    result = preview(baseline, item)
    normalized = deepcopy(item)
    normalized["assumptions"] = {k: float(v) for k, v in normalized["assumptions"].items()}
    content = {
        "baseline_identity": dict(case_id=baseline.case_id, revision=baseline.revision, run_id=baseline.run_id),
        "payload_hash": baseline.payload_hash,
        "normalized_command": dict(schema_version=SCENARIO_SCHEMA_VERSION, baseline_run_id=baseline.run_id, scenarios=[normalized]),
        "policy_snapshot": baseline.assessment["policy_snapshot"],
        "versions": dict(schema=SCENARIO_SCHEMA_VERSION, calculation="commercial-calculation-v1",
                         definition=SCENARIO_DEFINITION_VERSION, serialization=SCENARIO_SERIALIZATION_VERSION),
    }
    encoded = json.dumps(content, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode()
    assert result["fingerprint"]["value"] == sha256(encoded).hexdigest()
    padded = {**item, "name": " " + item["name"] + " ", "rationale": " " + item["rationale"] + " "}
    assert preview(baseline, padded)["fingerprint"] == result["fingerprint"]
    assert preview(saved_baseline(tmp_path), item)["fingerprint"] != result["fingerprint"]
    assert preview(baseline, {**item, "rationale": "A different stated assumption"})["fingerprint"] != result["fingerprint"]
