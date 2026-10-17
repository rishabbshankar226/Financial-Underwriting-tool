"""Read-only credit analysis of one assessment: derived views and capacity, never a decision change.

Every analysis figure is a recorded calculation whose operands reference the assessment's
inputs, facts or retained policy. Stresses reuse the exact scenario definitions.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import asdict, dataclass, replace
from decimal import ROUND_HALF_EVEN, Decimal
from typing import Literal

from .analysis_contracts import (
    MAX_MONTHLY_ROWS,
    AmortizationMonth,
    AmortizationSchedule,
    AmortizationYear,
    AnalysisBaseline,
    Breakevens,
    CapacityConstraint,
    CommercialAnalysis,
    CoverageBreakeven,
    CoverageName,
    DebtCapacity,
    DecisionExplanation,
    FactorExplanation,
    FactorStatus,
    LineMetrics,
    OutcomeCondition,
    PaymentReconciliation,
    PeriodAnalysis,
    ScoreBreakdown,
    SensitivityCell,
    SensitivityGrid,
)
from .assessment import assess_commercial, comparable_periods
from .assessment_contracts import (
    CommercialAssessment,
    CommercialAssessmentRequest,
    DatedFinancialYear,
    Metric,
    Period,
    TraceRow,
)
from .case_contracts import CaseSnapshot
from .cases import AssessmentOperation, CaseStoreError
from .config import DEFAULT_POLICY, PolicyConfig
from .core import Calculation, Operand, _Facts, _finite, _loan_payment, projected_commercial_facts
from .decision import decision_from_commercial_facts
from .finance import (
    BASIS_POINTS_PER_UNIT,
    MONTHS_PER_YEAR,
    ONE,
    ZERO,
    calculation,
    decimal_text,
    finite_result,
    quantize,
)
from .scenario_contracts import SCENARIO_DEFINITION_VERSION, ScenarioAssumptions
from .scenarios import HELD_FIXED, TARGETS, baseline_trace, project_inputs, verified_baseline
from .schemas import DecisionFactor

LINES = (
    "gross_receipts",
    "cogs",
    "operating_expense_excl_dna_interest_comp",
    "officer_compensation",
    "depreciation",
    "amortization",
    "interest_expense",
    "section_179",
    "k1_distribution",
    "gross_profit",
    "ordinary_business_income",
    "ebitda",
)
DERIVED_LINES = frozenset(("gross_profit", "ordinary_business_income", "ebitda"))
CONSTRAINTS: tuple[CoverageName, ...] = ("dscr", "fccr", "global_dscr")
APPROVAL_FIELDS = {
    "dscr": "commercial_min_dscr",
    "fccr": "commercial_min_fccr",
    "global_dscr": "commercial_min_global_dscr",
}
DECLINE_FIELDS = {
    "dscr": "commercial_decline_dscr",
    "fccr": "commercial_decline_fccr",
    "global_dscr": "commercial_decline_global_dscr",
}
THRESHOLDS: tuple[tuple[Literal["approval_minimum", "decline_floor"], dict[str, str]], ...] = (
    ("approval_minimum", APPROVAL_FIELDS),
    ("decline_floor", DECLINE_FIELDS),
)
SERVICE_FACTS = {
    "dscr": "current.debt_service",
    "fccr": "current.fixed_charge_service",
    "global_dscr": "current.global_debt_service",
}
REVENUE_CHANGES = ("0", "-0.05", "-0.1", "-0.15", "-0.2")
RATE_CHANGES_BPS = ("0", "100", "200", "300")
CENT = Decimal("0.01")

NO_SERVICE = "No debt service"
NO_OWNERSHIP = "Global cash flow does not depend on business EBITDA when total ownership is zero"
NEGATIVE_TARGETS = "Percentage stresses require nonnegative latest-period revenue, COGS and operating expense"
RATE_OUT_OF_RANGE = "The stressed proposed rate is outside 0% to 100%"
OUTSIDE_CONTRACT = "Projected values exceed the supported calculation contract"
RECONCILIATION = (
    "Coverage uses twelve unrounded annuity payments (annualized-payment-v2); the schedule rounds payments "
    "and interest to cents and settles the balance in the final payment."
)
LABELS = {
    "dscr": "Business DSCR",
    "fccr": "Fixed-charge coverage (FCCR)",
    "global_dscr": "Global DSCR",
    "k1_history": "K-1 distribution history",
    "uca_positive": "UCA cash flow",
}
CONDITIONS = {
    "coverage_meets_approval": "Business DSCR, FCCR and global DSCR each meet their approval minimums",
    "uca_meets_approval": "UCA cash flow is above its required minimum",
    "k1_history_stable": "K-1 distribution history is stable",
    "coverage_below_decline_floor": "At least one coverage ratio is below its decline floor",
}
RULES = [
    "Approve when every coverage ratio and UCA cash flow meet approval and K-1 history is stable.",
    "Review when coverage and UCA cash flow meet approval but K-1 history is not stable.",
    "Decline when coverage or UCA cash flow misses approval and any coverage ratio is below its decline floor.",
    "Review in every other case.",
    "A coverage ratio without debt service is not applicable and cannot meet approval.",
]
SCORE_NOTE = (
    "The score is the weight share of factors that meet policy. It is illustrative, never changes the "
    "outcome, and is not a probability of default."
)
K1_STATES = {
    "stable": "is stable",
    "unstable": "is unstable",
    "insufficient_history": "has fewer than two comparable periods",
}


def _metric(row: Calculation) -> Metric:
    return Metric.model_validate({key: getattr(row, key) for key in Metric.model_fields})


def _unavailable(fact_id: str, unit: str, precision: int | None, explanation: str) -> Metric:
    return Metric(
        fact_id=fact_id,
        raw_value=None,
        reported_value=None,
        unit=unit,
        display_precision=precision,
        status="not_applicable",
        explanation=explanation,
    )


def _policy(field: str, value: Decimal, unit: str = "ratio") -> Operand:
    return Operand("policy", f"/policy_snapshot/{field}", value, unit)


def _analysis_facts(assessment: CommercialAssessment) -> _Facts:
    """Seed operands with the assessment's own facts so every reference resolves to its trace."""
    facts = _Facts()
    for row in assessment.calculation_trace:
        facts.rows[row.fact_id] = Calculation(
            row.fact_id,
            row.definition_id,
            row.expression,
            (),
            row.raw_value,
            row.unit,
            row.display_precision,
            row.status,
            row.explanation,
            row.reported_value,
        )
    return facts


