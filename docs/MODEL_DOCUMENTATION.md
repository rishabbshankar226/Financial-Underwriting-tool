# Spreadline model documentation

**Status:** deterministic software verified for the documented scope; default
credit policies are illustrative and not independently validated for lending.
**Documentation date:** 2026-10-15.

## Intended use and limits

Spreadline demonstrates deterministic financial spreading, coverage calculations, configurable policy checks, factor-linked reason codes, and analyst overrides for commercial, SBA, and consumer workflows. It is not a production credit model, not a probability-of-default model, and not approved for real lending decisions.

This document follows the three model-risk pillars of SR 11-7: development, independent validation and governance. The Federal Reserve issued **SR 26-2, Revised Guidance on Model Risk Management, on April 17, 2026**, and it supersedes SR 11-7. SR 26-2 is therefore treated as the current source, and the three pillars serve as a crosswalk.

Sources:
- Federal Reserve SR 26-2: https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm
- Legacy SR 11-7 attachment: https://www.federalreserve.gov/boarddocs/srletters/2011/sr1107a1.pdf

## 1. Development and implementation

The arithmetic core in `backend/app/core.py` is pure and deterministic. Document extraction is isolated in `backend/app/ingestion.py`; unconfirmed fields do not cross the arithmetic boundary. Policy thresholds are centralized in `backend/app/config.py`.

Key definitions match the independent reference calculator in `gate/reference_calculator.py`: EBITDA add-backs, proposed-loan amortization, UCA-style cash flow, DSCR, FCCR, global DSCR, K-1 history, and consumer DTI.

The current calculator uses isolated 96-digit Decimal contexts and exact policy
comparisons. Raw amounts and reporting allocations remain separate. HALF_EVEN
reporting and deterministic residual-cent allocation reconcile source rows,
additive traces and guarantor aggregates. The independent calculator uses an
80-digit context and an algebraically different annuity expression. These are
finite-precision implementations with explicit domains, not symbolic arithmetic.

Read-only analysis (`commercial-analysis-v1`; see [ANALYSIS_CONTRACT.md](ANALYSIS_CONTRACT.md))
derives several views from a completed assessment:
- common-size and change-versus-prior spreads;
- policy debt capacity and its binding constraint;
- EBITDA and revenue breakevens;
- a cent amortization schedule;
- a coverage sensitivity grid;
- a plain-language explanation that must agree with the recorded decision.

**What the analysis is not:**
- Debt capacity is arithmetic against configured policy minimums, not an
  approval or a recommended loan size.
- Cushions hold every other input fixed.
- The grid reuses the stress-preview definitions and is not a forecast.

**How it is checked:** the independent calculator implements each analysis
family separately, and tests compare every pinned value to 1e-24 (schedules to
the exact cent).

## 2. Validation / effective challenge

`gate/reference_calculator.py` is never imported by application code. Its pinned values give an outside check on the arithmetic, and its mutation tests confirm those checks catch common formula errors. The backend tests rebuild the fixture inputs and compare their outputs to its expected values.

This does **not** validate predictive power, calibration, production data quality, legal compliance, document OCR, disparate impact, cybersecurity, or operational resilience. Independent production validation must be performed by qualified reviewers outside the development team.

## 3. Deployment governance and monitoring

Production monitoring would need input drift/missingness; override rates and reasons; ratio/reason-code reconciliation; approval/adverse-action outcomes; fair-lending analysis using real applicant data with qualified statistical/legal review; policy-source change control; and access/security monitoring.

## Explainability / adverse action

Regulation B §1002.9 requires specific reasons tied to factors actually considered. The decision engine stores factor name, value, weight, threshold, pass/fail state, and source. `ReasonCode` is generated from failed or unavailable stored factors; unavailable values carry manual-review explanations, and no disconnected static denial list is used.

Current source: https://www.consumerfinance.gov/rules-policy/regulations/1002/9/

Internal reasons record exact raw comparisons, policy versions, commercial
decline triggers, and unavailable factors with manual-review explanations. They
are explanation records, not legally validated applicant notices. Optional
saved cases retain immutable server-derived events and original receipts.
HTTP routes require an authenticated operator credential before processing. New
events record its server-configured identity; original archived actors and
receipt bytes are preserved. Credential identity is not independently verified
human identity. See [the implemented access contract](PRODUCTION_CONTRACT_APPROVAL.md).

If a synthetic credit-file input participates in a consumer decision, documentation flags that a real system using consumer-report information may trigger parallel FCRA notice obligations. Spreadline performs no bureau pull.

## Consumer ATR/QM boundary

The historical 43% General QM DTI cap was replaced by a price-based General QM definition. Spreadline treats 43% only as a configurable **review boundary**, not a legal ceiling. Fixture C at exactly 43% resolves to **review**.

Current source: https://www.consumerfinance.gov/rules-policy/regulations/1026/43/

## SBA sources and data limitation

SOP 50 10 8 is effective June 1, 2025. SBA publishes SOP 50 10 8.1 as effective October 1, 2026. Source: https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs

The official workbook effective March 17, 2023 is bundled with its exact hash
and verified through October 15, 2026. The loader supports 850 unambiguous rows
and explicitly refuses 128 footnoted/exception/unsupported rows. Strict dated
measurement and affiliate evidence is required. Passing size and configured
coverage screens still returns incomplete eligibility; supplied owner-resource
arithmetic cannot establish credit elsewhere. Source provenance, supported
periods and complete examples are in [SBA_SCREENING.md](SBA_SCREENING.md).

## Fair-lending harness

`geography_proxy_self_test` varies geography while holding all credit inputs constant and records the outcome-rate gap. Geography reaches the decision request but currently receives zero decision weight. This is an illustrative synthetic regression harness, not a certified disparate-impact analysis.
