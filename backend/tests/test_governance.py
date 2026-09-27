from app.governance import geography_proxy_self_test
from fixtures import alpine_request


def test_geography_proxy_self_test_holds_creditworthiness_constant():
    out=geography_proxy_self_test(alpine_request(),["60601","48201","94105"])
    assert out["outcome_rate_gap"]==0
    assert len(set(out["outcomes"].values()))==1
    assert out["geography_is_decision_factor"] is False
    assert "not a certified" in out["label"]
