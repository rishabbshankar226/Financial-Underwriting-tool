from app.core import *
from fixtures import *

def test_alpine_gate_values():
    assert ordinary_business_income(ALPINE_2025) == 423000
    assert ebitda(ALPINE_2025) == 630000
    assert abs(amortized_annual_debt_service(ALPINE_LOAN.amount,ALPINE_LOAN.annual_rate,ALPINE_LOAN.term_months)-80961.0) <= 1
    assert abs(dscr(ALPINE_2025,ALPINE_EXISTING,ALPINE_LOAN)-3.135) <= .005
    assert abs(fccr(ALPINE_2025,ALPINE_EXISTING,ALPINE_LOAN)-2.800) <= .005
    assert abs(global_dscr(ALPINE_2025,ALPINE_EXISTING,ALPINE_LOAN,[ALPINE_G])-2.902) <= .005
    assert uca_cash_flow(ALPINE_2025,ALPINE_WC) == 385000
    assert k1_history_flag([ALPINE_2024,ALPINE_2025]) == "stable"

def test_bristlecone_gate_values():
    assert ordinary_business_income(BRISTLE) == 17000
    assert ebitda(BRISTLE) == 110000
    assert abs(amortized_annual_debt_service(BRISTLE_LOAN.amount,BRISTLE_LOAN.annual_rate,BRISTLE_LOAN.term_months)-59050.09) <= 1
    assert abs(dscr(BRISTLE,BRISTLE_EXISTING,BRISTLE_LOAN)-.723) <= .005
    assert abs(fccr(BRISTLE,BRISTLE_EXISTING,BRISTLE_LOAN)-.647) <= .005
    assert abs(global_dscr(BRISTLE,BRISTLE_EXISTING,BRISTLE_LOAN,[BRISTLE_G])-.816) <= .005
    assert uca_cash_flow(BRISTLE,BRISTLE_WC) == 88000
    assert k1_history_flag([BRISTLE]) == "insufficient_history"

def test_consumer_boundary():
    front, back = consumer_dti(9000, 2200, 470, 1200)
    assert abs(front-.2967) <= .0005
    assert abs(back-.4300) <= .0005
