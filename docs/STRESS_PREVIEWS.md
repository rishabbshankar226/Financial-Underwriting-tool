# Commercial stress previews

A preview applies hypothetical changes to the latest operating period of a saved dated commercial assessment. It returns projected current facts under the baseline's retained policy. The original assessment, observed financial periods and K-1 history remain available as baseline evidence.

This API does not save scenarios or change a case's head revision. The browser's **Scenarios** view authors and reviews these previews, then retains a reviewed batch through the separate comparison endpoint. These calculations use the prototype's existing financial definitions and are not a complete forecast; see the [model limits](MODEL_DOCUMENTATION.md).

The browser binds a preview to the selected original revision, the ordered
normalized command, and the draft's generation. Editing any name, rationale or
shock, or adding/removing a row, requires a fresh explicit preview, including
when text is changed back to its earlier value. A delayed preview cannot become
current after a draft or baseline change. Percentage controls convert display
percentages once; basis-point controls pass basis points unchanged. The browser
formats server results and validates references without financial arithmetic.

Browser comparison responses are limited to 16,777,216 actual streamed bytes,
regardless of `Content-Length`, and finite JSON depth 100. This is a client read
limit; it does not introduce a response cap in the backend preview API. Existing
case-response guards retain their depth limit of 64.

To retain the final reviewed batch, use the separate [saved comparison contract](SCENARIO_COMPARISONS.md) with this preview's fingerprint and a write-operation UUID.

## Select the baseline

Enable local [case storage](CASE_STORAGE.md), save a dated commercial case, and read its selected revision. The preview requires that revision's case ID and run ID:

```text
POST /cases/{case_id}/revisions/{revision}/scenarios/preview
```

The trailing-slash form accepts the same request. Use `Content-Type: application/json`. A successful preview returns HTTP 200 with `persisted: false`; it has no accepted-write receipt. `If-Match` and `Idempotency-Key` are unnecessary because the request reads an explicit immutable revision.

The stored schema, calculation and serialization definitions must be supported, the stored assessment must be well formed, and replay under its recorded policy must match. An unsupported or unreproducible result can still be read through the existing case API. The preview never substitutes the current head or current default policy.

## Request

Replace `<stored_run_id>` with the selected revision's UUID. All four assumptions are required, including zero changes:

```json
{
  "schema_version": "commercial-scenario-preview-v1",
  "baseline_run_id": "<stored_run_id>",
  "scenarios": [
    {
      "scenario_key": "revenue-down-10",
      "name": "Revenue down 10%",
      "rationale": "Other assumptions held fixed",
      "assumptions": {
        "revenue_change": -0.1,
        "cogs_change": 0,
        "operating_expense_change": 0,
        "proposed_rate_change_bps": 0
      }
    }
  ]
}
```

| Assumption | Target | Calculation |
|---|---|---|
| `revenue_change` | Latest gross receipts | Baseline amount × (1 + decimal change) |
| `cogs_change` | Latest cost of goods sold | Baseline amount × (1 + decimal change) |
| `operating_expense_change` | Latest operating expense excluding D&A, interest and officer compensation | Baseline amount × (1 + decimal change) |
| `proposed_rate_change_bps` | Proposed loan's nominal annual rate | Baseline decimal rate + basis points / 10,000 |

The three percentage changes must be at least −1. Their baseline target amounts must all be nonnegative, even for a zero-shock preview. A zero target stays zero. Fractional basis points are supported; the resulting annual rate must be between 0 and 1 inclusive. There is no additional percentage ceiling, but projected inputs, intermediate calculations, deltas and headroom must all remain within the finite calculation contract.

Each scenario starts from the same baseline. Request order controls response order, and one invalid scenario rejects the whole batch without partial results.

Limits:

- 1–10 scenarios with distinct keys matching `[A-Za-z0-9_-]{1,64}`.
- Trimmed nonblank names up to 120 characters and rationales up to 2,000 characters.
- 1,000,000 actual streamed request bytes. The byte limit does not trust `Content-Length` and stops reading when exceeded.
- Strict fields and finite JSON numbers: unknown fields, duplicate object keys, numeric strings, booleans in numeric fields and non-finite tokens are rejected.

## Held-fixed assumptions

Officer compensation, depreciation, amortization, existing interest, Section 179 and K-1 distributions stay fixed. So do existing debt, CPLTD, operating leases, proposed principal and term, guarantor ownership/outside income/personal debt, working-capital movements and cash taxes.

The projected ordinary business income and EBITDA flow through the same current coverage, guarantor and UCA calculations used by the dated assessment. Existing interest is held fixed when the proposed rate changes. K-1 distribution ratios and the history factor come from the original observed periods; negative projected income does not replace or recalculate that history.

## Response evidence

The envelope includes the complete original assessment and its case/revision/run identity and hashes, selected period, assumptions date, units, retained policy, versions, held-fixed assumptions and disclaimer. Each scenario includes its normalized command, projection inputs, current facts, guarantor contributions, decision, calculation trace and comparisons. Its coverage basis is `stressed_latest_period_current_pro_forma`.

Numeric comparisons use raw values: `delta = projected − baseline`. Coverage headroom is the raw ratio minus its approval threshold or decline floor. UCA headroom is raw cash flow minus its approval floor, with the original strict `>` operator: zero headroom does not pass. Unavailable metrics have null values/headroom; a delta is null with an explanation when either side is unavailable. The frozen K-1 category has a factor comparison rather than numeric headroom.

Factor comparisons retain both decisions' raw values, operators and boundaries. Outcome and reason changes identify what changed, including added, removed or changed reasons. Rounded display values never determine a policy outcome.

Trace fact IDs distinguish `baseline.*` from `projection.*`. Baseline trace rows retain their original numeric operands. Assumption rows show the baseline input, shock and projected value. Input references resolve against a scenario context containing the scenario fields plus the envelope's `baseline` and `policy_snapshot`; projected operating and loan inputs live under `/projection_inputs`.

The preview fingerprint uses SHA-256 over compact sorted-key UTF-8 JSON containing baseline case/revision/run identity, baseline payload hash, normalized command, retained policy and versions. The versions are `commercial-scenario-preview-v1`, `commercial-scenario-definition-v1`, `scenario-preview-json-v1` and the unchanged `commercial-calculation-v1`. It contains no new timestamp or randomly generated ID. Repeating the same request against the same stored baseline produces the same response and fingerprint.

## Errors

| HTTP status | Meaning |
|---|---|
| 400 | Malformed case/run UUID or revision locator |
| 404 | Selected case or revision does not exist |
| 409 | `baseline_run_mismatch`, `baseline_unsupported`, `baseline_replay_mismatch` or `baseline_replay_unavailable` |
| 413 | Actual request stream exceeds the byte limit |
| 422 | Invalid command, negative percentage-target baseline (`scenario_baseline`) or unsupported projected calculation (`scenario_invalid`) |
| 503 | Storage is unconfigured, missing, busy, unreadable or fails integrity checks |

Storage errors use the existing case error envelope; busy storage includes `Retry-After: 1`. Errors remain readable by the allowed local browser origins. A preview opens an existing store in read-only mode and never initializes, repairs or migrates it.

The live OpenAPI document at `/docs` describes the complete request and response. Run the [verification workflow](VERIFICATION.md) to check arithmetic, strict requests, trace references, concurrent edits, unchanged stored records and historical previews after restore.
