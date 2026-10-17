"""Credit analysis is derived from one assessment, never changes it, and agrees with its decision."""

import json
import random
import runpy
from copy import deepcopy
from decimal import Decimal, localcontext
from itertools import product
from pathlib import Path
from uuid import uuid4

import pytest
from app.analysis import analyze_commercial, outcome_conditions
from app.assessment import assess_commercial
from app.assessment_contracts import CommercialAssessmentRequest
from app.case_contracts import CaseCreate
from app.cases import CaseStore
from app.scenario_contracts import ScenarioPreviewCommand
from app.scenarios import preview_commercial_scenarios
from app.schemas import DecisionFactor
from financial_assertions import wire_decimal

ROOT = Path(__file__).resolve().parents[1]
BASE = json.loads((ROOT / "fixtures/alpine_dated_v2.json").read_text())
GATE = runpy.run_path(str(ROOT.parent / "gate/reference_calculator.py"))
TIGHT = Decimal("1e-24")


def payload(change=None):
    data = deepcopy(BASE)
    if change:
        change(data)
    return data


def request(change=None):
    return CommercialAssessmentRequest.model_validate_json(json.dumps(payload(change)))


def analyze(change=None):
    return analyze_commercial(request(change)).model_dump(mode="json")


def raw(metric):
    assert metric["status"] == "available", metric
    return wire_decimal(metric["raw_value"])


def close(got, expected, tolerance=TIGHT):
    return abs(got - Decimal(expected)) <= tolerance


def unavailable(metric, explanation):
    return metric["status"] == "not_applicable" and metric["raw_value"] is None and metric["explanation"] == explanation


def set_loan(**values):
    return lambda data: data["proposed_loan"].update(values)


# --- Period views -------------------------------------------------------------------------


def test_alpine_common_size_and_change_versus_prior_match_hand_values():
    periods = analyze()["periods"]
    latest = periods[1]
    assert [period["period_index"] for period in periods] == [0, 1]
    assert raw(latest["common_size"]["gross_receipts"]) == 1
    assert close(raw(latest["common_size"]["cogs"]), "0.654761904761904761904762")
    assert latest["common_size"]["cogs"]["reported_value"] == "0.6548"
    assert close(raw(latest["common_size"]["gross_profit"]), "0.345238095238095238095238")
    assert close(raw(latest["common_size"]["ordinary_business_income"]), "0.100714285714285714285714")
    assert raw(latest["common_size"]["ebitda"]) == Decimal("0.15")
    change = latest["change_vs_prior"]
    assert close(raw(change["gross_receipts"]), "0.076923076923076923076923")
    assert close(raw(change["ordinary_business_income"]), "0.084615384615384615384615")
    assert close(raw(change["ebitda"]), "0.149635036496350364963504")
    assert unavailable(change["section_179"], "Nonpositive prior-period amount")
    assert latest["prior_period"] == {"period_start": "2024-01-01", "period_end": "2024-12-31"}
    assert latest["prior_period_adjacent"] is True
    assert periods[0]["change_vs_prior"] is None and periods[0]["prior_period"] is None


def test_nonpositive_receipts_and_gaps_are_explicit():
    def zero_older_receipts(data):
        data["years"][0]["gross_receipts"] = "0"

    periods = analyze(zero_older_receipts)["periods"]
    assert unavailable(periods[0]["common_size"]["cogs"], "Nonpositive gross receipts")
    assert unavailable(periods[1]["change_vs_prior"]["gross_receipts"], "Nonpositive prior-period amount")

    def gap(data):
        data["years"][0].update(period_start="2023-01-01", period_end="2023-12-31")

    latest = analyze(gap)["periods"][1]
    assert latest["prior_period_adjacent"] is False
    assert close(raw(latest["change_vs_prior"]["gross_receipts"]), "0.076923076923076923076923")


# --- Debt capacity and breakevens --------------------------------------------------------


