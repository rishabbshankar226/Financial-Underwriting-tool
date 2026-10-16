import type { Assessment, Metric } from "./contracts";
import { formatDecimal, isDecimal } from "./decimal";

function amount(metric: Metric, currency = false): string {
  const value = metric.reported_value ?? metric.raw_value;
  if (metric.status !== "available" || !isDecimal(value))
    return "Not applicable";
  return currency
    ? `$${formatDecimal(value, 2)}`
    : `${formatDecimal(value, 4)}x`;
}

export default function AssessmentSummary({
  assessment,
}: {
  assessment: Assessment;
}) {
  const facts = assessment.current_facts;
  const cards = [
    {
      label: "EBITDA",
      value: amount(facts.ebitda, true),
      note: `Operating year ended ${assessment.selected_period.period_end}`,
    },
    {
      label: "Proposed annual service",
      value: amount(facts.proposed_annual_payment, true),
      note: "Fixed rate · monthly repayment",
    },
    {
      label: "Business DSCR",
      value: amount(facts.dscr),
      note: `Policy minimum ${assessment.policy_snapshot.commercial_min_dscr}x`,
    },
    {
      label: "Global DSCR",
      value: amount(facts.global_dscr),
      note: `Policy minimum ${assessment.policy_snapshot.commercial_min_global_dscr}x`,
    },
  ];
  return (
    <section className="summaryGrid" aria-label="Assessment overview">
      {cards.map((card) => (
        <div className="summaryCard" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.note}</small>
        </div>
      ))}
    </section>
  );
}
