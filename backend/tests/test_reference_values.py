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