def test_alpine_debt_capacity_names_the_binding_fixed_charge_constraint():
    capacity = analyze()["debt_capacity"]
    payments = {row["constraint"]: raw(row["max_annual_payment"]) for row in capacity["constraints"]}
    assert payments == {"dscr": 384000, "fccr": 381000, "global_dscr": 398800}
    assert [row["approval_minimum"] for row in capacity["constraints"]] == ["1.25", "1.2", "1.25"]
    assert capacity["binding_constraint"] == "fccr"
    assert raw(capacity["max_annual_payment"]) == 381000
    assert raw(capacity["max_monthly_payment"]) == 31750
    assert close(raw(capacity["max_principal"]), "2352984.826672761045726790462363")
    assert capacity["max_principal"]["reported_value"] == "2352984.83"
    assert raw(capacity["requested_principal"]) == 500000
    assert close(raw(capacity["principal_headroom"]), "1852984.826672761045726790462363")
    assert capacity["has_capacity"] is True


def test_maximum_principal_carries_exactly_the_maximum_payment():
    capacity = analyze()["debt_capacity"]
    loan = BASE["proposed_loan"]
    # The independent 80-digit annuity accepts the full-precision principal the 34-digit API would reject.
    annual = GATE["amortized_annual_debt_service"](raw(capacity["max_principal"]), loan["annual_rate"], loan["term_months"])
    assert abs(annual - raw(capacity["max_annual_payment"])) <= Decimal("1e-60")


def test_alpine_breakevens_and_cushions_match_hand_values():
    breakevens = analyze()["breakevens"]
    rows = {(row["constraint"], row["threshold_kind"]): row for row in breakevens["rows"]}
    assert list(rows) == [
        ("dscr", "approval_minimum"),
        ("dscr", "decline_floor"),
        ("fccr", "approval_minimum"),
        ("fccr", "decline_floor"),
        ("global_dscr", "approval_minimum"),
        ("global_dscr", "decline_floor"),
    ]
    expected = {
        ("dscr", "approval_minimum"): "251201.247581660240952232316665",
        ("dscr", "decline_floor"): "200960.998065328192761785853332",
        ("fccr", "approval_minimum"): "269953.197678393831314143023999",
        ("fccr", "decline_floor"): "224960.998065328192761785853332",
        ("global_dscr", "approval_minimum"): "232701.247581660240952232316665",
        ("global_dscr", "decline_floor"): "172560.998065328192761785853332",
    }
    for key, value in expected.items():
        assert close(raw(rows[key]["ebitda_breakeven"]), value), key
    dscr = rows["dscr", "approval_minimum"]
    assert close(raw(dscr["ebitda_cushion"]), "0.601267860981491681028203")
    assert close(raw(dscr["revenue_cushion"]), "0.090190179147223752154230")
    assert close(raw(rows["fccr", "approval_minimum"]["revenue_cushion"]), "0.085725429124191944925204")
    assert close(raw(rows["fccr", "decline_floor"]["revenue_cushion"]), "0.096437857603493287437670")
    assert raw(breakevens["ownership_weight"]) == 1
    assert breakevens["binding_approval_constraint"] == "fccr"
    assert breakevens["binding_decline_constraint"] == "fccr"


def test_partial_ownership_makes_the_global_constraint_bind():
    def partial(data):
        data["guarantors"][0]["ownership_percentage"] = "0.6"

    result = analyze(partial)
    capacity = result["debt_capacity"]
    assert capacity["binding_constraint"] == "global_dscr"
    assert raw(capacity["max_annual_payment"]) == 197200
    assert close(raw(capacity["max_principal"]), "1217870.361731938263037593383669")
    rows = {(row["constraint"], row["threshold_kind"]): row for row in result["breakevens"]["rows"]}
    assert close(raw(rows["global_dscr", "approval_minimum"]["ebitda_breakeven"]), "387835.412636100401587053861109")
    assert close(raw(rows["global_dscr", "decline_floor"]["ebitda_breakeven"]), "287601.663442213654602976422220")
    assert raw(result["breakevens"]["ownership_weight"]) == Decimal("0.6")
    assert result["breakevens"]["binding_approval_constraint"] == "global_dscr"


