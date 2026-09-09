# Spreadline final self-report

## 1. What works end to end

- FastAPI health endpoint and typed request models.
- Deterministic commercial spread: ordinary business income, EBITDA, amortized proposed debt service, UCA-style cash flow, DSCR, FCCR, global DSCR, K-1 history.
- Consumer front/back DTI and ATR-document checklist logic.
- SBA version switch, injectable dated NAICS size table, credit-elsewhere/personal-resource screen, configurable global DSCR floor.
- Factor-linked decisions and reason codes.
- Structured JSON/CSV ingestion and deterministic synthetic-text extraction with confidence + human-confirmation boundary.
- React deal-workspace prototype with synthetic fixture selection, spread review, rationale-required overrides, ratio summary, memo, and audit trail.
- Synthetic geography fairness regression harness.

Phase-5 walkthrough represented in the UI: Alpine Fabrication → fixture selection → spread review → coverage metrics → generated memo; any edited row records the old/new value and required rationale in the audit view.

## 2. Gate and CI result

The supplied `gate/reference_calculator.py` is committed verbatim. `python3 gate/reference_calculator.py --selftest` passed locally on 2026-09-08: **18 fixture values, 2 flags, and all 7 mutations killed**. Backend tests independently match the pinned commercial and consumer outputs.

GitHub Actions re-ran the independent gate, backend tests, a high-severity npm dependency audit, and the React production build after the final compliance restore; all jobs passed.

Fixture C is exactly 43.00% back-end DTI. The prototype policy sets 43% as a review boundary and 50% as an illustrative decline boundary, so fixture C resolves to **review**. This is explicitly not represented as the legal General QM rule.

## 3. Stubs / simplifications

- FCCR uses the prompt's simplified EBITDA / (debt service + operating lease) definition; there is no capex or cash-tax adjustment.
- UCA is the prompt's simplified working-capital version, not a full UCA statement.
- Fair-lending harness is synthetic-only and cannot establish disparate impact.
- Extraction is a deterministic fixture parser, not production OCR/IDP.
- No live bureau, payment, bank, tax, or external financial-data connection exists.
- Security controls are architectural notes, not implemented GLBA certification.
- The decision score is illustrative and unvalidated; it is not PD calibration.

## 4. Requirements not fully satisfied

1. **Current full SBA size-standard table:** the official SBA data landing page and current workbook were identified, but the build environment could not retrieve the binary workbook. Rather than guess thresholds, the shipped table contains source metadata and zero production rows; production SBA eligibility fails closed until an official dated table is loaded. Tests use rows explicitly marked synthetic-test-only.
2. **Full PDF/image OCR fixture suite:** the extraction path is implemented against deterministic synthetic text fixtures. Production-like OCR/image extraction is not claimed. This is the largest Phase-4 scope gap.
3. **Independent model validation:** impossible for the model-development session to provide independent validation; the documentation names this gap.

The local sandbox could not fetch npm packages during the original Phase-5 check, but this is no longer an unresolved frontend-validation gap: GitHub Actions subsequently installed the dependencies, passed the high-severity audit step, and completed the React production build successfully.

## 5. Configuration versus formula constants

`backend/app/config.py` contains versioned prototype policy values: commercial DSCR/FCCR/global floors, consumer review/decline DTI boundaries, extraction confidence, K-1 stability band, SBA effective dates, and illustrative SBA DSCR floors. Arithmetic definitions remain in pure functions under `backend/app/core.py`.

## 6. Current-source correction discovered during build

The control prompt describes SR 11-7 as the model-risk framework. The Federal Reserve's SR 26-2, issued April 17, 2026, explicitly supersedes SR 11-7. The implementation keeps the requested development/validation/governance crosswalk while documenting SR 26-2 as current rather than silently repeating the stale citation.

## 7. Existing repository content

The repository contained one pre-existing file: `.gitattributes` with LF normalization. It was **kept unchanged**. All Spreadline files were added around it; nothing pre-existing was replaced.

## 8. Session/integration quirk observed

The GitHub connection initially exposed the user profile but no repository installation, returning 404 for the private target repository. After repository access was granted, the repository became visible with push/admin permission. This is a connection/access limitation worth planning for in future prompt revisions.
