import type { Input } from "../contracts";
import type { Locator } from "../caseRecovery";
import { SavedHistory } from "../SavedCases";
import type { EditEvent, StoredSelection } from "../workspace";

/** Saved revision history, or this session's applied edits for an unsaved case. */
export function HistoryView({
  saved,
  ready,
  history,
  input,
  onOpen,
}: {
  saved: StoredSelection | null;
  ready: boolean;
  history: EditEvent[];
  input: Input | undefined;
  onOpen: (locator: Locator) => void;
}) {
  return saved ? (
    <SavedHistory saved={saved} active={ready} onOpen={onOpen} />
  ) : (
    <section className="panel memo">
      <h2>Session edit history</h2>
      <p>
        Resets on reload. Actor: demonstration analyst; timestamps are
        local and unverified.
      </p>
      {history.length === 0 ? (
        <p>No applied edits this session.</p>
      ) : (
        history.map((e, i) => (
          <div className="audit" key={i}>
            <strong>{e.path}</strong>
            <span>
              {e.prior} → {e.next}
            </span>
            <small>
              {e.rationale} · {e.at}
            </small>
          </div>
        ))
      )}
      {input && "overrides" in input && !!input.overrides?.length && (
        <>
          <h3>Unverified imported history</h3>
          {input.overrides.map((e, i) => (
            <div className="audit imported" key={i}>
              <strong>{e.field}</strong>
              <span>
                {String(e.prior_value)} → {String(e.new_value)}
              </span>
              <small>
                {e.rationale} · supplied actor {e.actor} · {e.at}
              </small>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