def test_no_debt_service_leaves_coverage_breakevens_explicitly_unavailable():
    def no_service(data):
        data["years"][1]["interest_expense"] = "0"
        data["existing_debt"]["cpltd_annual"] = "0"
        data["proposed_loan"]["amount"] = "0"

    result = analyze(no_service)
    rows = {(row["constraint"], row["threshold_kind"]): row for row in result["breakevens"]["rows"]}
    for kind in ("approval_minimum", "decline_floor"):
        assert unavailable(rows["dscr", kind]["ebitda_breakeven"], "No debt service")
        assert unavailable(rows["dscr", kind]["ebitda_cushion"], "No debt service")
        assert rows["fccr", kind]["ebitda_breakeven"]["status"] == "available"
    payments = {row["constraint"]: raw(row["max_annual_payment"]) for row in result["debt_capacity"]["constraints"]}
    assert payments["dscr"] == 504000
    assert raw(result["debt_capacity"]["requested_principal"]) == 0
    assert result["amortization"]["status"] == "not_applicable"


def test_nonpositive_ebitda_has_no_capacity_and_no_cushion():
    def loss(data):
        data["years"][1]["cogs"] = "4200000"

    result = analyze(loss)
    capacity = result["debt_capacity"]
    assert raw(capacity["max_annual_payment"]) == 0 and raw(capacity["max_principal"]) == 0
    assert capacity["has_capacity"] is False
    assert all(raw(row["max_annual_payment"]) < 0 for row in capacity["constraints"])
    for row in result["breakevens"]["rows"]:
        assert unavailable(row["ebitda_cushion"], "Nonpositive EBITDA")


def test_zero_total_ownership_cannot_derive_a_global_breakeven():
    def no_ownership(data):
        data["guarantors"][0]["ownership_percentage"] = "0"

    result = analyze(no_ownership)
    rows = {(row["constraint"], row["threshold_kind"]): row for row in result["breakevens"]["rows"]}
    expected = "Global cash flow does not depend on business EBITDA when total ownership is zero"
    assert unavailable(rows["global_dscr", "approval_minimum"]["ebitda_breakeven"], expected)
    assert raw(result["breakevens"]["ownership_weight"]) == 0


def test_without_guarantors_full_business_ebitda_carries_global_coverage():
    result = analyze(lambda data: data.update(guarantors=[]))
    assert raw(result["breakevens"]["ownership_weight"]) == 1
    rows = {(row["constraint"], row["threshold_kind"]): row for row in result["breakevens"]["rows"]}
    assert close(raw(rows["global_dscr", "approval_minimum"]["ebitda_breakeven"]), "251201.247581660240952232316665")


# --- Amortization schedule ----------------------------------------------------------------


def schedule(change=None):
    return analyze(change)["amortization"]


def test_alpine_schedule_settles_the_balance_in_cents():
    result = schedule()
    assert result["status"] == "available" and result["explanation"] is None
    assert result["schedule_principal"] == "500000.00" and result["principal_rounding_difference"] == "0"
    assert result["scheduled_payment"] == "6746.75"
    assert result["final_payment"] == "6746.74" and result["final_payment_adjustment"] == "-0.01"
    assert result["total_interest"] == "309609.99" and result["total_payments"] == "809609.99"
    assert result["total_principal"] == "500000.00"
    assert result["payment_count"] == 120 and result["early_payoff"] is False
    assert len(result["annual_rows"]) == 10 and len(result["monthly_rows"]) == 120
    assert result["monthly_rows_truncated"] is False
    assert result["monthly_rows"][0] == {
        "month": 1, "payment": "6746.75", "interest": "4375.00", "principal": "2371.75", "ending_balance": "497628.25"
    }
    assert result["annual_rows"][-1]["ending_balance"] == "0.00"
    reconciliation = result["reconciliation"]
    assert reconciliation["scheduled_monthly_payment"] == "6746.75"
    assert reconciliation["first_loan_year_payments"] == "80961.00"
    assert close(wire_decimal(reconciliation["first_loan_year_difference"]), "0.001934671807238214146668")
    assert "twelve unrounded" in reconciliation["explanation"]


