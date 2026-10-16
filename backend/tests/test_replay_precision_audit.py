import pytest
from app.case_replay import compare_assessments


@pytest.mark.parametrize("amount", [100.0, 1_000_000.0, 1_000_000_000_000.0, 100_000_000_000_000.0])
def test_replay_detects_cent_discrepancies_independent_of_amount(amount):
    stored = {"current_facts": {"ebitda": {"raw_value": amount}}}
    computed = {"current_facts": {"ebitda": {"raw_value": amount + 0.01}}}
    assert compare_assessments(stored, computed) == ["/current_facts/ebitda/raw_value"]


def test_replay_keeps_only_subcent_absolute_noise_tolerance():
    assert compare_assessments({"raw_value": 1.0}, {"raw_value": 1.0 + 1e-10}) == []
    assert compare_assessments({"raw_value": 1.0}, {"raw_value": 1.0 + 1e-6}) == ["/raw_value"]


@pytest.mark.parametrize("computed", ["1.0000000001", "1.0000000000000000000000001"])
def test_active_decimal_string_replay_has_no_subcent_tolerance(computed):
    assert compare_assessments({"raw_value": "1"}, {"raw_value": computed}) == ["/raw_value"]
