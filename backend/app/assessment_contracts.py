"""The dated commercial interface; legacy intake models keep their own contract."""
from __future__ import annotations

from datetime import date, timedelta
from math import fsum, isfinite
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .config import PolicyConfig
from .schemas import Decision, DISCLAIMER

SCHEMA_VERSION = "commercial-assessment-v1"
SERIALIZATION_VERSION = "assessment-json-v1"
MAX_REQUEST_BYTES = 1_000_000


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, allow_inf_nan=False)


class Period(ContractModel):
    period_start: date
    period_end: date


class DatedFinancialYear(Period):
    gross_receipts: float
    cogs: float
    operating_expense_excl_dna_interest_comp: float
    officer_compensation: float
    depreciation: float
    amortization: float
    interest_expense: float = Field(ge=0)
    section_179: float
    k1_distribution: float

    @model_validator(mode="after")
    def complete_annual_period(self):
        start = self.period_start
        if start.day != 1 or start.year == 9999:
            raise ValueError("Annual periods must start on the first day of a month in a supported year")
        expected_end = date(start.year + 1, start.month, 1) - timedelta(days=1)
        if self.period_end != expected_end:
            raise ValueError("Financial periods must contain twelve complete calendar months")
        return self


class AssessmentUnits(ContractModel):
    currency: Literal["USD"]
    monetary_unit: Literal["dollars"]
    annual_rate_unit: Literal["decimal_nominal"]


class AssessmentExistingDebt(ContractModel):
    cpltd_annual: float = Field(ge=0)
    operating_lease_annual: float = Field(ge=0)


class AssessmentLoan(ContractModel):
    amount: float = Field(ge=0)
    annual_rate: float = Field(ge=0, le=1)
    term_months: int = Field(ge=12)
    rate_type: Literal["fixed"]
    repayment_type: Literal["fully_amortizing"]
    payment_frequency: Literal["monthly"]

    @field_validator("term_months")
    @classmethod
    def supported_integer_range(cls, value: int) -> int:
        try:
            if not isfinite(value):
                raise ValueError("Term exceeds the supported finite calculation range")
        except OverflowError as exc:
            raise ValueError("Term exceeds the supported finite calculation range") from exc
        return value


class AssessmentGuarantor(ContractModel):
    name: str
    ownership_percentage: float = Field(ge=0, le=1)
    wages: float
    interest_dividend_income: float
    mortgage_pi_annual: float = Field(ge=0)
    auto_loan_annual: float = Field(ge=0)
    credit_card_min_annual: float = Field(ge=0)


class AssessmentWorkingCapital(Period):
    ar_increase: float
    inventory_increase: float
    ap_increase: float
    cash_taxes_paid: float


class CommercialAssessmentRequest(ContractModel):
    schema_version: Literal["commercial-assessment-v1"]
    assessment_as_of: date
    borrower_name: str
    geography: str
    units: AssessmentUnits
    years: list[DatedFinancialYear] = Field(min_length=1, max_length=10)
    existing_debt: AssessmentExistingDebt
    proposed_loan: AssessmentLoan
    guarantors: list[AssessmentGuarantor]
    working_capital: AssessmentWorkingCapital

    @model_validator(mode="after")
    def consistent_assumptions(self):
        for previous, current in zip(self.years, self.years[1:]):
            if current.period_start <= previous.period_end:
                raise ValueError("Financial periods must be oldest first, unique, and non-overlapping")
        if any(y.period_end > self.assessment_as_of for y in self.years):
            raise ValueError("Financial periods cannot end after assessment_as_of")
        latest, wc = self.years[-1], self.working_capital
        if (wc.period_start, wc.period_end) != (latest.period_start, latest.period_end):
            raise ValueError("Working-capital period must match the latest financial period")
        if fsum(g.ownership_percentage for g in self.guarantors) > 1.0 + 1e-9:
            raise ValueError("Total guarantor ownership cannot exceed 100%")
        return self


class Metric(ContractModel):
    fact_id: str
    raw_value: float | str | None
    unit: str
    display_precision: int | None
    status: Literal["available", "not_applicable"]
    explanation: str | None


class TraceOperand(ContractModel):
    reference_type: Literal["input", "fact", "policy"]
    reference: str
    raw_value: float | int | str | None
    unit: str


class TraceRow(Metric):
    definition_id: str
    expression: str
    operands: list[TraceOperand]


class HistoricalPeriod(Period):
    financials: DatedFinancialYear
    ordinary_business_income: Metric
    ebitda: Metric
    k1_distribution_ratio: Metric


class AssessmentFingerprint(ContractModel):
    algorithm: Literal["sha256"]
    value: str
    content: Literal["normalized_input+policy_snapshot+calculation_version+schema_version+serialization_version"]


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
    schema_version: Literal["commercial-assessment-v1"]
    calculation_version: str
    serialization_version: Literal["assessment-json-v1"]
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