def test_seeded_schedules_satisfy_cent_invariants():
    generator = random.Random(20261016)
    for _ in range(25):
        amount = Decimal(generator.randint(1_000, 5_000_000_00)) / 100
        rate = Decimal(generator.randint(0, 2_500)) / 10_000
        term = generator.randint(12, 360)
        result = schedule(set_loan(amount=str(amount), annual_rate=str(rate), term_months=term))
        months = result["monthly_rows"]
        assert len(months) == result["payment_count"] <= term
        balance = Decimal(result["schedule_principal"])
        with localcontext() as context:
            context.prec = 96
            monthly_rate = rate / 12
            for row in months:
                interest = (balance * monthly_rate).quantize(Decimal("0.01"))
                assert Decimal(row["interest"]) == interest
                assert Decimal(row["principal"]) == Decimal(row["payment"]) - interest >= 0
                balance -= Decimal(row["principal"])
                assert Decimal(row["ending_balance"]) == balance >= 0
        assert balance == 0
        assert all(row["payment"] == result["scheduled_payment"] for row in months[:-1])
        assert sum(Decimal(row["principal"]) for row in months) == Decimal(result["schedule_principal"])
        assert sum(Decimal(row["interest"]) for row in months) == Decimal(result["total_interest"])
        assert sum(Decimal(row["payments"]) for row in result["annual_rows"]) == Decimal(result["total_payments"])
        assert sum(row["months"] for row in result["annual_rows"]) == result["payment_count"]


@pytest.mark.parametrize(
    "loan, expected",
    [
        (dict(amount="1200", annual_rate="0", term_months=12), dict(scheduled_payment="100.00", total_interest="0.00", payment_count=12, early_payoff=False)),
        (dict(amount="0.10", annual_rate="0", term_months=12), dict(scheduled_payment="0.01", final_payment="0.01", payment_count=10, early_payoff=True)),
        (dict(amount="0.05", annual_rate="0", term_months=12), dict(scheduled_payment="0.00", final_payment="0.05", final_payment_adjustment="0.05", payment_count=12)),
        (dict(amount="1000.005", annual_rate="0", term_months=12), dict(schedule_principal="1000.00", principal_rounding_difference="-0.005")),
    ],
)
def test_schedule_edges_are_explicit(loan, expected):
    result = schedule(set_loan(**loan))
    assert {key: result[key] for key in expected} == expected


def test_sub_cent_principal_has_no_schedule():
    result = schedule(set_loan(amount="0.004"))
    assert result["status"] == "not_applicable"
    assert result["explanation"] == "No proposed principal to amortize"
    assert result["annual_rows"] == [] and result["monthly_rows"] == [] and result["reconciliation"] is None


def test_longest_high_rate_term_is_a_bounded_balloon():
    result = schedule(set_loan(amount="1000000", annual_rate="1", term_months=12000))
    assert result["scheduled_payment"] == "83333.33"
    assert result["payment_count"] == 12000 and result["final_payment"] == "1083333.33"
    assert result["total_interest"] == "999999960.00"
    assert len(result["annual_rows"]) == 1000
    assert len(result["monthly_rows"]) == 360 and result["monthly_rows_truncated"] is True


# --- Sensitivity grid ---------------------------------------------------------------------


