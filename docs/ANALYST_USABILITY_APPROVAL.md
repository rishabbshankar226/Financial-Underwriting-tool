# Approved analyst usability record

Target: `rishabbshankar226/Financial-Underwriting-tool` only.

## What was approved

On 2026-10-16 the user asked for the underwriting tool to be made easier to use
for financial professionals, through extensive UI/UX and backend improvements.
The user approved the resulting implementation plan after making four choices:

- backend changes are additive only;
- the workspace defaults to a light theme, with a dark toggle;
- exports are CSV plus a print-ready memo, with no new dependencies;
- memo commentary is kept in the browser tab.

This record covers that scope. It is delivered as six pull requests, and each
is merged only with the user's explicit approval.

It does not authorize:
- a dependency or a storage-schema change;
- work in another repository;
- credit-policy approval.

## Frozen contracts (unchanged)

- **Assessment and calculation.** `commercial-assessment-v2`,
  `commercial-calculation-v2` and `assessment-json-v2` keep their inputs,
  arithmetic, accepted values, decision reason wording and `PolicyConfig`.
- **Saved-case storage.** The `case-json-v1` wrappers and SQLite schema v2 are
  unchanged, and so are the bytes of stored records, hashes, commands and
  receipts. Every saved v2 case keeps replaying as `matched`.
- **Scenarios and archives.** The scenario preview and comparison v2 contracts
  are unchanged. Archived v1 records stay read-only.
- **Access.** The single-operator access contract is unchanged. The browser
  credential is still entered manually and kept only in page memory.

## Approved additive backend contracts

| Identifier | Surface |
| --- | --- |
| `commercial-analysis-v1`, `commercial-analysis-definition-v1`, `analysis-json-v1` | Two routes. `POST /commercial/analysis` is stateless and uses the current policy. `POST /cases/{case_id}/revisions/{revision}/analysis` is read-only and uses the retained policy, after replay verification. The analysis provides: common-size and change versus prior; debt capacity at the policy approval minimums, with the binding constraint; EBITDA and revenue breakevens; a cent-rounded amortization schedule; a revenue × rate sensitivity grid built from the existing scenario definitions; and a plain-language decision explanation. Responses carry the fingerprint of the analyzed assessment, persist nothing and never change a decision. |
| `field-errors-v1` | An additional `errors` envelope on 422 contract responses and on rejected saved edits and scenarios. Each entry has a JSON Pointer, a code, a plain message and a limit. The existing `detail` body is unchanged. |
| `case-listing-v2` with a version 2 cursor | `GET /cases` gains optional `q`, `outcome` and `sort=created\|updated` parameters. Summary rows gain outcome, reported DSCR, requested amount, as-of date and definition support. These new fields are null for archived definitions. The default listing and version 1 cursors are unchanged. No schema change. |

Design decisions approved with the plan:

- **Debt capacity** reports the DSCR, FCCR and global DSCR constraints and
  identifies the binding one. Derived capacity is policy arithmetic, not an
  approval.
- **Sensitivity grid.** A cell is reported as not applicable when its shocked
  rate falls outside [0, 1]. The whole grid is reported as not applicable when
  the latest-period target amounts are negative.
- **Case search** is case-insensitive for ASCII only.
- **`GET /policy`** is deferred.

## Approved workspace behavior changes

- **Start screen.** After connecting, a start screen appears instead of the
  Alpine example loading automatically.
- **Theme.** Light by default, with a dark toggle. The preference is kept in
  browser localStorage and is not sensitive. The Streamlit host theme matches.
- **Draft edits.** Unsaved draft edits no longer need a rationale. If a draft
  edit is definitively rejected (HTTP 422), the last accepted result stays
  active and the field error is shown. Network failures keep the explicit
  retry.
- **Saved revisions.** Each single-field saved revision still needs one
  rationale.
- **Recalculation.** While recalculating, the previous result stays visible and
  is labeled as previous.
- **Exports.**
  - client-side CSV of reported values and analysis;
  - a print-ready credit memo, as escaped HTML with scripts blocked by its
    Content Security Policy;
  - copy as text.

  File names carry identifiers only.
- **Memo commentary** is kept in the tab's session storage, with a size limit
  and a visible warning. It is never sent to the server.
- **One presentation-only exception.** The browser computes trend chart bar
  geometry by BigInt scaling of server values. That geometry is never displayed
  as a number. Every displayed financial number is still a server value,
  formatted with exact decimal string operations.

## Not authorized by this record

- batch or structural saved-case revisions;
- a balance-sheet model;
- durable server-side memo notes;
- native XLSX or PDF libraries;
- `GET /policy`;
- SBA or consumer screens in the UI;
- document ingestion or OCR;
- multi-user identity;
- keeping credentials across reloads.

## Verification

Each pull request records its acceptance evidence (commands, test counts and CI
run identifiers) in [VERIFICATION.md](VERIFICATION.md) and in the pull request.
Passing software tests does not establish credit-policy approval, model
validation or regulatory compliance.