def _value(facts: _Facts, name: str) -> Decimal:
    return finite_result(facts.rows[name].raw_value)


def _line(facts: _Facts, index: int, year: DatedFinancialYear, line: str) -> tuple[Operand, Decimal]:
    if line in DERIVED_LINES:
        return facts.fact(f"years.{index}.{line}"), _value(facts, f"years.{index}.{line}")
    amount: Decimal = getattr(year, line)
    return facts.input(f"/years/{index}/{line}", amount), amount


def _periods(assessment: CommercialAssessment, facts: _Facts) -> list[PeriodAnalysis]:
    years = assessment.normalized_input.years
    periods = []
    for index, year in enumerate(years):
        receipts_operand, receipts = _line(facts, index, year, "gross_receipts")
        common: dict[str, Metric] = {}
        change: dict[str, Metric] = {}
        for line in LINES:
            operand, amount = _line(facts, index, year, line)
            name = f"analysis.periods.{index}.common_size.{line}"
            facts.add(
                name,
                "common-size-v1",
                f"{line} / gross_receipts; nonpositive gross receipts is not applicable",
                [operand, receipts_operand],
                _finite(amount / receipts) if receipts > ZERO else None,
                "ratio",
                4,
                None if receipts > ZERO else "Nonpositive gross receipts",
            )
            common[line] = _metric(facts.rows[name])
            if index:
                prior_operand, prior = _line(facts, index - 1, years[index - 1], line)
                name = f"analysis.periods.{index}.change_vs_prior.{line}"
                facts.add(
                    name,
                    "change-vs-prior-v1",
                    f"({line} - prior {line}) / prior {line}; nonpositive prior amount is not applicable",
                    [operand, prior_operand],
                    _finite((amount - prior) / prior) if prior > ZERO else None,
                    "ratio",
                    4,
                    None if prior > ZERO else "Nonpositive prior-period amount",
                )
                change[line] = _metric(facts.rows[name])
        previous = years[index - 1] if index else None
        periods.append(
            PeriodAnalysis(
                period_start=year.period_start,
                period_end=year.period_end,
                period_index=index,
                common_size=LineMetrics(**common),
                prior_period=(
                    Period(period_start=previous.period_start, period_end=previous.period_end) if previous else None
                ),
                prior_period_adjacent=comparable_periods(previous, year) if previous else None,
                change_vs_prior=LineMetrics(**change) if index else None,
            )
        )
    return periods


def _present_value(monthly: Decimal, annual_rate: Decimal, term_months: int) -> Decimal:
    if monthly == ZERO:
        return ZERO
    rate = annual_rate / MONTHS_PER_YEAR
    if rate == ZERO:
        return _finite(monthly * term_months)
    return _finite(monthly * (ONE - (ONE + rate) ** -term_months) / rate)