def cell(grid, revenue, bps):
    index = grid["revenue_changes"].index(revenue) * len(grid["rate_changes_bps"]) + grid["rate_changes_bps"].index(bps)
    found = grid["cells"][index]
    assert (found["revenue_change"], found["proposed_rate_change_bps"]) == (revenue, bps)
    return found


def test_grid_baseline_cell_reproduces_the_assessment():
    result = analyze()
    assessment = assess_commercial(request()).model_dump(mode="json")
    grid = result["sensitivity"]
    assert grid["status"] == "available"
    assert grid["revenue_changes"] == ["0", "-0.05", "-0.1", "-0.15", "-0.2"]
    assert grid["rate_changes_bps"] == ["0", "100", "200", "300"]
    assert len(grid["cells"]) == 20
    assert {"scenario-percentage-v2", "scenario-rate-bps-v2"} <= set(grid["definition_ids"])
    baseline = cell(grid, "0", "0")
    for name in ("dscr", "fccr", "global_dscr"):
        assert baseline[name]["raw_value"] == assessment["current_facts"][name]["raw_value"]
    assert baseline["outcome"] == assessment["decision"]["outcome"] == "approve"


def test_grid_cells_match_independent_stress_values():
    grid = analyze()["sensitivity"]
    assert close(raw(cell(grid, "-0.05", "0")["dscr"]), "2.089957773117084319683834")
    downside = cell(grid, "-0.1", "0")
    assert close(raw(downside["dscr"]), "1.044978886558542159841917")
    assert close(raw(downside["fccr"]), "0.933495147185542131540825")
    assert close(raw(downside["global_dscr"]), "1.155632052725789932488688")
    assert downside["outcome"] == "decline"
    assert close(raw(cell(grid, "-0.1", "200")["dscr"]), "1.010462126597435888635812")
    assert close(raw(cell(grid, "-0.2", "300")["dscr"]), "-0.993543982102041400945780")
    assert cell(grid, "-0.1", "200")["resulting_annual_rate"] == "0.125"


def test_grid_cells_equal_saved_scenario_previews(tmp_path):
    command = CaseCreate.model_validate_json(json.dumps({"input": BASE, "rationale": "Synthetic baseline"}))
    baseline = CaseStore(tmp_path / "cases.sqlite3").create(command, str(uuid4())).snapshot
    grid = analyze()["sensitivity"]
    for batch in (grid["cells"][:10], grid["cells"][10:]):
        scenarios = [
            {
                "scenario_key": f"cell_{index}",
                "name": "Grid cell",
                "rationale": "Sensitivity equivalence",
                "assumptions": {
                    "revenue_change": item["revenue_change"],
                    "cogs_change": "0",
                    "operating_expense_change": "0",
                    "proposed_rate_change_bps": item["proposed_rate_change_bps"],
                },
            }
            for index, item in enumerate(batch)
        ]
        preview_command = ScenarioPreviewCommand.model_validate_json(json.dumps(
            {"schema_version": "commercial-scenario-preview-v2", "baseline_run_id": baseline.run_id, "scenarios": scenarios}
        ))
        preview = preview_commercial_scenarios(baseline, preview_command).model_dump(mode="json")
        for item, projected in zip(batch, preview["scenarios"], strict=True):
            for name in ("dscr", "fccr", "global_dscr"):
                assert item[name]["raw_value"] == projected["current_facts"][name]["raw_value"]
            assert item["outcome"] == projected["decision"]["outcome"]


def test_negative_latest_targets_make_the_whole_grid_unavailable():
    grid = analyze(lambda data: data["years"][1].update(cogs="-1"))["sensitivity"]
    assert grid["status"] == "not_applicable" and grid["cells"] == []
    assert grid["explanation"] == (
        "Percentage stresses require nonnegative latest-period revenue, COGS and operating expense"
    )


