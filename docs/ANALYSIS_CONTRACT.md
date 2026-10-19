# Commercial analysis v1

Analysis derives credit views from one `commercial-assessment-v2` result.

**Coverage:**
- common-size and change-versus-prior spreads;
- debt capacity at policy approval minimums;
- EBITDA and revenue breakevens;
- a cent-rounded amortization schedule;
- a revenue × rate coverage grid;
- a plain-language decision explanation.

**Guarantees:**
- It never changes, saves or replaces the assessment, decision, policy or stored records.
- Every response carries the fingerprint of the assessment it analyzed. Clients pair an analysis with its assessment by that value.
- Derived capacity is policy arithmetic, not a credit approval.

The scope was approved in the [usability approval record](ANALYST_USABILITY_APPROVAL.md).

## Routes

| Route | Basis |
| --- | --- |
| `POST /commercial/analysis` | Analyzes a `CommercialAssessmentRequest` under the current default policy, exactly as `POST /commercial/assessment` would assess it. |
| `POST /cases/{case_id}/revisions/{revision}/analysis` | Analyzes a stored revision under its **retained** policy. The body is empty or `{}`. |

**Requirements for the stored-revision route:**
- The stored assessment must use the supported v2 definition.
- The stored assessment must replay exactly first.
- Otherwise the route returns 409:
  - `baseline_unsupported` (unsupported definition);
  - `baseline_replay_mismatch` (replay does not match);
  - `baseline_replay_unavailable` (replay could not run).

  Archived numeric v1 revisions remain readable originals with no analysis.

**Common behavior of both routes:**
- They are authenticated and bounded at 1,000,000 actual request bytes.
- They run on worker threads, never write, and return `persisted: false`.
- Slash aliases share the handler.
- Status codes follow the scenario-preview adapter: 400, 404, 409, 413, 422 and 503. A stored revision outside the supported calculation contract returns 422 `analysis_invalid`.

**Versions:**
- `commercial-analysis-v1` (schema)
- `commercial-analysis-definition-v1` (formulas)
- `analysis-json-v1` (serialization)

Responses also record the assessment `calculation_version` and the scenario definition version used by the grid.

## Browser use