def _debt_capacity(assessment: CommercialAssessment, facts: _Facts) -> DebtCapacity:
    request, policy = assessment.normalized_input, assessment.policy_snapshot
    latest = len(request.years) - 1
    year, existing, loan = request.years[latest], request.existing_debt, request.proposed_loan
    ebitda = facts.fact(f"years.{latest}.ebitda")
    interest = facts.input(f"/years/{latest}/interest_expense", year.interest_expense, "USD/year")
    cpltd = facts.input("/existing_debt/cpltd_annual", existing.cpltd_annual, "USD/year")
    lease = facts.input("/existing_debt/operating_lease_annual", existing.operating_lease_annual, "USD/year")
    cash_flow, personal = facts.fact("current.global_cash_flow"), facts.fact("current.global_personal_debt")
    minimums = {name: getattr(policy, APPROVAL_FIELDS[name]) for name in CONSTRAINTS}
    base = _value(facts, f"years.{latest}.ebitda")
    carried = year.interest_expense + existing.cpltd_annual
    terms = {
        "dscr": (
            "ebitda / commercial_min_dscr - existing_interest - cpltd_annual",
            [ebitda, _policy(APPROVAL_FIELDS["dscr"], minimums["dscr"]), interest, cpltd],
            base / minimums["dscr"] - carried,
        ),
        "fccr": (
            "ebitda / commercial_min_fccr - existing_interest - cpltd_annual - operating_lease_annual",
            [ebitda, _policy(APPROVAL_FIELDS["fccr"], minimums["fccr"]), interest, cpltd, lease],
            base / minimums["fccr"] - carried - existing.operating_lease_annual,
        ),
        "global_dscr": (
            "global_cash_flow / commercial_min_global_dscr - existing_interest - cpltd_annual - global_personal_debt",
            [cash_flow, _policy(APPROVAL_FIELDS["global_dscr"], minimums["global_dscr"]), interest, cpltd, personal],
            _value(facts, "current.global_cash_flow") / minimums["global_dscr"]
            - carried
            - _value(facts, "current.global_personal_debt"),
        ),
    }
    payments: dict[CoverageName, Decimal] = {}
    constraints: list[CapacityConstraint] = []
    for name in CONSTRAINTS:
        expression, operands, amount = terms[name]
        fact = f"analysis.debt_capacity.{name}.max_annual_payment"
        payments[name] = _finite(amount)
        facts.add(fact, "debt-capacity-v1", expression, operands, payments[name], "USD/year")
        constraints.append(
            CapacityConstraint(
                constraint=name, approval_minimum=minimums[name], max_annual_payment=_metric(facts.rows[fact])
            )
        )
    binding = min(CONSTRAINTS, key=lambda name: (payments[name], CONSTRAINTS.index(name)))
    maximum = max(payments[binding], ZERO)
    facts.add(
        "analysis.debt_capacity.max_annual_payment",
        "debt-capacity-v1",
        "max(0, max_annual_payment of the binding (smallest) constraint)",
        [facts.fact(f"analysis.debt_capacity.{binding}.max_annual_payment")],
        maximum,
        "USD/year",
    )
    monthly = _finite(maximum / MONTHS_PER_YEAR)
    facts.add(
        "analysis.debt_capacity.max_monthly_payment",
        "debt-capacity-v1",
        "max_annual_payment / 12",
        [facts.fact("analysis.debt_capacity.max_annual_payment")],
        monthly,
        "USD/month",
    )
    facts.add(
        "analysis.debt_capacity.max_principal",
        "present-value-principal-v1",
        "zero payment: 0; zero rate: max_monthly_payment * term_months; otherwise "
        "max_monthly_payment * (1 - (1 + annual_rate / 12) ** -term_months) / (annual_rate / 12)",
        [
            facts.fact("analysis.debt_capacity.max_monthly_payment"),
            facts.input("/proposed_loan/annual_rate", loan.annual_rate, "decimal_nominal_annual_rate"),
            facts.input("/proposed_loan/term_months", loan.term_months, "months"),
        ],
        _present_value(monthly, loan.annual_rate, loan.term_months),
    )
    facts.add(
        "analysis.debt_capacity.requested_principal",
        "requested-principal-v1",
        "proposed_loan.amount",
        [facts.input("/proposed_loan/amount", loan.amount)],
        loan.amount,
    )
    facts.add(
        "analysis.debt_capacity.principal_headroom",
        "principal-headroom-v1",
        "max_principal - requested_principal; negative is a shortfall",
        [
            facts.fact("analysis.debt_capacity.max_principal"),
            facts.fact("analysis.debt_capacity.requested_principal"),
        ],
        _finite(_value(facts, "analysis.debt_capacity.max_principal") - loan.amount),
    )
    row = facts.rows
    return DebtCapacity(
        basis="latest_period_current_pro_forma",
        constraints=constraints,
        binding_constraint=binding,
        max_annual_payment=_metric(row["analysis.debt_capacity.max_annual_payment"]),
        max_monthly_payment=_metric(row["analysis.debt_capacity.max_monthly_payment"]),
        max_principal=_metric(row["analysis.debt_capacity.max_principal"]),
        requested_principal=_metric(row["analysis.debt_capacity.requested_principal"]),
        principal_headroom=_metric(row["analysis.debt_capacity.principal_headroom"]),
        has_capacity=payments[binding] > ZERO,
    )


