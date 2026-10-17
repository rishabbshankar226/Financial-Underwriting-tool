import json
import runpy
from decimal import Decimal
from pathlib import Path

from app.core import (
    amortized_annual_debt_service,
    consumer_dti,
    dscr,
    ebitda,
    fccr,
    global_dscr,
    k1_history_flag,
    ordinary_business_income,
    uca_cash_flow,
)
from fixtures import (
    ALPINE_2024,
    ALPINE_2025,
    ALPINE_EXISTING,
    ALPINE_G,
    ALPINE_LOAN,
    ALPINE_WC,
    BRISTLE,
    BRISTLE_EXISTING,
    BRISTLE_G,
    BRISTLE_LOAN,
    BRISTLE_WC,
)


def test_alpine_reference_values():
    assert ordinary_business_income(ALPINE_2025) == 423000
    assert ebitda(ALPINE_2025) == 630000
    assert abs(amortized_annual_debt_service(ALPINE_LOAN.amount,ALPINE_LOAN.annual_rate,ALPINE_LOAN.term_months)-Decimal("80961.0")) <= 1
    assert abs(dscr(ALPINE_2025,ALPINE_EXISTING,ALPINE_LOAN)-Decimal("3.135")) <= Decimal(".005")
    assert abs(fccr(ALPINE_2025,ALPINE_EXISTING,ALPINE_LOAN)-Decimal("2.800")) <= Decimal(".005")
    assert abs(global_dscr(ALPINE_2025,ALPINE_EXISTING,ALPINE_LOAN,[ALPINE_G])-Decimal("2.902")) <= Decimal(".005")
    assert uca_cash_flow(ALPINE_2025,ALPINE_WC) == 385000
    assert k1_history_flag([ALPINE_2024,ALPINE_2025]) == "stable"

def test_bristlecone_reference_values():
    assert ordinary_business_income(BRISTLE) == 17000
    assert ebitda(BRISTLE) == 110000
    assert abs(amortized_annual_debt_service(BRISTLE_LOAN.amount,BRISTLE_LOAN.annual_rate,BRISTLE_LOAN.term_months)-Decimal("59050.09")) <= 1
    assert abs(dscr(BRISTLE,BRISTLE_EXISTING,BRISTLE_LOAN)-Decimal(".723")) <= Decimal(".005")
    assert abs(fccr(BRISTLE,BRISTLE_EXISTING,BRISTLE_LOAN)-Decimal(".647")) <= Decimal(".005")
    assert abs(global_dscr(BRISTLE,BRISTLE_EXISTING,BRISTLE_LOAN,[BRISTLE_G])-Decimal(".816")) <= Decimal(".005")
    assert uca_cash_flow(BRISTLE,BRISTLE_WC) == 88000
    assert k1_history_flag([BRISTLE]) == "insufficient_history"

def test_consumer_boundary():
    front, back = consumer_dti(9000, 2200, 470, 1200)
    assert abs(front-Decimal(".2967")) <= Decimal(".0005")
    assert abs(back-Decimal(".4300")) <= Decimal(".0005")


def test_engine_matches_reviewed_independent_gate_reference_at_24_decimal_places():
    reference = runpy.run_path(str(Path(__file__).resolve().parents[2] / "gate/reference_calculator.py"))
    expected = reference["EXPECTED"]
    assert isinstance(expected, dict)
    front, back = consumer_dti(9000, 2200, 470, 1200)
    actual = {
        "alpine_obi_2025": ordinary_business_income(ALPINE_2025),
        "alpine_obi_2024": ordinary_business_income(ALPINE_2024),
        "alpine_ebitda_2025": ebitda(ALPINE_2025),
        "alpine_ebitda_2024": ebitda(ALPINE_2024),
        "alpine_proposed_debt_service": amortized_annual_debt_service(ALPINE_LOAN.amount, ALPINE_LOAN.annual_rate, ALPINE_LOAN.term_months),
        "alpine_dscr": dscr(ALPINE_2025, ALPINE_EXISTING, ALPINE_LOAN),
        "alpine_fccr": fccr(ALPINE_2025, ALPINE_EXISTING, ALPINE_LOAN),
        "alpine_global_dscr": global_dscr(ALPINE_2025, ALPINE_EXISTING, ALPINE_LOAN, [ALPINE_G]),
        "alpine_uca_cash_flow": uca_cash_flow(ALPINE_2025, ALPINE_WC),
        "bristlecone_obi": ordinary_business_income(BRISTLE),
        "bristlecone_ebitda": ebitda(BRISTLE),
        "bristlecone_proposed_debt_service": amortized_annual_debt_service(BRISTLE_LOAN.amount, BRISTLE_LOAN.annual_rate, BRISTLE_LOAN.term_months),
        "bristlecone_dscr": dscr(BRISTLE, BRISTLE_EXISTING, BRISTLE_LOAN),
        "bristlecone_fccr": fccr(BRISTLE, BRISTLE_EXISTING, BRISTLE_LOAN),
        "bristlecone_global_dscr": global_dscr(BRISTLE, BRISTLE_EXISTING, BRISTLE_LOAN, [BRISTLE_G]),
        "bristlecone_uca_cash_flow": uca_cash_flow(BRISTLE, BRISTLE_WC),
        "consumer_c_front_dti": front,
        "consumer_c_back_dti": back,
    }
    assert actual.keys() == expected.keys()
    for name, value in actual.items():
        assert isinstance(value, Decimal) and isinstance(expected[name], Decimal), name
        assert abs(value - expected[name]) <= Decimal("1e-24"), name


