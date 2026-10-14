# Approval proposal: exact financial contracts and verification

Target: `rishabbshankar226/Financial-Underwriting-tool` only.

This proposal is not implemented. The compatible audit patch is ready for
review; the complete production-hardening objective remains open. The user's
stop conditions require approval before breaking schema/API changes or adding
third-party dependencies.

## Evidence requiring a contract decision

`schemas.py:47-55`, `assessment_contracts.py:28-36`, and the scenario contracts
store financial values as floats. `core.py:67-79` subtracts these values before
coverage comparison. The executable `docs/precision_probe.py` demonstrates:

| Case | Current result | Exact decimal result |
| --- | --- | --- |
| `1000.30 - 1000.10 - 0.20` | `-6.822320486321587e-14` | `0.00` |
| `10000000000000000.01 - 10000000000000000.00` | `0.0` | `0.01` |
| `(300000.30 - 100000.10 - 50000.05) / 120000.12` | `1.2499999999999998`; review | `1.25`; approve under the same fixture policy |
| Reporting `2.675` to two places | `2.67` | HALF_EVEN `2.68` |

The browser also declares monetary fields as `number` in `contracts.ts:15-24`
and converts editor text through `Number` in `workspace.ts:173-174` and
`scenarioContracts.ts:156`. Changing only Python's calculator cannot preserve
exact amounts throughout input, storage, replay, editing, and reporting.

## Proposed financial changes

1. Introduce a versioned decimal financial contract. Amounts, rates, ownership,
   scores, ratios, shocks, thresholds, and financial trace operands use
   canonical decimal strings over JSON. Term months, revisions, indexes, and
   counts remain integers. Routes and CLI command names remain unchanged.
2. Use string-initialized `Decimal` throughout Python financial calculations,
   policy comparisons, projections, ingestion, and deterministic reference
   calculations. Use an isolated decimal context with `DivisionByZero`,
   `InvalidOperation`, and `Overflow` traps. Declare input precision and
   calculation limits, validate them before calculation, and reject unsupported
   values rather than underflowing or returning non-finite values.
3. Keep intermediate results at calculation precision. Apply explicit
   `ROUND_HALF_EVEN` only at reporting boundaries. Give reported constituent
   lines a documented deterministic residual-cent allocation so their sum
   equals the reported total; retain the original unrounded trace separately.
4. Replace infinity sentinels with an explicit unavailable coverage result.
   Zero denominators cannot pass a policy factor; negative denominators raise
   the common domain error. This changes the return contract of the affected
   Python helpers and therefore needs approval.
5. Replace browser financial `Number` operations with decimal-string handling
   and integer minor units for reporting. Convert percentages by decimal-place
   shifts and preserve the entered value through import, editing, requests,
   saved-write recovery, and display. No decimal-library dependency is proposed.
6. Version calculations, serialized financial contracts, and fingerprints.
   Preserve immutable v1 records and original retry receipts. Historical v1
   reads remain available; unsupported old replay definitions must be reported
   explicitly instead of being treated as matched under the new calculator.
   No in-place database rewrite or directory deletion is authorized here.
7. Reject unknown fields and boolean-as-money coercion at the new request
   boundary. Legacy compatibility must be explicit and tested rather than
   silently changing v1 records. Corrected v1 decisions may differ because the
   reported threshold misclassification is a confirmed bug.

For example, the new exact financial payload would contain:

```json
{
  "amount": "500000.00",
  "annual_rate": "0.0525",
  "term_months": 120
}
```

This is a fragment illustrating changed field types, not a complete request.
Current v1 payloads use JSON numbers. A lossless numeric-token codec could keep
those wire types, but would require a separate lossless browser parser and
serializer. Decimal strings are the smaller reviewable transport choice.

## Proposed verification dependencies

Add only these development tools, separately from runtime dependencies:

- `mypy==2.4.0`
- `ruff==0.17.0`

Both versions were verified with successful package-index lookups on
2026-10-14. Neither package has been installed or added to this repository.
Resolve and pin their transitive dependencies after approval. No Hypothesis
dependency is required: the existing pytest framework and fixed-seed generated
property checks can be extended without another package.

Required commands after installation and annotation cleanup:

```bash
python -m ruff check backend/app backend/tools backend/tests gate
python -m mypy --strict backend/app backend/tools
(cd frontend && ./node_modules/.bin/tsc --noEmit)
(cd backend && python -m pytest -q)
python gate/reference_calculator.py --selftest
(cd frontend && npm run build && npm run test:e2e)
```

New tests must first fail on the current precision defects, then verify exact
accounting identities, reconciliation after HALF_EVEN rounding, threshold
equality, trap behavior, bounded rates/terms, retained v1 reads/receipts, and
version-aware replay. Browser tests must verify exact editor/import/recovery
values end to end. A syntax check is not a substitute for linting or mypy.

## Separate remaining production work

- Saved-case routes have no caller authentication or authorization. An actual
  production access-control boundary must be specified and verified. ETags and
  operation UUIDs do not provide access control. Any new required credential
  header or session contract needs approval before implementation; this proposal
  does not introduce a login feature or request credentials.
- The SBA table is metadata-only. Load verified official dated rows and verify
  policy applicability before claiming SBA eligibility. This audit does not
  replace the empty table with guessed thresholds.
- Illustrative credit policy and the score require model validation beyond
  synthetic regression tests. Code tests do not provide regulatory certification.
- Playwright's matching Chromium download failed locally, but the full browser
  suite subsequently passed in GitHub CI: 161 tests on implementation commit
  `1e1aa1ae5bc35156e3e544fd5d1d09d4ffa75d0c`. Keep that working browser
  verification in place for the financial contract migration.

Approval requested now: the versioned decimal/schema and helper-return changes
above, plus the two pinned development verification dependencies. Approval to
advance to the lending simulator is not requested: this target remains open.
