import type { Decision, Factor } from "../contracts";
import { isDecimal } from "../decimal";
import { fieldLabels as labels } from "../fieldCatalog";
import { legacyFactorText as factorText, moneyText, multipleText } from "../format";
import { prototypeDisclaimer } from "../prototypeDisclaimer";

/** A policy line in the factor's own unit: "1.00x", "$0" or a category such as "stable". */
function lineText(factor: Factor, line: string | boolean | null): string {
  if (!isDecimal(line)) return String(line);
  return factor.name === "uca_positive" ? moneyText(line) : multipleText(line, []);
}

/** A recorded reason in plain words, from its factor's returned value, lines and flags. The server's own
 * message stays with it, unchanged. */
function reasonText(factor: Factor): string {
  const label = labels[factor.name] ?? factor.name,
    value = factorText(factor);
  if (factor.passed === null) return `${label}: ${value}; manual review is required.`;
  if (factor.decline_triggered) return `${label} of ${value} is below the decline floor of ${lineText(factor, factor.decline_threshold)}.`;
  const line = lineText(factor, factor.threshold);
  if (factor.comparison_operator === ">=") return `${label} of ${value} is below the minimum of ${line}.`;
  if (factor.comparison_operator === ">") return `${label} of ${value} does not exceed ${line}.`;
  return `${label} is ${value}; the policy requires ${line}.`;
}

export function MemoView({ decision }: { decision: Decision | null }) {
  return (
    <section className="panel memo">
      <h2>Credit memo</h2>
      {decision ? (
        <>
          <h3>Recommendation</h3>
          <p>
            {decision.outcome[0].toUpperCase() + decision.outcome.slice(1)}{" "}
            for prototype demonstration based on the accepted inputs.
          </p>
          <h3>Primary factors considered</h3>
          <ul>
            {decision.factors.map((f) => (
              <li key={f.name}>
                {labels[f.name]}: {factorText(f)} —{" "}
                {f.passed === null
                  ? "manual review required"
                  : f.passed
                    ? "meets configured policy"
                    : "does not meet configured policy"}
              </li>
            ))}
          </ul>
          <h3>Recorded reasons</h3>
          {decision.reasons.length ? (
            <ul>
              {decision.reasons.map((r, i) => {
                const factor = decision.factors.find((f) => f.name === r.factor);
                return factor ? (
                  <li key={i}>
                    {reasonText(factor)}
                    <details className="recordedMessage">
                      <summary>Recorded message</summary>
                      {r.message}
                    </details>
                  </li>
                ) : (
                  <li key={i}>{r.message}</li>
                );
              })}
            </ul>
          ) : (
            <p>No reasons beyond the factors above.</p>
          )}
        </>
      ) : (
        <p>No current decision is available.</p>
      )}
      <p className="fine">{prototypeDisclaimer}</p>
    </section>
  );
}
