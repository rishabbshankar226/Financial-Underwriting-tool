"""Generated subcent ledgers must reconcile at the report boundary."""

import json
import random
from decimal import Decimal, localcontext
from pathlib import Path

from app.assessment import assess_commercial
from app.assessment_contracts import CommercialAssessmentRequest
from app.finance import quantize


def test_reported_annual_line_items_reconcile_without_mutating_input():
    generator = random.Random(4019)
    fixture = json.loads((Path(__file__).parents[1] / "fixtures/alpine_dated.json").read_text())
    for case in range(120):
        raw = json.loads(json.dumps(fixture))
        with localcontext() as context:
            context.prec = 80
            for year in raw["years"]:
                for field in (
                    "gross_receipts",
                    "cogs",
                    "operating_expense_excl_dna_interest_comp",
                    "officer_compensation",
                    "depreciation",
                    "amortization",
                    "interest_expense",
                    "section_179",
                    "k1_distribution",
                ):
                    value = Decimal(str(generator.randrange(1, 100000))) / Decimal("1000")
                    if field == "gross_receipts":
                        value += Decimal("1e25") if case % 3 == 0 else Decimal("10000")
                    year[field] = str(value)
            request = CommercialAssessmentRequest.model_validate_json(json.dumps(raw))
            accepted = request.model_dump(mode="json")
            assessment = assess_commercial(request)
            assert request.model_dump(mode="json") == accepted
            for historical in assessment.historical_spread:
                reported = historical.reported_financials
                assert reported.gross_receipts - reported.cogs == historical.gross_profit.reported_value
                expenses = sum(
                    (
                        getattr(reported, field)
                        for field in (
                            "operating_expense_excl_dna_interest_comp",
                            "officer_compensation",
                            "depreciation",
                            "amortization",
                            "interest_expense",
                            "section_179",
                        )
                    ),
                    Decimal("0"),
                )
                assert (
                    reported.gross_receipts - reported.cogs - expenses
                    == historical.ordinary_business_income.reported_value
                )
                assert (
                    reported.gross_receipts
                    - reported.cogs
                    - reported.operating_expense_excl_dna_interest_comp
                    - reported.officer_compensation
                    == historical.ebitda.reported_value
                )
                assert all(
                    getattr(reported, field).as_tuple().exponent == -2
                    for field in (
                        "gross_receipts",
                        "cogs",
                        "operating_expense_excl_dna_interest_comp",
                        "officer_compensation",
                        "depreciation",
                        "amortization",
                        "interest_expense",
                        "section_179",
                        "k1_distribution",
                    )
                )
                assert historical.ordinary_business_income.reported_value == quantize(
                    historical.ordinary_business_income.raw_value
                )


def test_reported_operands_reconcile_each_additive_trace_total():
    raw = json.loads((Path(__file__).parents[1] / "fixtures/alpine_dated.json").read_text())
    for year in raw["years"]:
        for field in (
            "gross_receipts",
            "cogs",
            "operating_expense_excl_dna_interest_comp",
            "officer_compensation",
            "depreciation",
            "amortization",
            "interest_expense",
            "section_179",
            "k1_distribution",
        ):
            year[field] = str(Decimal(str(year[field])) + Decimal("0.005"))
    request = CommercialAssessmentRequest.model_validate_json(json.dumps(raw))
    assessment = assess_commercial(request)
    signs = {
        "gross-profit-v2": (1, -1),
        "ordinary-business-income-v2": (1, -1, -1, -1, -1, -1, -1),
        "ebitda-v2": (1, 1, 1, 1, 1),
        "annual-debt-service-v2": (1, 1, 1),
        "fixed-charge-service-v2": (1, 1),
        "guarantor-outside-income-v2": (1, 1),
        "guarantor-personal-debt-v2": (1, 1, 1),
        "global-cash-flow-v2": (1, 1),
        "global-debt-service-v2": (1, 1),
        "net-working-capital-v2": (1, 1, -1),
        "uca-cash-flow-v2": (1, -1, -1),
    }
    checked = set()
    with localcontext() as context:
        context.prec = 80
        for row in assessment.calculation_trace:
            group = signs.get(row.definition_id)
            if group is None:
                continue
            values = [operand.reported_value for operand in row.operands]
            assert all(isinstance(value, Decimal) for value in values)
            assert (
                sum((value * sign for value, sign in zip(values, group, strict=True)), Decimal("0"))
                == row.reported_value
            )
            checked.add(row.definition_id)
    assert checked == set(signs)
