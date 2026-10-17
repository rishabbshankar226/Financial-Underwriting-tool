import { annualFields, type Assessment, type Decision, type Input } from "../contracts";
import { derivedSpreadFacts, fieldLabels as labels, periodLabel, spreadField } from "../fieldCatalog";
import { legacyFactorText as factorText, legacyMoney as money } from "../format";
import { metricText } from "../metricDisplay";
import { EditButton, type OpenEditor } from "./EditButton";

export function SpreadView({
  ready,
  canEdit,
  input,
  legacy,
  assessment,
  decision,
  index,
  onSelectPeriod,
  onEdit,
}: {
  ready: boolean;
  canEdit: boolean;
  input: Input | undefined;
  legacy: boolean;
  assessment: Assessment | null;
  decision: Decision | null;
  index: number;
  onSelectPeriod: (index: number) => void;
  onEdit: OpenEditor;
}) {
  return (
    <section className="grid">
      <div className="panel wide">
        <div className="panelTitle">
          <h2>Annual financial spread</h2>
          <span>
            {ready
              ? canEdit
                ? "Select a supplied input to edit · derived rows are read-only"
                : "Original accepted inputs · editing unavailable for this selection"
              : "Previous accepted inputs · editing unavailable"}
          </span>
        </div>
        {input ? (
          <div className="tableScroll">
            <table>
              <thead>
                <tr>
                  <th>Line item · USD</th>
                  {input.years.map((y, i) => (
                    <th key={i}>
                      <button
                        aria-pressed={index === i}
                        className={index === i ? "period active" : "period"}
                        onClick={() => onSelectPeriod(i)}
                      >
                        {periodLabel(y, i)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {annualFields.map((key) => (
                  <tr key={key}>
                    <th scope="row">{labels[key]}</th>
                    {input.years.map((y, i) => (
                      <td key={i} className="num">
                        <EditButton
                          field={spreadField(input, i, key)}
                          canEdit={canEdit}
                          onEdit={onEdit}
                          label={`Edit ${labels[key]} for ${periodLabel(y, i)}`}
                        >
                          {`$${money(assessment?.historical_spread[i].reported_financials[key] ?? y[key])}`}
                        </EditButton>
                      </td>
                    ))}
                  </tr>
                ))}
                {assessment &&
                  derivedSpreadFacts.map((key) => (
                    <tr className="derived" data-fact={key} key={key}>
                      <th scope="row">
                        {labels[key] ?? "K-1 distribution ratio"}{" "}
                        <small>Calculated</small>
                      </th>
                      {assessment.historical_spread.map((h, i) => (
                        <td key={i} className="num">
                          {metricText(h[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No accepted inputs yet.</p>
        )}
        {assessment && <p className="fine">Report amounts reconcile to income totals in cents. Editing opens the original unrounded input.</p>}
        {legacy && (
          <p className="fine">
            Legacy inputs have no verified dates or dated calculation trace.
            Supplied period order is retained.
          </p>
        )}
      </div>
      <CoveragePanel decision={decision} />
    </section>
  );
}

function CoveragePanel({ decision }: { decision: Decision | null }) {
  return (
    <div className="panel">
      <h2>Current coverage</h2>
      {decision ? (
        decision.factors.map((f) => (
          <div className="metric" data-state={f.passed === null ? "review" : f.passed ? "pass" : "fail"} key={f.name}>
            <span>{labels[f.name] ?? f.name}</span>
            <strong>{factorText(f)}</strong>
            <small>
              {f.name === "uca_positive"
                ? `Must exceed $${money(String(f.threshold))}`
                : `Policy: ${f.comparison_operator ?? "comparison unavailable"} ${String(f.threshold)}`}{" "}
              ·{" "}
              {f.passed === null
                ? "Review required"
                : f.passed
                  ? "Pass"
                  : "Below policy"}
              {f.decline_threshold !== null &&
                ` · decline below ${f.decline_threshold}x`}
            </small>
          </div>
        ))
      ) : (
        <p>No current results. Resolve the selected input and retry.</p>
      )}
    </div>
  );
}