def _ownership_weight(assessment: CommercialAssessment, facts: _Facts) -> Decimal:
    guarantors = assessment.normalized_input.guarantors
    weight = ZERO
    for guarantor in guarantors:
        weight = _finite(weight + guarantor.ownership_percentage)
    facts.add(
        "analysis.breakevens.ownership_weight",
        "ownership-weight-v1",
        "sum ownership_percentage in supplied guarantor order" if guarantors else "no guarantors: full business EBITDA",
        [
            facts.input(f"/guarantors/{index}/ownership_percentage", guarantor.ownership_percentage, "fraction")
            for index, guarantor in enumerate(guarantors)
        ],
        weight if guarantors else ONE,
        "fraction",
        4,
    )
    return weight if guarantors else ONE


def _breakevens(assessment: CommercialAssessment, facts: _Facts) -> Breakevens:
    request, policy = assessment.normalized_input, assessment.policy_snapshot
    latest = len(request.years) - 1
    ebitda_operand = facts.fact(f"years.{latest}.ebitda")
    ebitda = _value(facts, f"years.{latest}.ebitda")
    receipts = request.years[latest].gross_receipts
    receipts_operand = facts.input(f"/years/{latest}/gross_receipts", receipts)
    weight = _ownership_weight(assessment, facts)
    rows: list[CoverageBreakeven] = []
    breakevens: dict[str, dict[CoverageName, Decimal]] = {"approval_minimum": {}, "decline_floor": {}}
    for name in CONSTRAINTS:
        service_operand, service = facts.fact(SERVICE_FACTS[name]), _value(facts, SERVICE_FACTS[name])
        for kind, fields in THRESHOLDS:
            threshold: Decimal = getattr(policy, fields[name])
            operands = [_policy(fields[name], threshold), service_operand]
            reason = NO_SERVICE if service == ZERO else None
            if name == "global_dscr":
                operands += [facts.fact("current.global_outside_income"), facts.fact("analysis.breakevens.ownership_weight")]
                expression = "(threshold * global_debt_service - global_outside_income) / ownership_weight"
                reason = reason or (NO_OWNERSHIP if weight == ZERO else None)
                outside = _value(facts, "current.global_outside_income")
                value = None if reason else _finite((threshold * service - outside) / weight)
            else:
                expression = f"threshold * {SERVICE_FACTS[name].removeprefix('current.')}"
                value = None if reason else _finite(threshold * service)
            prefix = f"analysis.breakevens.{name}.{kind}"
            facts.add(prefix + ".ebitda_breakeven", "ebitda-breakeven-v1", expression, operands, value, "USD", 2, reason)
            breakeven = facts.fact(prefix + ".ebitda_breakeven")
            if value is not None:
                breakevens[kind][name] = value
            ebitda_reason = reason or (None if ebitda > ZERO else "Nonpositive EBITDA")
            revenue_reason = reason or (None if receipts > ZERO else "Nonpositive gross receipts")
            facts.add(
                prefix + ".ebitda_cushion",
                "ebitda-cushion-v1",
                "1 - ebitda_breakeven / ebitda; negative means the constraint is already breached",
                [breakeven, ebitda_operand],
                None if value is None or ebitda_reason else _finite(ONE - value / ebitda),
                "ratio",
                4,
                ebitda_reason,
            )
            facts.add(
                prefix + ".revenue_cushion",
                "revenue-cushion-v1",
                "(ebitda - ebitda_breakeven) / gross_receipts with every cost line held fixed",
                [ebitda_operand, breakeven, receipts_operand],
                None if value is None or revenue_reason else _finite((ebitda - value) / receipts),
                "ratio",
                4,
                revenue_reason,
            )
            rows.append(
                CoverageBreakeven(
                    constraint=name,
                    threshold_kind=kind,
                    threshold=threshold,
                    ebitda_breakeven=_metric(facts.rows[prefix + ".ebitda_breakeven"]),
                    ebitda_cushion=_metric(facts.rows[prefix + ".ebitda_cushion"]),
                    revenue_cushion=_metric(facts.rows[prefix + ".revenue_cushion"]),
                )
            )

    def binding(kind: str) -> CoverageName | None:
        available = breakevens[kind]
        if not available:
            return None
        return max(available, key=lambda name: (available[name], -CONSTRAINTS.index(name)))

    return Breakevens(
        ownership_weight=_metric(facts.rows["analysis.breakevens.ownership_weight"]),
        rows=rows,
        binding_approval_constraint=binding("approval_minimum"),
        binding_decline_constraint=binding("decline_floor"),
    )