def _engine_analysis_values(ownership):
    from app.analysis import analyze_commercial
    from app.assessment_contracts import CommercialAssessmentRequest

    data = json.loads((Path(__file__).resolve().parents[1] / "fixtures/alpine_dated_v2.json").read_text())
    data["guarantors"][0]["ownership_percentage"] = ownership
    return analyze_commercial(CommercialAssessmentRequest.model_validate_json(json.dumps(data))).model_dump(mode="json")


def test_analysis_matches_every_independent_gate_value():
    reference = runpy.run_path(str(Path(__file__).resolve().parents[2] / "gate/reference_calculator.py"))
    gate_values, gate_flags = reference["analysis_values"]()
    full, partial = _engine_analysis_values("1"), _engine_analysis_values("0.6")

    def value(metric):
        assert metric["status"] == "available", metric
        return Decimal(metric["raw_value"])

    actual = {}
    latest = full["periods"][1]
    for line in ("cogs", "gross_profit", "ordinary_business_income", "ebitda"):
        actual[f"alpine_common_size_{line}_2025"] = value(latest["common_size"][line])
    for line in ("gross_receipts", "ordinary_business_income", "ebitda"):
        actual[f"alpine_change_{line}_2025"] = value(latest["change_vs_prior"][line])
    for label, result in (("alpine", full), ("alpine_partial_owner", partial)):
        capacity = result["debt_capacity"]
        for row in capacity["constraints"]:
            actual[f"{label}_capacity_{row['constraint']}_payment"] = value(row["max_annual_payment"])
        actual[f"{label}_max_principal"] = value(capacity["max_principal"])
        for row in result["breakevens"]["rows"]:
            kind = "approval" if row["threshold_kind"] == "approval_minimum" else "decline"
            for metric in ("ebitda_cushion", "revenue_cushion"):
                actual[f"{label}_{metric}_{row['constraint']}_{kind}"] = value(row[metric])
            actual[f"{label}_breakeven_{row['constraint']}_{kind}"] = value(row["ebitda_breakeven"])
    schedule = full["amortization"]
    actual.update(
        alpine_schedule_scheduled_payment=Decimal(schedule["scheduled_payment"]),
        alpine_schedule_final_payment=Decimal(schedule["final_payment"]),
        alpine_schedule_total_interest=Decimal(schedule["total_interest"]),
        alpine_schedule_total_payments=Decimal(schedule["total_payments"]),
        alpine_schedule_payment_count=Decimal(schedule["payment_count"]),
    )
    cells = {(cell["revenue_change"], cell["proposed_rate_change_bps"]): cell for cell in full["sensitivity"]["cells"]}
    for suffix, key in (("revenue_minus_5", ("-0.05", "0")), ("revenue_minus_10", ("-0.1", "0")),
                        ("revenue_minus_10_rate_200", ("-0.1", "200")), ("revenue_minus_20_rate_300", ("-0.2", "300"))):
        for name in ("dscr", "fccr", "global_dscr"):
            actual[f"alpine_stress_{name}_{suffix}"] = value(cells[key][name])

    assert actual.keys() == gate_values.keys()
    for name, expected in gate_values.items():
        tolerance = Decimal("0") if name.startswith("alpine_schedule_") else Decimal("1e-24")
        assert abs(actual[name] - expected) <= tolerance, name
    assert full["debt_capacity"]["binding_constraint"] == gate_flags["alpine_binding_constraint"] == "fccr"
    assert partial["debt_capacity"]["binding_constraint"] == gate_flags["alpine_partial_owner_binding_constraint"]
