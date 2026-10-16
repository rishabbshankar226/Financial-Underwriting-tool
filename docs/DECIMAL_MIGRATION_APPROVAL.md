# Approved Decimal migration record

Target: `rishabbshankar226/Financial-Underwriting-tool` only.

The user continued after reviewing this proposal, authorizing the versioned
financial contracts, helper return changes, and the two named development
dependencies. That scope is implemented. This record does not authorize another
repository, a new identity contract, or a main-branch merge.

## Demonstrated defects and corrected behavior

Baseline: `1b59a90f715853a41c5791edf6dce03c1a77839e`.

| Case | Baseline observation | Current result |
| --- | --- | --- |
| `1000.30 - 1000.10 - 0.20` | `-6.822320486321587e-14` | `0.00` |
| `10000000000000000.01 - 10000000000000000.00` | `0.0` | `0.01` |
| Exact DSCR of `1.25` at the configured approval boundary | `1.2499999999999998`; review | `1.25`; approve for the same fixture policy |
| Reporting `2.675` to cents | `2.67` | HALF_EVEN `2.68` |

`docs/precision_probe.py` now asserts all four corrected results. Tests also
cover numeric tokens, generated ledgers, reporting reconciliation, context/thread
isolation, archives, replay and browser presentation.

## Implemented contract

1. Money, rates, ownership, ratios, weights, thresholds, shocks, scores and
   financial trace values serialize as decimal strings. Counts, months,
   revisions and input credit-score integers remain integers. Route paths and
   CLI command names are preserved.
2. Python financial operations use string-initialized Decimal in fresh 96-digit
   contexts. DivisionByZero, InvalidOperation, Overflow and Underflow are
   trapped. Inputs have 34 significant digits and a declared magnitude range.
   Unsupported values and calculations fail explicitly.
3. Raw intermediates remain separate from reported values. HALF_EVEN reporting
   and deterministic signed residual allocation reconcile annual source rows,
   additive trace operands and guarantor aggregates.
4. Coverage helpers return Decimal or `None` for zero debt service. Unavailable
   ratios cannot pass a factor. Negative denominators fail.
5. Browser financial values use strings and BigInt presentation helpers.
   Percentage conversion shifts decimal places. Import text reaches the server
   unchanged.
6. New assessments/scenarios carry v2 identities. SQL schemas and storage
   wrappers retain their existing versions. Frozen v1 records, hashes, commands
   and original receipt bytes remain untouched and readable. Unsupported v1
   calculator replay is explicit; archived v1 assessments are read-only.
7. Financial requests reject unknown fields, non-finite values and boolean
   money. HTTP numeric tokens are captured before float decoding. Direct v2
   callers use strings, Decimal or exact integers. Legacy decoded v1 numbers
   have one explicit compatibility conversion.

## Approved verification tools

Only `mypy==2.4.0` and `ruff==0.17.0` were added as direct development
dependencies. Their resolved transitive packages are pinned in
`backend/constraints-dev-py312.txt`. Existing pytest and TestClient packages
moved to development requirements. No runtime package was added. Generated
property checks use pytest and standard-library facilities.

Strict mypy covers application modules, storage CLI and the independent
reference calculator. Ruff covers application, tools, backend tests and gate.
The frontend retains strict TypeScript and unused-variable checks. Executed
commands and results are in [verification](VERIFICATION.md).

## Subsequent approved contract

The original Decimal proposal excluded authentication/session changes. The user
subsequently approved the concrete single-operator access and stricter SBA
evidence/result contract. Both are implemented and verified by full CI; see
[the approval record](PRODUCTION_CONTRACT_APPROVAL.md). Independent institutional
credit-policy/model approval remains separate from software test success.