@dataclass(frozen=True)
class _Schedule:
    principal: Decimal
    payment: Decimal
    months: list[AmortizationMonth]
    years: list[AmortizationYear]
    count: int
    final: Decimal
    interest: Decimal
    paid: Decimal


def _schedule(amount: Decimal, annual_rate: Decimal, term_months: int) -> _Schedule | None:
    """Cent-rounded level payments; the final or payoff month settles the remaining balance."""
    principal = amount.quantize(CENT, rounding=ROUND_HALF_EVEN)
    if principal == ZERO:
        return None
    rate = annual_rate / MONTHS_PER_YEAR
    payment = _loan_payment(principal, annual_rate, term_months)[0].quantize(CENT, rounding=ROUND_HALF_EVEN)
    balance = principal
    months: list[AmortizationMonth] = []
    years: list[AmortizationYear] = []
    total_interest = total_paid = year_paid = year_interest = year_principal = ZERO
    year_months, count, final = 0, 0, ZERO
    for month in range(1, term_months + 1):
        interest = (balance * rate).quantize(CENT, rounding=ROUND_HALF_EVEN)
        last = month == term_months or payment - interest >= balance
        paid = balance + interest if last else payment
        reduction = paid - interest
        balance -= reduction
        total_interest, total_paid = total_interest + interest, total_paid + paid
        year_paid, year_interest, year_principal = year_paid + paid, year_interest + interest, year_principal + reduction
        year_months += 1
        if len(months) < MAX_MONTHLY_ROWS:
            months.append(
                AmortizationMonth(
                    month=month, payment=paid, interest=interest, principal=reduction, ending_balance=balance
                )
            )
        if year_months == 12 or last:
            years.append(
                AmortizationYear(
                    loan_year=len(years) + 1,
                    months=year_months,
                    payments=year_paid,
                    interest=year_interest,
                    principal=year_principal,
                    ending_balance=balance,
                )
            )
            year_paid = year_interest = year_principal = ZERO
            year_months = 0
        if last:
            count, final = month, paid
            break
    return _Schedule(principal, payment, months, years, count, final, total_interest, total_paid)


def _amortization(assessment: CommercialAssessment, facts: _Facts) -> AmortizationSchedule:
    loan = assessment.normalized_input.proposed_loan
    result = _schedule(loan.amount, loan.annual_rate, loan.term_months)
    if result is None:
        return AmortizationSchedule(
            status="not_applicable",
            explanation="No proposed principal to amortize",
            schedule_principal=None,
            principal_rounding_difference=None,
            scheduled_payment=None,
            final_payment=None,
            final_payment_adjustment=None,
            total_payments=None,
            total_interest=None,
            total_principal=None,
            payment_count=None,
            early_payoff=None,
            annual_rows=[],
            monthly_rows=[],
            monthly_rows_truncated=False,
            reconciliation=None,
        )
    facts.add(
        "analysis.amortization.scheduled_payment",
        "amortization-schedule-v1",
        "level payment for the principal rounded half-even to cents; monthly interest = balance * annual_rate / 12 "
        "rounded half-even to cents; the final or payoff month settles the balance",
        [
            facts.input("/proposed_loan/amount", loan.amount),
            facts.input("/proposed_loan/annual_rate", loan.annual_rate, "decimal_nominal_annual_rate"),
            facts.input("/proposed_loan/term_months", loan.term_months, "months"),
        ],
        result.payment,
        "USD/month",
    )
    annuity = _value(facts, "current.proposed_monthly_payment")
    coverage = _value(facts, "current.proposed_annual_payment")
    first_year = result.years[0].payments
    return AmortizationSchedule(
        status="available",
        explanation=None,
        schedule_principal=result.principal,
        principal_rounding_difference=_finite(result.principal - loan.amount),
        scheduled_payment=result.payment,
        final_payment=result.final,
        final_payment_adjustment=result.final - result.payment,
        total_payments=result.paid,
        total_interest=result.interest,
        total_principal=result.principal,
        payment_count=result.count,
        early_payoff=result.count < loan.term_months,
        annual_rows=result.years,
        monthly_rows=result.months,
        monthly_rows_truncated=result.count > MAX_MONTHLY_ROWS,
        reconciliation=PaymentReconciliation(
            annuity_monthly_payment=annuity,
            scheduled_monthly_payment=result.payment,
            monthly_rounding_difference=_finite(result.payment - annuity),
            coverage_annual_payment=coverage,
            first_loan_year_payments=first_year,
            first_loan_year_difference=_finite(first_year - coverage),
            explanation=RECONCILIATION,
        ),
    )


