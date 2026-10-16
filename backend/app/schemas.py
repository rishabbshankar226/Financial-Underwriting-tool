from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from enum import Enum
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, JsonValue, field_validator, model_validator

from .finance import ExactFinancialDecimal, FinancialDecimal, ResultDecimal, Scalar, decimal_sum

DISCLAIMER = (
    "Prototype demonstration only. This output has not been validated for use in an actual "
    "lending decision. Use synthetic data only; this is not legal or compliance advice."
)


class FiniteModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, allow_inf_nan=False, validate_default=True)


class Vertical(str, Enum):
    commercial = "commercial"
    sba = "sba"
    consumer = "consumer"


class SourceKind(str, Enum):
    parser = "parser"
    model = "model"
    human_override = "human_override"
    deterministic = "deterministic"


class AuditEvent(FiniteModel):
    field: str
    prior_value: JsonValue | None = None
    new_value: JsonValue
    source: SourceKind
    actor: str = "system"
    rationale: str
    at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    @field_validator("rationale")
    @classmethod
    def validate_rationale(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("A nonblank audit rationale is required")
        return value


class FinancialYear(FiniteModel):
    gross_receipts: FinancialDecimal
    cogs: FinancialDecimal
    operating_expense_excl_dna_interest_comp: FinancialDecimal
    officer_compensation: FinancialDecimal
    depreciation: FinancialDecimal
    amortization: FinancialDecimal
    interest_expense: FinancialDecimal = Field(ge=0)
    section_179: FinancialDecimal = Decimal("0")
    k1_distribution: FinancialDecimal = Decimal("0")


class ExistingDebt(FiniteModel):
    cpltd_annual: FinancialDecimal = Field(ge=0)
    operating_lease_annual: FinancialDecimal = Field(default=Decimal("0"), ge=0)


class ProposedLoan(FiniteModel):
    amount: FinancialDecimal = Field(ge=0)
    annual_rate: FinancialDecimal = Field(ge=0)
    term_months: int = Field(gt=0)


class Guarantor(FiniteModel):
    name: str = "Synthetic Guarantor"
    ownership_percentage: FinancialDecimal = Field(default=Decimal("1"), ge=0, le=1)
    wages: FinancialDecimal = Decimal("0")
    interest_dividend_income: FinancialDecimal = Decimal("0")
    mortgage_pi_annual: FinancialDecimal = Field(default=Decimal("0"), ge=0)
    auto_loan_annual: FinancialDecimal = Field(default=Decimal("0"), ge=0)
    credit_card_min_annual: FinancialDecimal = Field(default=Decimal("0"), ge=0)


class WorkingCapital(FiniteModel):
    ar_increase: FinancialDecimal = Decimal("0")
    inventory_increase: FinancialDecimal = Decimal("0")
    ap_increase: FinancialDecimal = Decimal("0")
    cash_taxes_paid: FinancialDecimal = Decimal("0")


class CommercialRequest(FiniteModel):
    borrower_name: str
    geography: str
    years: list[FinancialYear] = Field(min_length=1)
    existing_debt: ExistingDebt
    proposed_loan: ProposedLoan
    guarantors: list[Guarantor] = []
    working_capital: WorkingCapital
    overrides: list[AuditEvent] = []

    @model_validator(mode="after")
    def validate_total_ownership(self) -> Self:
        if decimal_sum([g.ownership_percentage for g in self.guarantors]) > Decimal("1"):
            raise ValueError("Total guarantor ownership cannot exceed 100%")
        return self


class ConsumerRequest(FiniteModel):
    applicant_name: str
    geography: str
    gross_monthly_income: FinancialDecimal = Field(gt=0)
    proposed_housing_pi: FinancialDecimal = Field(ge=0)
    proposed_housing_tax_ins: FinancialDecimal = Field(ge=0)
    other_monthly_debt: FinancialDecimal = Field(ge=0)
    atr_documentation: dict[str, bool] = {}
    synthetic_credit_score: int | None = Field(default=None, ge=300, le=850)


class DecisionFactor(FiniteModel):
    name: str
    value: Scalar
    weight: FinancialDecimal
    threshold: Scalar | None = None
    passed: bool | None = None
    source: str
    # Preserve the comparison value separately from rounded presentation.
    raw_value: Scalar | None = None
    comparison_operator: Literal[">=", ">", "<", "=="] | None = None
    decline_threshold: FinancialDecimal | None = None
    decline_triggered: bool | None = None


class ReasonCode(FiniteModel):
    code: str
    factor: str
    message: str
    value: Scalar


class Decision(FiniteModel):
    vertical: Vertical
    outcome: Literal["approve", "decline", "review"]
    score: FinancialDecimal
    factors: list[DecisionFactor]
    reasons: list[ReasonCode]
    policy_version: str
    disclaimer: str = DISCLAIMER


class ExtractionField(FiniteModel):
    name: str
    value: str | FinancialDecimal | int | None
    confidence: FinancialDecimal = Field(ge=0, le=1)
    confirmed: bool = False
    source_line: str | None = None

    @field_validator("value", mode="before")
    @classmethod
    def reject_boolean_value(cls, value: JsonValue) -> JsonValue:
        if isinstance(value, bool):
            raise ValueError("Extracted financial values cannot be boolean")
        return value


class ExtractionResult(FiniteModel):
    fields: list[ExtractionField]
    measured_accuracy: FinancialDecimal | None = None
    disclaimer: str = DISCLAIMER


class SBASizeRow(FiniteModel):
    naics: str = Field(pattern=r"^[0-9]{6}$")
    measure: Literal["receipts_millions", "employees", "unsupported"]
    threshold: FinancialDecimal | None = Field(default=None, gt=0)
    source_effective_date: date
    synthetic_test_only: bool = False
    source_url: str | None = None
    source_sha256: str | None = Field(default=None, pattern=r"^[0-9a-f]{64}$")
    source_verified_through: date | None = None
    source_row: int | None = Field(default=None, ge=1)
    description: str = ""
    unsupported_reason: str | None = None

    @model_validator(mode="after")
    def validate_employee_threshold(self) -> Self:
        if self.measure == "unsupported":
            if self.threshold is not None or not self.unsupported_reason:
                raise ValueError("An unsupported standard requires a reason and no inferred threshold")
        elif self.threshold is None:
            raise ValueError("A supported standard requires a positive threshold")
        elif self.measure == "employees" and self.threshold != self.threshold.to_integral_value():
            raise ValueError("Employee size threshold must be a whole number")
        return self


class SBASizeEvidence(FiniteModel):
    basis: Literal[
        "receipts_three_completed_fiscal_year_average",
        "receipts_five_completed_fiscal_year_average",
        "employees_24_month_pay_period_average_ceiling",
    ]
    period_start: date
    period_end: date
    affiliates: Literal["included", "none"]
    source_reference: str = Field(min_length=1, max_length=500)

    @field_validator("source_reference")
    @classmethod
    def nonblank_source(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Size evidence requires a nonblank source reference")
        return value.strip()

    @model_validator(mode="after")
    def complete_measurement_period(self) -> Self:
        years = 2 if self.basis.startswith("employees") else 3 if "three" in self.basis else 5
        if self.period_start.day != 1:
            raise ValueError("Supported size evidence starts at a calendar-month boundary")
        try:
            end = self.period_start.replace(year=self.period_start.year + years) - timedelta(days=1)
        except ValueError as exc:
            raise ValueError("Unsupported size-evidence period") from exc
        if end != self.period_end:
            raise ValueError("Size evidence must cover the complete declared measurement period")
        return self


class SBACase(FiniteModel):
    schema_version: Literal["sba-screen-v2"] = "sba-screen-v2"
    assessment_as_of: date
    size_evidence: SBASizeEvidence
    borrower_name: str
    naics: str = Field(pattern=r"^[0-9]{6}$")
    annual_receipts_millions: ExactFinancialDecimal | None = Field(default=None, ge=0)
    employees: int | None = Field(default=None, ge=0)
    requested_loan: ExactFinancialDecimal = Field(gt=0)
    owner_liquid_resources: ExactFinancialDecimal = Field(default=Decimal("0"), ge=0)
    retirement_allowance: ExactFinancialDecimal = Field(default=Decimal("0"), ge=0)
    college_allowance: ExactFinancialDecimal = Field(default=Decimal("0"), ge=0)
    medical_allowance: ExactFinancialDecimal = Field(default=Decimal("0"), ge=0)
    global_dscr: ExactFinancialDecimal
    transaction_type: Literal["expansion", "acquisition", "buyout", "esop"] = "expansion"
    sop_version: Literal["8", "8.1"]

    @model_validator(mode="after")
    def supported_evidence(self) -> Self:
        evidence = self.size_evidence
        if evidence.period_end >= self.assessment_as_of:
            raise ValueError("Size evidence must end before the assessment date")
        if evidence.basis.startswith("employees"):
            latest_end = self.assessment_as_of.replace(day=1) - timedelta(days=1)
            if evidence.period_end != latest_end:
                raise ValueError("Employee evidence must cover the latest completed 24 calendar months")
            if self.employees is None or self.annual_receipts_millions is not None:
                raise ValueError(
                    "Employee evidence requires only the integer ceiling of the pay-period average"
                )
        else:
            if self.annual_receipts_millions is None or self.employees is not None:
                raise ValueError("Receipts evidence requires only average annual receipts in millions")
            try:
                next_year_end = evidence.period_end.replace(year=evidence.period_end.year + 1)
            except ValueError:
                next_year_end = evidence.period_end.replace(year=evidence.period_end.year + 1, day=28)
            if next_year_end < self.assessment_as_of:
                raise ValueError("Receipts evidence omits the latest completed fiscal year")
        return self


class SBACreditElsewhereScreen(FiniteModel):
    applied: bool
    passes: None
    reason: str
    excess_liquid_resources: ResultDecimal | None = None
    resource_indicator_below_requested: bool | None = None


class SBASizeSource(FiniteModel):
    effective_date: date
    verified_through: date | None
    url: str | None
    sha256: str | None = Field(pattern=r"^[0-9a-f]{64}$")
    row: int | None = Field(ge=1)
    synthetic_test_only: bool


class SBAScreenResult(FiniteModel):
    schema_version: Literal["sba-screen-result-v2"]
    borrower: str
    assessment_as_of: date
    sop_version: Literal["8", "8.1"]
    size_eligible: bool
    size_reason: str
    size_evidence: SBASizeEvidence
    size_standard_source: SBASizeSource
    policy_version: str
    credit_elsewhere: SBACreditElsewhereScreen
    global_dscr: ResultDecimal
    configured_global_dscr_floor: ResultDecimal
    coverage_pass: bool
    outcome: Literal["review_required", "screen_failed"]
    eligibility_status: Literal["incomplete"]
    unresolved_requirements: list[
        Literal[
            "lender_credit_elsewhere_determination",
            "industry_selection_and_affiliation_review",
            "alternative_size_standards_and_program_eligibility",
            "approved_lender_credit_policy",
        ]
    ] = Field(min_length=1)
    disclaimer: str