def test_an_out_of_range_stressed_rate_marks_only_its_cells():
    grid = analyze(set_loan(annual_rate="0.99"))["sensitivity"]
    assert grid["status"] == "available"
    for revenue in grid["revenue_changes"]:
        assert cell(grid, revenue, "0")["status"] == "available"
        # 0.99 + 100 bps lands exactly on the supported 100% endpoint.
        assert cell(grid, revenue, "100")["resulting_annual_rate"] == "1"
        for bps in ("200", "300"):
            stressed = cell(grid, revenue, bps)
            assert stressed["status"] == "not_applicable" and stressed["outcome"] is None
            assert stressed["explanation"] == "The stressed proposed rate is outside 0% to 100%"
            assert stressed["resulting_annual_rate"] is None
            assert unavailable(stressed["dscr"], "The stressed proposed rate is outside 0% to 100%")


# --- Decision explanation -----------------------------------------------------------------


def test_alpine_explanation_states_why_it_approves():
    result = analyze()
    explanation = result["explanation"]
    assert explanation["outcome"] == "approve" and explanation["matched_rule"] == "approve_all_conditions"
    assert explanation["headline"].startswith("Approve")
    assert [condition["satisfied"] for condition in explanation["conditions"]] == [True, True, True, False]
    factors = {factor["name"]: factor for factor in explanation["factors"]}
    assert list(factors) == ["dscr", "fccr", "global_dscr", "k1_history", "uca_positive"]
    assert {factor["status"] for factor in factors.values()} == {"meets_approval"}
    assert close(raw(factors["dscr"]["approval_cushion"]), "1.884936659675626479525752")
    assert close(raw(factors["dscr"]["decline_cushion"]), "2.134936659675626479525752")
    assert raw(factors["uca_positive"]["approval_cushion"]) == 385000
    assert unavailable(factors["uca_positive"]["decline_cushion"], "No decline floor applies")
    assert unavailable(factors["k1_history"]["approval_cushion"], "Categorical factor")
    assert factors["dscr"]["label"] == "Business DSCR"
    assert "meets the approval minimum" in factors["dscr"]["summary"]
    score = explanation["score"]
    assert (score["passed_weight"], score["total_weight"], score["reported_score"]) == ("1", "1", "1.0000")
    assert "not a probability of default" in score["note"]


COVERAGE_STATES = {
    "pass": dict(passed=True, decline_triggered=False),
    "review": dict(passed=False, decline_triggered=False),
    "decline": dict(passed=False, decline_triggered=True),
    "unavailable": dict(passed=None, decline_triggered=None),
}


def factor(name, **state):
    return DecisionFactor.model_validate({
        "name": name, "value": "1", "weight": "0.2", "threshold": "1", "source": "test", **state,
    })


def literal_rule(coverage, uca_passed, k1_passed):
    if all(state["passed"] is True for state in coverage) and uca_passed:
        return "approve" if k1_passed else "review"
    if any(state["decline_triggered"] is True for state in coverage):
        return "decline"
    return "review"


@pytest.mark.parametrize("states", list(product(COVERAGE_STATES, repeat=3)))
@pytest.mark.parametrize("uca_passed", [True, False])
@pytest.mark.parametrize("k1", ["stable", "unstable", "insufficient_history"])
def test_outcome_conditions_restate_the_decision_rule(states, uca_passed, k1):
    coverage = [COVERAGE_STATES[state] for state in states]
    factors = [
        *(factor(name, **state) for name, state in zip(("dscr", "fccr", "global_dscr"), coverage, strict=True)),
        factor("k1_history", passed=k1 == "stable"),
        factor("uca_positive", passed=uca_passed),
    ]
    conditions, rule, outcome = outcome_conditions(factors)
    assert outcome == literal_rule(coverage, uca_passed, k1 == "stable")
    assert conditions["coverage_below_decline_floor"] == any(state["decline_triggered"] is True for state in coverage)
    assert (rule == "decline_coverage_floor") == (outcome == "decline")


