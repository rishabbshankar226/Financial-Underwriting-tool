from __future__ import annotations

from datetime import date, datetime, timezone
from enum import Enum
from typing import Any, Literal
from math import fsum
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

DISCLAIMER = (
    "Prototype demonstration only. This output has not been validated for use in an actual "
    "lending decision. Use synthetic data only; this is not legal or compliance advice."
)

class FiniteModel(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)


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
    prior_value: Any | None = None
    new_value: Any
    source: SourceKind
    actor: str = "system"
    rationale: str
    at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("rationale")
    @classmethod
    def validate_rationale(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("A nonblank audit rationale is required")
        return value

class FinancialYear(FiniteModel):
    gross_receipts: float
    cogs: float
    operating_expense_excl_dna_interest_comp: float
    officer_compensation: float
    depreciation: float
    amortization: float
    interest_expense: float = Field(ge=0)
    section_179: float = 0
    k1_distribution: float = 0

class ExistingDebt(FiniteModel):
    cpltd_annual: float = Field(ge=0)
    operating_lease_annual: float = Field(default=0, ge=0)

class ProposedLoan(FiniteModel):
    amount: float = Field(ge=0)
    annual_rate: float = Field(ge=0)
    term_months: int = Field(gt=0)

class Guarantor(FiniteModel):
    name: str = "Synthetic Guarantor"
    ownership_percentage: float = Field(default=1.0, ge=0, le=1)
    wages: float = 0
    interest_dividend_income: float = 0
    mortgage_pi_annual: float = Field(default=0, ge=0)
    auto_loan_annual: float = Field(default=0, ge=0)
    credit_card_min_annual: float = Field(default=0, ge=0)

class WorkingCapital(FiniteModel):
    ar_increase: float = 0
    inventory_increase: float = 0
    ap_increase: float = 0
    cash_taxes_paid: float = 0

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
    def validate_total_ownership(self):
        if fsum(g.ownership_percentage for g in self.guarantors) > 1.0 + 1e-9:
            raise ValueError("Total guarantor ownership cannot exceed 100%")
        return self


class ConsumerRequest(FiniteModel):
    applicant_name: str
    geography: str
    gross_monthly_income: float = Field(gt=0)
    proposed_housing_pi: float = Field(ge=0)
    proposed_housing_tax_ins: float = Field(ge=0)
    other_monthly_debt: float = Field(ge=0)
    atr_documentation: dict[str, bool] = {}
    synthetic_credit_score: int | None = Field(default=None, ge=300, le=850)

class DecisionFactor(FiniteModel):
    name: str
    value: float | str | bool
    weight: float
    threshold: float | str | bool | None = None
    passed: bool | None = None
    source: str
    # Preserve the comparison value separately from rounded presentation.
    raw_value: float | str | bool | None = None
    comparison_operator: Literal[">=", ">", "<", "=="] | None = None
    decline_threshold: float | None = None
    decline_triggered: bool | None = None

class ReasonCode(FiniteModel):
    code: str
    factor: str
    message: str
    value: float | str | bool

class Decision(FiniteModel):
    vertical: Vertical
    outcome: Literal["approve", "decline", "review"]
    score: float
    factors: list[DecisionFactor]
    reasons: list[ReasonCode]
    policy_version: str
    disclaimer: str = DISCLAIMER

class ExtractionField(FiniteModel):
    name: str
    value: str | float | int | None
    confidence: float = Field(ge=0, le=1)
    confirmed: bool = False
    source_line: str | None = None

class ExtractionResult(FiniteModel):
    fields: list[ExtractionField]
    measured_accuracy: float | None = None
    disclaimer: str = DISCLAIMER

class SBASizeRow(FiniteModel):
    naics: str = Field(pattern=r"^[0-9]{6}$")
    measure: Literal["receipts_millions", "employees"]
    threshold: float = Field(gt=0)
    source_effective_date: date
    synthetic_test_only: bool = False

    @model_validator(mode="after")
    def validate_employee_threshold(self):
        if self.measure == "employees" and not self.threshold.is_integer():
            raise ValueError("Employee size threshold must be a whole number")
        return self

class SBACase(FiniteModel):
    borrower_name: str
    naics: str = Field(pattern=r"^[0-9]{6}$")
    annual_receipts_millions: float | None = Field(default=None, ge=0)
    employees: int | None = Field(default=None, ge=0)
    requested_loan: float = Field(gt=0)
    owner_liquid_resources: float = Field(default=0, ge=0)
    retirement_allowance: float = Field(default=0, ge=0)
    college_allowance: float = Field(default=0, ge=0)
    medical_allowance: float = Field(default=0, ge=0)
    global_dscr: float
    transaction_type: Literal["expansion", "acquisition", "buyout", "esop"] = "expansion"
    sop_version: Literal["8", "8.1"]
