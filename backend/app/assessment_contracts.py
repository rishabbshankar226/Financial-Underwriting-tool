"""The dated commercial interface; legacy intake models keep their own contract."""

from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from itertools import pairwise
from typing import Annotated, Literal, Self

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, model_validator

from .config import PolicyConfig
from .field_errors import ContractValueError
from .finance import (
    MAX_TERM_MONTHS,
    ExactFinancialDecimal,
    MetricValue,
    ReportedDecimal,
    ReportedValue,
    decimal_sum,
    legacy_decimal_values,
)
from .schemas import DISCLAIMER, Decision

SCHEMA_VERSION: Literal["commercial-assessment-v2"] = "commercial-assessment-v2"
SERIALIZATION_VERSION: Literal["assessment-json-v2"] = "assessment-json-v2"
MAX_REQUEST_BYTES = 1_000_000


def iso_date(value: object) -> date:
    if type(value) is date:
        return value
    if isinstance(value, str) and len(value) == 10:
        try:
            parsed = date.fromisoformat(value)
        except ValueError as exc:
            raise ContractValueError(str(exc), "invalid_date") from exc
        if parsed.isoformat() == value:
            return parsed
    raise ContractValueError("A calendar date in ISO YYYY-MM-DD format is required", "invalid_date")


ISODate = Annotated[date, BeforeValidator(iso_date)]


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, allow_inf_nan=False)


class Period(ContractModel):
    period_start: ISODate
    period_end: ISODate


class DatedFinancialYear(Period):
    gross_receipts: ExactFinancialDecimal
    cogs: ExactFinancialDecimal
    operating_expense_excl_dna_interest_comp: ExactFinancialDecimal
    officer_compensation: ExactFinancialDecimal
    depreciation: ExactFinancialDecimal
    amortization: ExactFinancialDecimal
    interest_expense: ExactFinancialDecimal = Field(ge=0)
    section_179: ExactFinancialDecimal
    k1_distribution: ExactFinancialDecimal

    @model_validator(mode="after")
    def complete_annual_period(self) -> Self:
        start = self.period_start
        if start.day != 1 or start.year == 9999:
            raise ContractValueError(
                "Annual periods must start on the first day of a month in a supported year",
                "period_shape",
                pointer="/period_start",
            )
        expected_end = date(start.year + 1, start.month, 1) - timedelta(days=1)
        if self.period_end != expected_end:
            raise ContractValueError(
                "Financial periods must contain twelve complete calendar months",
                "period_shape",
                pointer="/period_end",
            )
        return self


class AssessmentUnits(ContractModel):
    currency: Literal["USD"]
    monetary_unit: Literal["dollars"]
    annual_rate_unit: Literal["decimal_nominal"]


class AssessmentExistingDebt(ContractModel):
    cpltd_annual: ExactFinancialDecimal = Field(ge=0)
    operating_lease_annual: ExactFinancialDecimal = Field(ge=0)


class AssessmentLoan(ContractModel):
    amount: ExactFinancialDecimal = Field(ge=0)
    annual_rate: ExactFinancialDecimal = Field(ge=0, le=1)
    term_months: int = Field(ge=12, le=MAX_TERM_MONTHS)
    rate_type: Literal["fixed"]
    repayment_type: Literal["fully_amortizing"]
    payment_frequency: Literal["monthly"]


class AssessmentGuarantor(ContractModel):
    name: str
    ownership_percentage: ExactFinancialDecimal = Field(ge=0, le=1)
    wages: ExactFinancialDecimal
    interest_dividend_income: ExactFinancialDecimal
    mortgage_pi_annual: ExactFinancialDecimal = Field(ge=0)
    auto_loan_annual: ExactFinancialDecimal = Field(ge=0)
    credit_card_min_annual: ExactFinancialDecimal = Field(ge=0)


class AssessmentWorkingCapital(Period):
    ar_increase: ExactFinancialDecimal
    inventory_increase: ExactFinancialDecimal
    ap_increase: ExactFinancialDecimal
    cash_taxes_paid: ExactFinancialDecimal