The workspace requests an analysis for each ready dated assessment in the background, one request at a time: unsaved drafts use the stateless route and saved revisions the stored-revision route. It shows a result only when `assessment_fingerprint` and the periods match the assessment on screen, reports an unknown version as unsupported, and shows an "unavailable" notice when the host answers 404 without a storage error code. A saved write cancels a background analysis before the write is sent. See [workspace behavior](WORKSPACE.md#analysis).

## Definitions

Every figure is a traced calculation (`analysis.*` fact IDs) using the existing `Metric` shape:
- raw and reported values, unit, display precision, status and explanation;
- operands that are input JSON Pointers, assessment fact IDs or retained-policy pointers.

Calculations use the same isolated 96-digit Decimal context as the assessment. Reporting is HALF_EVEN: money to cents, ratios to four places.

Notation: E is latest-period EBITDA, R is latest gross receipts, I is existing interest, C is annual CPLTD, L is the operating lease, PD is global personal debt, and W is the sum of guarantor ownership (1 when there are no guarantors).

| Definition | Method | Not applicable when |
| --- | --- | --- |
| `common-size-v1` | Each of the nine inputs plus gross profit, ordinary income and EBITDA, ÷ gross receipts of the same period | Receipts ≤ 0 |
| `change-vs-prior-v1` | (current − prior) ÷ prior, for every line, from the second period. `prior_period_adjacent` reports whether the prior period is the comparable year. | Prior amount ≤ 0 |
| `debt-capacity-v1` | Maximum proposed annual payment for each constraint (see the formulas below this table). The **binding** constraint is the smallest, with ties ordered DSCR, FCCR, global. The maximum annual payment is that value floored at 0. | Never; a nonpositive result means no capacity |
| `present-value-principal-v1` | Maximum principal at the proposed rate and term: m × (1 − (1 + r)^−n) ÷ r with r = rate ÷ 12; at a zero rate, m × n | Never |
| `principal-headroom-v1` | Maximum principal − requested principal; negative is a shortfall | Never |
| `ownership-weight-v1` | Σ guarantor ownership in supplied order; 1 without guarantors | Never |
| `ebitda-breakeven-v1` | EBITDA at which each ratio equals its approval minimum and its decline floor (see below) | Zero service, or W = 0 for global |
| `ebitda-cushion-v1` | 1 − breakeven ÷ E | Breakeven unavailable or E ≤ 0 |
| `revenue-cushion-v1` | (E − breakeven) ÷ R, with every cost line held fixed | Breakeven unavailable or R ≤ 0 |
| `policy-cushion-v1` | Factor value − approval threshold, and value − decline floor | Ratio unavailable; K-1 history is categorical; UCA has no decline floor |
| `amortization-schedule-v1` | The cent schedule described below | Principal rounds to 0.00 |

**`debt-capacity-v1` formulas:**
- DSCR: E ÷ min − I − C
- FCCR: E ÷ min − I − C − L
- Global: global cash flow ÷ min − I − C − PD

**`ebitda-breakeven-v1` formulas** (τ is the approval minimum or the decline floor):
- DSCR: τ × debt service
- FCCR: τ × fixed-charge service
- Global: (τ × global service − outside income) ÷ W

**Reading the breakevens:**
- The binding breakeven is the largest available one: as EBITDA falls, that constraint is breached first.
- A negative cushion means the constraint is already breached.

### Amortization schedule

The schedule applies these rules:
- It amortizes the principal rounded half-even to cents (`schedule_principal`).
- The level payment is the annuity payment for that principal, rounded half-even to cents.
- Each month's interest is balance × annual rate ÷ 12, rounded half-even to cents.
- The final month settles the balance. So does any earlier month whose payment would cover it (`early_payoff`).
- Rows: annual rows cover every loan year (at most 1,000); monthly rows cover the first 360 months, with `monthly_rows_truncated` flagging any omission.

When the principal part of a payment rounds below half a cent (a very long term at a very high rate), principal does not amortize until the final payment. That payment is then a balloon, reported as `final_payment_adjustment`.

`reconciliation` relates the schedule to coverage. Coverage uses twelve **unrounded** annuity payments (`annualized-payment-v2`), so the schedule's first-year cents can differ by a fraction of a cent per payment.

For Alpine:

| Item | Amount |
| --- | --- |
| Scheduled payment | 6,746.75 |
| Final payment | 6,746.74 |
| Total interest | 309,609.99 |
| First-year payments | 80,961.00, against coverage service of 80,960.998065… |

### Sensitivity grid

The grid crosses revenue changes {0, −5%, −10%, −15%, −20%} with proposed-rate changes {0, +100, +200, +300} basis points: 20 cells in row-major order.

Each cell reuses the exact stress-preview definitions (`scenario-percentage-v2`, `scenario-rate-bps-v2`) under the assessment's policy and holds the same assumptions fixed. It reports:
- DSCR, FCCR and global DSCR;
- the outcome;
- the resulting rate.

Cell (0, 0) reproduces the assessment.

**Availability:**
- **Whole grid not applicable:** when latest-period revenue, COGS or operating expense is negative.
- **Single cell not applicable:** when its stressed rate leaves [0, 1] (100% itself is supported), or when its projection exceeds the calculation contract.
- **Trace:** cells carry no per-cell trace. `definition_ids` names the definitions applied.

### Decision explanation

The explanation restates the outcome rule from the recorded factors and must agree with the recorded outcome and score. A disagreement is an internal error, never a silently different answer.

**Outcome rule:**
- **Approve** when DSCR, FCCR and global DSCR meet their approval minimums, UCA cash flow is above its minimum, and K-1 history is stable.
- **Review** when those coverage and UCA conditions hold but K-1 history is not stable.
- **Decline** when they do not hold and any coverage ratio is below its decline floor.
- **Review** otherwise.

**Each factor carries:**
- a status: `meets_approval`, `review_band`, `below_decline_floor` or `not_applicable`;
- approval and decline cushions;
- its weight and score contribution;
- a plain sentence built from reported values. When the rounded display and the unrounded comparison would disagree, the sentence adds "The comparison uses the unrounded value."

`headline` is a one-line reason. The score breakdown restates the weight share of passing factors. It is illustrative, never changes the outcome, and is not a probability of default.

## Validation evidence

`gate/reference_calculator.py` implements each family independently: it writes the principal in accumulated-value form, runs its own cent loop, and computes stressed coverage directly.

**Pinned fixtures:**
- Alpine: FCCR binds; maximum principal 2,352,984.83.
- The 60% partial-owner variant: global binds; maximum principal 1,217,870.36.

**Comparison:**
- `test_reference_values.py` compares every analysis value with the gate to 1e-24, and the schedule exactly to the cent.
- Twelve named mutations prove the checks detect wrong bases, denominators, constraints, rates, rounding and settlement.

**Other analysis tests check:**
- not-applicable rules;
- schedule cent invariants for seeded loans;
- that each grid cell equals a saved stress preview;
- agreement with `decision.py` across all 384 factor-state combinations and 120 seeded requests;
- that every operand resolves to its source;
- determinism;
- a worst-case payload under 2,000,000 bytes.

These checks establish deterministic software behavior. They do not approve credit policy, validate a model, or certify compliance.
