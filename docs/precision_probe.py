"""Verify the four precision defects reproduced in the baseline audit."""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_EVEN, localcontext
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.config import DEFAULT_POLICY
from app.core import dscr, ordinary_business_income
from app.decision import decide_commercial
from app.schemas import CommercialRequest, ExistingDebt, FinancialYear, ProposedLoan, WorkingCapital


def year(gross: str, cogs: str, expense: str) -> FinancialYear:
    return FinancialYear.model_validate({
        "gross_receipts": gross,
        "cogs": cogs,
        "operating_expense_excl_dna_interest_comp": expense,
        "officer_compensation": "0",
        "depreciation": "0",
        "amortization": "0",
        "interest_expense": "0",
    })


def request(financials: FinancialYear, debt: str) -> CommercialRequest:
    return CommercialRequest(
        borrower_name="Synthetic precision boundary",
        geography="60601",
        years=[financials, financials],
        existing_debt=ExistingDebt.model_validate({"cpltd_annual": debt}),
        proposed_loan=ProposedLoan(amount=Decimal("0"), annual_rate=Decimal("0"), term_months=12),
        working_capital=WorkingCapital(),
    )


def main() -> None:
    with localcontext() as context:
        context.prec = 60
        cancellation = year("1000.30", "1000.10", "0.20")
        exact_cancellation = Decimal("1000.30") - Decimal("1000.10") - Decimal("0.20")
        cancellation_observed = ordinary_business_income(cancellation)

        precision_loss = year("10000000000000000.01", "10000000000000000.00", "0")
        exact_cent = Decimal("10000000000000000.01") - Decimal("10000000000000000.00")
        lost_cent_observed = ordinary_business_income(precision_loss)

        boundary_request = request(year("300000.30", "100000.10", "50000.05"), "120000.12")
        exact_income = Decimal("300000.30") - Decimal("100000.10") - Decimal("50000.05")
        exact_dscr = exact_income / Decimal("120000.12")
        threshold = Decimal(str(DEFAULT_POLICY.commercial_min_dscr))
        observed_dscr = dscr(boundary_request.years[-1], boundary_request.existing_debt, boundary_request.proposed_loan)
        observed_decision = decide_commercial(boundary_request)

        rounding_request = request(year("2.675", "0", "0"), "1")
        rounding_decision = decide_commercial(rounding_request)
        rounded_cash = next(factor for factor in rounding_decision.factors if factor.name == "uca_positive").value
        exact_rounding = Decimal("2.675").quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)

        assert exact_cancellation == Decimal("0.00")
        assert exact_cent == Decimal("0.01")
        assert exact_dscr == threshold == Decimal("1.25")
        assert exact_rounding == Decimal("2.68")

        evidence = [
            {
                "case": "currency_cancellation",
                "source": "backend/app/schemas.py:47-49; backend/app/core.py:67-72",
                "input_decimal_strings": ["1000.30", "1000.10", "0.20"],
                "observed": repr(cancellation_observed),
                "exact": str(exact_cancellation),
                "passed": cancellation_observed == exact_cancellation,
            },
            {
                "case": "cent_lost_at_schema_coercion",
                "source": "backend/app/schemas.py:47-48; backend/app/core.py:67-68",
                "input_decimal_strings": ["10000000000000000.01", "10000000000000000.00"],
                "observed": repr(lost_cent_observed),
                "exact": str(exact_cent),
                "passed": lost_cent_observed == exact_cent,
            },
            {
                "case": "exact_dscr_threshold_misclassification",
                "source": "backend/app/core.py:67-79,89-92; backend/app/decision.py:32,55-58",
                "input_decimal_strings": ["300000.30", "100000.10", "50000.05", "120000.12"],
                "observed": repr(observed_dscr),
                "exact": str(exact_dscr),
                "threshold": str(threshold),
                "observed_threshold_passed": observed_dscr >= DEFAULT_POLICY.commercial_min_dscr,
                "exact_threshold_passed": exact_dscr >= threshold,
                "observed_decision": observed_decision.outcome,
                "exact_policy_outcome": "approve",
                "passed": observed_dscr == exact_dscr and observed_decision.outcome == "approve",
            },
            {
                "case": "report_boundary_half_even_rounding",
                "source": "backend/app/decision.py:52",
                "input_decimal_strings": ["2.675"],
                "observed": repr(rounded_cash),
                "exact": str(exact_rounding),
                "passed": rounded_cash == exact_rounding,
            },
        ]
    print(json.dumps({"baseline": "1b59a90f715853a41c5791edf6dce03c1a77839e", "precision_evidence": evidence}, indent=2, allow_nan=False))
    if not all(case["passed"] for case in evidence):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