class CommercialAssessmentRequest(ContractModel):
    schema_version: Literal["commercial-assessment-v2"]
    assessment_as_of: ISODate
    borrower_name: str
    geography: str
    units: AssessmentUnits
    years: list[DatedFinancialYear] = Field(min_length=1, max_length=10)
    existing_debt: AssessmentExistingDebt
    proposed_loan: AssessmentLoan
    guarantors: list[AssessmentGuarantor]
    working_capital: AssessmentWorkingCapital

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_version(cls, value: object) -> object:
        if isinstance(value, dict) and value.get("schema_version") == "commercial-assessment-v1":
            converted = legacy_decimal_values(value)
            if isinstance(converted, dict):
                return {**converted, "schema_version": SCHEMA_VERSION}
        return value

    @model_validator(mode="after")
    def consistent_assumptions(self) -> Self:
        for index, (previous, current) in enumerate(pairwise(self.years), start=1):
            if current.period_start <= previous.period_end:
                raise ContractValueError(
                    "Financial periods must be oldest first, unique, and non-overlapping",
                    "period_order",
                    pointer=f"/years/{index}/period_start",
                )
        for index, year in enumerate(self.years):
            if year.period_end > self.assessment_as_of:
                raise ContractValueError(
                    "Financial periods cannot end after assessment_as_of",
                    "period_after_as_of",
                    pointer=f"/years/{index}/period_end",
                )
        latest, wc = self.years[-1], self.working_capital
        if (wc.period_start, wc.period_end) != (latest.period_start, latest.period_end):
            boundary = "period_start" if wc.period_start != latest.period_start else "period_end"
            raise ContractValueError(
                "Working-capital period must match the latest financial period",
                "working_capital_period",
                pointer=f"/working_capital/{boundary}",
            )
        if decimal_sum([g.ownership_percentage for g in self.guarantors]) > Decimal("1"):
            raise ContractValueError(
                "Total guarantor ownership cannot exceed 100%", "ownership_total", pointer="/guarantors", limit="1"
            )
        return self


class Metric(ContractModel):
    fact_id: str
    raw_value: MetricValue
    reported_value: ReportedValue = None
    unit: str
    display_precision: int | None = Field(ge=0, le=30)
    status: Literal["available", "not_applicable"]
    explanation: str | None

    @model_validator(mode="after")
    def valid_metric_state(self) -> Self:
        if self.status == "not_applicable":
            if (
                self.raw_value is not None
                or self.reported_value is not None
                or not self.explanation
                or not self.explanation.strip()
            ):
                raise ValueError("Unavailable metrics require null values and an explicit explanation")
        elif self.unit == "category":
            if (
                self.raw_value not in ("stable", "unstable", "insufficient_history")
                or self.reported_value != self.raw_value
            ):
                raise ValueError("A category metric requires an explicit supported category")
        elif not isinstance(self.raw_value, Decimal) or not isinstance(self.reported_value, Decimal):
            raise ValueError("Available financial metrics require finite raw and reported decimals")
        return self


class TraceOperand(ContractModel):
    reference_type: Literal["input", "fact", "policy"]
    reference: str
    raw_value: int | MetricValue
    reported_value: int | ReportedValue = None
    unit: str


class TraceRow(Metric):
    definition_id: str
    expression: str
    operands: list[TraceOperand]


class ReportedFinancialYear(Period):
    gross_receipts: ReportedDecimal
    cogs: ReportedDecimal
    operating_expense_excl_dna_interest_comp: ReportedDecimal
    officer_compensation: ReportedDecimal
    depreciation: ReportedDecimal
    amortization: ReportedDecimal
    interest_expense: ReportedDecimal
    section_179: ReportedDecimal
    k1_distribution: ReportedDecimal


class HistoricalPeriod(Period):
    financials: DatedFinancialYear
    reported_financials: ReportedFinancialYear
    gross_profit: Metric
    ordinary_business_income: Metric
    ebitda: Metric
    k1_distribution_ratio: Metric


class AssessmentFingerprint(ContractModel):
    algorithm: Literal["sha256"]
    value: str
    content: Literal[
        "normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version"
    ]


class CurrentFacts(ContractModel):
    ordinary_business_income: Metric
    ebitda: Metric
    proposed_monthly_payment: Metric
    proposed_annual_payment: Metric
    debt_service: Metric
    fixed_charge_service: Metric
    global_business_ebitda: Metric
    global_outside_income: Metric
    global_personal_debt: Metric
    global_cash_flow: Metric
    global_debt_service: Metric
    dscr: Metric
    fccr: Metric
    global_dscr: Metric
    net_working_capital_increase: Metric
    uca_cash_flow: Metric
    k1_ratio_difference: Metric
    k1_history: Metric


class GuarantorContribution(ContractModel):
    guarantor_index: int
    name: str
    business_ebitda: Metric
    outside_income: Metric
    personal_debt: Metric


class CommercialAssessment(ContractModel):
    schema_version: Literal["commercial-assessment-v2"]
    calculation_version: str
    serialization_version: Literal["assessment-json-v2"]
    normalized_input: CommercialAssessmentRequest
    selected_period: Period
    coverage_basis: Literal["current_pro_forma"]
    assumptions_as_of: date
    historical_spread: list[HistoricalPeriod]
    current_facts: CurrentFacts
    guarantor_contributions: list[GuarantorContribution]
    k1_history_periods: list[Period]
    calculation_trace: list[TraceRow]
    decision: Decision
    policy_snapshot: PolicyConfig
    fingerprint: AssessmentFingerprint
    disclaimer: str = DISCLAIMER