def _sensitivity(assessment: CommercialAssessment) -> SensitivityGrid:
    request = assessment.normalized_input
    revenue_changes = [Decimal(value) for value in REVENUE_CHANGES]
    rate_changes = [Decimal(value) for value in RATE_CHANGES_BPS]

    def grid(status: str, explanation: str | None, definitions: list[str], cells: list[SensitivityCell]) -> SensitivityGrid:
        return SensitivityGrid.model_validate(
            dict(
                status=status,
                explanation=explanation,
                scenario_definition_version=SCENARIO_DEFINITION_VERSION,
                coverage_basis="stressed_latest_period_current_pro_forma",
                definition_ids=definitions,
                revenue_changes=revenue_changes,
                rate_changes_bps=rate_changes,
                cells=cells,
                held_fixed_assumptions=list(HELD_FIXED),
            )
        )

    if any(getattr(request.years[-1], name) < ZERO for name in TARGETS):
        return grid("not_applicable", NEGATIVE_TARGETS, [], [])
    observed = baseline_trace(assessment)
    cells: list[SensitivityCell] = []
    definitions: list[str] = []
    for row_index, change in enumerate(revenue_changes):
        for column_index, shift in enumerate(rate_changes):
            prefix = f"analysis.sensitivity.{row_index}.{column_index}"
            rate = _finite(request.proposed_loan.annual_rate + shift / BASIS_POINTS_PER_UNIT)
            reason = None if ZERO <= rate <= ONE else RATE_OUT_OF_RANGE
            if reason is None:
                try:
                    assumptions = ScenarioAssumptions(
                        revenue_change=change, cogs_change=ZERO, operating_expense_change=ZERO, proposed_rate_change_bps=shift
                    )
                    inputs, assumption_trace = project_inputs(request, assumptions)
                    projected = projected_commercial_facts(
                        request,
                        inputs.operating,
                        inputs.proposed_loan,
                        retained_trace=observed,
                        assumption_trace=assumption_trace,
                    )
                    decision = decision_from_commercial_facts(projected, assessment.policy_snapshot)
                except (ValueError, TypeError, OverflowError, RecursionError):
                    reason = OUTSIDE_CONTRACT
            if reason is not None:
                cells.append(
                    SensitivityCell(
                        revenue_change=change,
                        proposed_rate_change_bps=shift,
                        status="not_applicable",
                        explanation=reason,
                        resulting_annual_rate=None,
                        dscr=_unavailable(prefix + ".dscr", "ratio", 4, reason),
                        fccr=_unavailable(prefix + ".fccr", "ratio", 4, reason),
                        global_dscr=_unavailable(prefix + ".global_dscr", "ratio", 4, reason),
                        outcome=None,
                    )
                )
                continue
            if not definitions:
                definitions = list(
                    dict.fromkeys(
                        trace.definition_id for trace in projected.trace if trace.fact_id.startswith("projection.")
                    )
                )
            metrics = {
                name: _metric(replace(projected.current[name], fact_id=f"{prefix}.{name}"))
                for name in ("dscr", "fccr", "global_dscr")
            }
            cells.append(
                SensitivityCell(
                    revenue_change=change,
                    proposed_rate_change_bps=shift,
                    status="available",
                    explanation=None,
                    resulting_annual_rate=rate,
                    outcome=decision.outcome,
                    **metrics,
                )
            )
    return grid("available", None, definitions, cells)


def outcome_conditions(factors: Sequence[DecisionFactor]) -> tuple[dict[str, bool], str, str]:
    """Restate the commercial outcome rule from recorded factors; it must agree with the decision."""
    by_name = {factor.name: factor for factor in factors}
    coverage = [by_name[name] for name in CONSTRAINTS]
    conditions = {
        "coverage_meets_approval": all(factor.passed is True for factor in coverage),
        "uca_meets_approval": by_name["uca_positive"].passed is True,
        "k1_history_stable": by_name["k1_history"].passed is True,
        "coverage_below_decline_floor": any(factor.decline_triggered is True for factor in coverage),
    }
    if conditions["coverage_meets_approval"] and conditions["uca_meets_approval"]:
        if conditions["k1_history_stable"]:
            return conditions, "approve_all_conditions", "approve"
        return conditions, "review_k1_history", "review"
    if conditions["coverage_below_decline_floor"]:
        return conditions, "decline_coverage_floor", "decline"
    return conditions, "review_otherwise", "review"


