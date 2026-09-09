from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal
from pydantic import BaseModel, Field

DISCLAIMER = (
    "Prototype demonstration only. This output has not been validated for use in an actual "
    "lending decision. Use synthetic data only; this is not legal or compliance advice."
)

class Vertical(str, Enum):
    commercial = "commercial"
    sba = "sba"
    consumer = "consumer"

class SourceKind(str, Enum):
    parser = "parser"
    model = "model"
    human_override = "human_override"
    deterministic = "deterministic"

class AuditEvent(BaseModel):
    field: str
    prior_value: Any | None = None
    new_value: Any
    source: SourceKind
    actor: str = "system"
    rationale: str
    at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FinancialYear(BaseModel):
    gross_receipts: float
    cogs: float
    operating_expense_excl_dna_interest_comp: float
    officer_compensation: float
    depreciation: float
    amortization: float
    interest_expense: float
    section_179: float = 0
    k1_distribution: float = 0

class ExistingDebt(BaseModel):
    cpltd_annual: float
    operating_lease_annual: float = 0

class ProposedLoan(BaseModel):
    amount: float
    annual_rate: float
    term_months: int

class Guarantor(BaseModel):
    name: str = "Synthetic Guarantor"
    ownership_percentage: float = Field(default=1.0, ge=0, le=1)
    wages: float = 0
    interest_dividend_income: float = 0
    mortgage_pi_annual: float = 0
    auto_loan_annual: float = 0
    credit_card_min_annual: float = 0

class WorkingCapital(BaseModel):
    ar_increase: float = 0
    inventory_increase: float = 0
    ap_increase: float = 0
    cash_taxes_paid: float = 0

class CommercialRequest(BaseModel):
    borrower_name: str
    geography: str
    years: list[FinancialYear]
    existing_debt: ExistingDebt
    proposed_loan: ProposedLoan
    guarantors: list[Guarantor] = []
    working_capital: WorkingCapital
    overrides: list[AuditEvent] = []

class ConsumerRequest(BaseModel):
    applicant_name: str
    geography: str
    gross_monthly_income: float
    proposed_housing_pi: float
    proposed_housing_tax_ins: float
    other_monthly_debt: float
    atr_documentation: dict[str, bool] = {}
    synthetic_credit_score: int | None = Field(default=None, ge=300, le=850)

class DecisionFactor(BaseModel):
    name: str
    value: float | str | bool
    weight: float
    threshold: float | str | bool | None = None
    passed: bool | None = None
    source: str

class ReasonCode(BaseModel):
    code: str
    factor: str
    message: str
    value: float | str | bool

class Decision(BaseModel):
    vertical: Vertical
    outcome: Literal["approve", "decline", "review"]
    score: float
    factors: list[DecisionFactor]
    reasons: list[ReasonCode]
    disclaimer: str = DISCLAIMER

class ExtractionField(BaseModel):
    name: str
    value: str | float | int | None
    confidence: float = Field(ge=0, le=1)
    confirmed: bool = False
    source_line: str | None = None

class ExtractionResult(BaseModel):
    fields: list[ExtractionField]
    measured_accuracy: float | None = None
    disclaimer: str = DISCLAIMER

class SBASizeRow(BaseModel):
    naics: str
    measure: Literal["receipts_millions", "employees"]
    threshold: float
    source_effective_date: str
    synthetic_test_only: bool = False

class SBACase(BaseModel):
    borrower_name: str
    naics: str
    annual_receipts_millions: float | None = None
    employees: int | None = None
    requested_loan: float
    owner_liquid_resources: float = 0
    retirement_allowance: float = 0
    college_allowance: float = 0
    medical_allowance: float = 0
    global_dscr: float
    transaction_type: str = "expansion"
    sop_version: Literal["8", "8.1"] = "8"
