import type { Decision } from "../contracts";
import { fieldLabels as labels } from "../fieldCatalog";
import { legacyFactorText as factorText } from "../format";
import { prototypeDisclaimer } from "../prototypeDisclaimer";

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
              {decision.reasons.map((r, i) => (
                <li key={i}>{r.message}</li>
              ))}
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