def _status(factor: DecisionFactor) -> FactorStatus:
    if factor.passed is None:
        return "not_applicable"
    if factor.passed:
        return "meets_approval"
    return "below_decline_floor" if factor.decline_triggered else "review_band"


def _display(value: object) -> str:
    return format(value, "f") if isinstance(value, Decimal) else str(value)


def _summary(factor: DecisionFactor, label: str) -> str:
    if factor.name == "k1_history":
        return f"{label} {K1_STATES.get(str(factor.raw_value), 'is unavailable')}; approval requires stable history."
    if factor.passed is None:
        return f"{label} is not applicable because there is no debt service, so it cannot meet approval."
    threshold = finite_result(factor.threshold)
    shown = finite_result(factor.value)
    exact = finite_result(factor.raw_value)
    if factor.name == "uca_positive":
        verdict = "is above" if factor.passed else "does not exceed"
        sentence = f"{label} of {_display(shown)} {verdict} the required minimum of {decimal_text(threshold)}."
        rounded_differs = (shown > threshold) != (exact > threshold)
    else:
        floor = finite_result(factor.decline_threshold)
        if factor.passed:
            ending = f"meets the approval minimum of {decimal_text(threshold)}x."
        elif factor.decline_triggered:
            ending = f"is below the decline floor of {decimal_text(floor)}x."
        else:
            ending = (
                f"is below the approval minimum of {decimal_text(threshold)}x but at or above the decline "
                f"floor of {decimal_text(floor)}x."
            )
        sentence = f"{label} of {_display(shown)}x {ending}"
        rounded_differs = (shown >= threshold) != (exact >= threshold) or (shown < floor) != (exact < floor)
    return sentence + (" The comparison uses the unrounded value." if rounded_differs else "")


def _factor(factor: DecisionFactor, facts: _Facts, policy: PolicyConfig) -> FactorExplanation:
    name, prefix = factor.name, f"analysis.explanation.{factor.name}"
    if name == "k1_history":
        approval = _unavailable(prefix + ".approval_cushion", "category", None, "Categorical factor")
        decline = _unavailable(prefix + ".decline_cushion", "category", None, "Categorical factor")
    else:
        source = "current.uca_cash_flow" if name == "uca_positive" else f"current.{name}"
        unit, precision = ("USD", 2) if name == "uca_positive" else ("ratio", 4)
        field = "commercial_min_uca_cash_flow" if name == "uca_positive" else APPROVAL_FIELDS[name]
        threshold: Decimal = getattr(policy, field)
        measured = facts.fact(source)
        reason = None if measured.raw_value is not None else facts.rows[source].explanation or "Not applicable"
        facts.add(
            prefix + ".approval_cushion",
            "policy-cushion-v1",
            "value - approval threshold (UCA must stay above zero; coverage must be at least the threshold)",
            [measured, _policy(field, threshold, unit)],
            None if reason else _finite(finite_result(measured.raw_value) - threshold),
            unit,
            precision,
            reason,
        )
        approval = _metric(facts.rows[prefix + ".approval_cushion"])
        if name == "uca_positive":
            decline = _unavailable(prefix + ".decline_cushion", unit, precision, "No decline floor applies")
        else:
            floor: Decimal = getattr(policy, DECLINE_FIELDS[name])
            facts.add(
                prefix + ".decline_cushion",
                "policy-cushion-v1",
                "value - decline floor",
                [measured, _policy(DECLINE_FIELDS[name], floor)],
                None if reason else _finite(finite_result(measured.raw_value) - floor),
                unit,
                precision,
                reason,
            )
            decline = _metric(facts.rows[prefix + ".decline_cushion"])
    label = LABELS.get(name, name)
    return FactorExplanation(
        name=name,
        label=label,
        status=_status(factor),
        summary=_summary(factor, label),
        comparison_operator=factor.comparison_operator,
        value=factor.value,
        raw_value=factor.raw_value,
        threshold=factor.threshold,
        decline_threshold=factor.decline_threshold,
        approval_cushion=approval,
        decline_cushion=decline,
        weight=factor.weight,
        score_contribution=factor.weight if factor.passed else ZERO,
        blocks_approval=factor.passed is not True,
        triggers_decline=factor.decline_triggered is True,
    )


