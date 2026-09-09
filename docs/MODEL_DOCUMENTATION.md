# Spreadline model documentation

**Status:** prototype / synthetic data only / not independently validated.  
**Documentation date:** 2026-09-08.

## Intended use and limits

Spreadline demonstrates deterministic financial spreading, coverage calculations, configurable policy checks, factor-linked reason codes, and analyst overrides for commercial, SBA, and consumer workflows. It is not a production credit model, not a probability-of-default model, and not approved for real lending decisions.

The control prompt asked for a miniature treatment of the three governance pillars associated with SR 11-7. Current-source review found that the Federal Reserve issued **SR 26-2, Revised Guidance on Model Risk Management, on April 17, 2026, and states that it supersedes SR 11-7**. This document preserves the requested development / independent validation / governance structure as a crosswalk while treating SR 26-2 as the current Federal Reserve source.

Sources:
- Federal Reserve SR 26-2: https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm
- Legacy SR 11-7 attachment: https://www.federalreserve.gov/boarddocs/srletters/2011/sr1107a1.pdf

## 1. Development and implementation

The arithmetic core in `backend/app/core.py` is pure and deterministic. Document extraction is isolated in `backend/app/ingestion.py`; unconfirmed fields do not cross the arithmetic boundary. Policy thresholds are centralized in `backend/app/config.py`.

Key definitions match the supplied independent gate: EBITDA add-backs, proposed-loan amortization, UCA-style cash flow, DSCR, FCCR, global DSCR, K-1 history, and consumer DTI.

## 2. Validation / effective challenge

The independent `gate/reference_calculator.py` is never imported by application code. Its pinned values and mutations form an external arithmetic check. Application tests independently recreate fixture inputs and compare outputs to the gate's expected values.

This does **not** validate predictive power, calibration, production data quality, legal compliance, document OCR, disparate impact, cybersecurity, or operational resilience. Independent production validation must be performed by qualified reviewers outside the development team.

## 3. Governance and monitoring sketch

Production monitoring would need input drift/missingness; override rates and reasons; ratio/reason-code reconciliation; approval/adverse-action outcomes; fair-lending analysis using real applicant data with qualified statistical/legal review; policy-source change control; and access/security monitoring.

## Explainability / adverse action

Regulation B §1002.9 requires specific reasons tied to factors actually considered. The decision engine stores factor name, value, weight, threshold, pass/fail state, and source. `ReasonCode` is generated only from failed stored factors; no disconnected static denial list is used.

Current source: https://www.consumerfinance.gov/rules-policy/regulations/1002/9/

If a synthetic credit-file input participates in a consumer decision, documentation flags that a real system using consumer-report information may trigger parallel FCRA notice obligations. Spreadline performs no bureau pull.

## Consumer ATR/QM boundary

The historical 43% General QM DTI cap was replaced by a price-based General QM definition. Spreadline treats 43% only as a configurable **review boundary**, not a legal ceiling. Fixture C at exactly 43% resolves to **review**.

Current source: https://www.consumerfinance.gov/rules-policy/regulations/1026/43/

## SBA sources and data limitation

SOP 50 10 8 is effective June 1, 2025. SBA publishes SOP 50 10 8.1 as effective October 1, 2026. Source: https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs

SBA's size-standards landing page identifies a current workbook effective March 17, 2023. The build environment identified but could not retrieve that workbook, so `backend/data/sba_size_standards.json` intentionally contains **no guessed thresholds** and the evaluator fails closed when a NAICS row is missing. Source: https://data.sba.gov/dataset/small-business-size-standards

## Fair-lending harness

`geography_proxy_self_test` varies geography while holding all credit inputs constant and records the outcome-rate gap. Geography reaches the decision request but currently receives zero decision weight. This is an illustrative synthetic regression harness, not a certified disparate-impact analysis.
