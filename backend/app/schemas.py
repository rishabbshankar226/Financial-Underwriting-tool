from __future__ import annotations

from datetime import UTC, date, datetime
from decimal import Decimal
from enum import Enum
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, JsonValue, field_validator, model_validator

from .finance import FinancialDecimal, Scalar, decimal_sum

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
    measure: Literal["receipts_millions", "employees"]
    threshold: FinancialDecimal = Field(gt=0)
    source_effective_date: date
    synthetic_test_only: bool = False

    @model_validator(mode="after")
    def validate_employee_threshold(self) -> Self:
        if self.measure == "employees" and self.threshold != self.threshold.to_integral_value():
            raise ValueError("Employee size threshold must be a whole number")
        return self


class SBACase(FiniteModel):
    borrower_name: str
    naics: str = Field(pattern=r"^[0-9]{6}$")
    annual_receipts_millions: FinancialDecimal | None = Field(default=None, ge=0)
    employees: int | None = Field(default=None, ge=0)
    requested_loan: FinancialDecimal = Field(gt=0)
    owner_liquid_resources: FinancialDecimal = Field(default=Decimal("0"), ge=0)
    retirement_allowance: FinancialDecimal = Field(default=Decimal("0"), ge=0)
    college_allowance: FinancialDecimal = Field(default=Decimal("0"), ge=0)
    medical_allowance: FinancialDecimal = Field(default=Decimal("0"), ge=0)
    global_dscr: FinancialDecimal
    transaction_type: Literal["expansion", "acquisition", "buyout", "esop"] = "expansion"
    sop_version: Literal["8", "8.1"]