def _headline(rule: str, factors: list[FactorExplanation]) -> str:
    def listed(labels: list[str]) -> str:
        return labels[0] if len(labels) == 1 else ", ".join(labels[:-1]) + " and " + labels[-1]

    if rule == "approve_all_conditions":
        return "Approve: every coverage ratio, UCA cash flow and K-1 history meet the illustrative policy."
    if rule == "review_k1_history":
        return "Review: coverage and UCA cash flow meet approval, but K-1 distribution history is not stable."
    if rule == "decline_coverage_floor":
        below = [factor.label for factor in factors if factor.triggers_decline]
        return f"Decline: {listed(below)} {'is' if len(below) == 1 else 'are'} below the decline floor."
    short = [factor.label for factor in factors if factor.blocks_approval]
    return f"Review: {listed(short)} {'does' if len(short) == 1 else 'do'} not meet approval."


def _explanation(assessment: CommercialAssessment, facts: _Facts) -> DecisionExplanation:
    decision = assessment.decision
    conditions, rule, outcome = outcome_conditions(decision.factors)
    if outcome != decision.outcome:
        raise RuntimeError("The decision explanation disagrees with the recorded outcome")
    passed = sum((factor.weight for factor in decision.factors if factor.passed), ZERO)
    total = sum((factor.weight for factor in decision.factors), ZERO)
    raw_score = _finite(passed / total)
    if quantize(raw_score, 4) != decision.score:
        raise RuntimeError("The score breakdown disagrees with the recorded score")
    factors = [_factor(factor, facts, assessment.policy_snapshot) for factor in decision.factors]
    return DecisionExplanation.model_validate(
        dict(
            outcome=decision.outcome,
            matched_rule=rule,
            headline=_headline(rule, factors),
            conditions=[
                OutcomeCondition.model_validate(dict(condition_id=key, description=text, satisfied=conditions[key]))
                for key, text in CONDITIONS.items()
            ],
            rules=RULES,
            factors=factors,
            score=ScoreBreakdown(
                passed_weight=passed,
                total_weight=total,
                raw_score=raw_score,
                reported_score=quantize(raw_score, 4),
                note=SCORE_NOTE,
            ),
        )
    )


@calculation
def analyze_assessment(
    assessment: CommercialAssessment, *, baseline: AnalysisBaseline | None = None
) -> CommercialAnalysis:
    facts = _analysis_facts(assessment)
    periods = _periods(assessment, facts)
    capacity = _debt_capacity(assessment, facts)
    breakevens = _breakevens(assessment, facts)
    amortization = _amortization(assessment, facts)
    explanation = _explanation(assessment, facts)
    sensitivity = _sensitivity(assessment)
    trace = [
        TraceRow.model_validate({**asdict(row), "operands": [asdict(operand) for operand in row.operands]})
        for row in facts.rows.values()
        if row.fact_id.startswith("analysis.")
    ]
    return CommercialAnalysis(
        calculation_version=assessment.calculation_version,
        source="saved_revision" if baseline else "stateless_request",
        assessment_fingerprint=assessment.fingerprint,
        policy_version=assessment.decision.policy_version,
        baseline=baseline,
        selected_period=assessment.selected_period,
        assumptions_as_of=assessment.assumptions_as_of,
        periods=periods,
        debt_capacity=capacity,
        breakevens=breakevens,
        amortization=amortization,
        sensitivity=sensitivity,
        explanation=explanation,
        calculation_trace=trace,
    )


def analyze_commercial(
    request: CommercialAssessmentRequest,
    policy: PolicyConfig = DEFAULT_POLICY,
    *,
    assessment_operation: AssessmentOperation = assess_commercial,
) -> CommercialAnalysis:
    return analyze_assessment(assessment_operation(request, policy))


def analyze_saved_revision(
    snapshot: CaseSnapshot, *, assessment_operation: AssessmentOperation = assess_commercial
) -> CommercialAnalysis:
    """Analyze the stored revision under its retained policy, only after it replays exactly."""
    assessment = verified_baseline(snapshot, assessment_operation, purpose="analysis")
    baseline = AnalysisBaseline(
        case_id=snapshot.case_id,
        revision=snapshot.revision,
        run_id=snapshot.run_id,
        input_hash=snapshot.input_hash,
        payload_hash=snapshot.payload_hash,
    )
    try:
        return analyze_assessment(assessment, baseline=baseline)
    except (ValueError, TypeError, OverflowError, RecursionError) as exc:
        raise CaseStoreError(
            422, "analysis_invalid", "The saved revision exceeds the supported analysis contract"
        ) from exc