def test_explanations_agree_with_seeded_decisions():
    generator = random.Random(20261016)

    def vary(data):
        latest = data["years"][1]
        latest["gross_receipts"] = str(generator.randint(2_000_000, 6_000_000))
        latest["cogs"] = str(generator.randint(1_000_000, 4_000_000))
        latest["k1_distribution"] = str(generator.randint(0, 600_000))
        data["years"][0]["k1_distribution"] = str(generator.randint(0, 600_000))
        data["proposed_loan"].update(
            amount=str(generator.choice([0, generator.randint(1, 3_000_000)])),
            annual_rate=str(Decimal(generator.randint(0, 2_000)) / 10_000),
            term_months=generator.randint(12, 240),
        )
        data["existing_debt"]["cpltd_annual"] = str(generator.choice([0, generator.randint(1, 200_000)]))
        data["guarantors"][0]["ownership_percentage"] = str(Decimal(generator.randint(0, 100)) / 100)
        data["working_capital"]["cash_taxes_paid"] = str(generator.randint(0, 900_000))

    for _ in range(120):
        snapshot = deepcopy(BASE)
        vary(snapshot)
        model = CommercialAssessmentRequest.model_validate_json(json.dumps(snapshot))
        decision = assess_commercial(model).decision
        explanation = analyze_commercial(model).explanation
        assert explanation.outcome == decision.outcome
        assert explanation.score.reported_score == decision.score
        for described, actual in zip(explanation.factors, decision.factors, strict=True):
            assert described.name == actual.name
            assert described.blocks_approval == (actual.passed is not True)
            assert described.triggers_decline == (actual.decline_triggered is True)


# --- Evidence and bounds ------------------------------------------------------------------


def pointer(document, reference):
    node = document
    for part in reference.lstrip("/").split("/"):
        node = node[int(part)] if isinstance(node, list) else node[part]
    return node


def test_every_analysis_operand_resolves_to_its_source_value():
    model = request()
    assessment = assess_commercial(model).model_dump(mode="json")
    result = analyze_commercial(model).model_dump(mode="json")
    facts = {row["fact_id"]: row for row in assessment["calculation_trace"] + result["calculation_trace"]}
    assert result["calculation_trace"] and all(row["fact_id"].startswith("analysis.") for row in result["calculation_trace"])
    for row in result["calculation_trace"]:
        for operand in row["operands"]:
            if operand["reference_type"] == "input":
                source = pointer(assessment["normalized_input"], operand["reference"])
            elif operand["reference_type"] == "policy":
                source = pointer(assessment, operand["reference"])
            else:
                source = facts[operand["reference"]]["raw_value"]
            assert Decimal(str(source)) == Decimal(str(operand["raw_value"])), (row["fact_id"], operand)


def test_analysis_is_deterministic_read_only_and_tied_to_its_assessment():
    model = request()
    first, second = analyze_commercial(model), analyze_commercial(model)
    assert first.model_dump(mode="json") == second.model_dump(mode="json")
    assert first.assessment_fingerprint == assess_commercial(model).fingerprint
    dumped = first.model_dump(mode="json")
    assert dumped["persisted"] is False and dumped["source"] == "stateless_request" and dumped["baseline"] is None
    assert dumped["policy_version"] == "prototype-2026-10-03"
    assert dumped["schema_version"] == "commercial-analysis-v1"


def test_worst_case_analysis_payload_stays_bounded():
    def largest(data):
        template = data["years"][1]
        data["years"] = [
            {**template, "period_start": f"{2016 + index}-01-01", "period_end": f"{2016 + index}-12-31"}
            for index in range(10)
        ]
        data["working_capital"].update(period_start="2025-01-01", period_end="2025-12-31")
        data["proposed_loan"].update(amount="1000000", annual_rate="1", term_months=12000)

    encoded = json.dumps(analyze(largest)).encode()
    assert len(encoded) < 2_000_000
