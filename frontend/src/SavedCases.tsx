import { useEffect, useRef, useState } from "react";
import { caseError, fetchCases, fetchRevisions, replayCase } from "./caseApi";
import {
  inputField,
  type CaseSummary,
  type Page,
  type Replay,
  type RevisionSummary,
  type StoredCase,
} from "./caseContracts";
import type { Locator, PendingOperation, PendingWrite } from "./caseRecovery";
import type { StoredSelection } from "./workspace";
import type { useAnalystWorkspace } from "./useAnalystWorkspace";
import type { StoredComparison } from "./scenarioContracts";

export function usePages<T>(
  key: string,
  loader: (after: string | null, signal: AbortSignal) => Promise<Page<T>>,
  id: (item: T) => string,
) {
  const empty = {
    key,
    items: [] as T[],
    next: null as string | null,
    loading: true,
    error: "",
  };
  const [state, setState] = useState(empty);
  const context = useRef(key);
  context.current = key;
  const fetcher = useRef(loader);
  fetcher.current = loader;
  const request = useRef<AbortController | null>(null),
    generation = useRef(0),
    cursors = useRef(new Set<string>());
  async function load(after: string | null) {
    if (after && request.current) return;
    if (!after) {
      request.current?.abort();
      cursors.current.clear();
    }
    const controller = new AbortController();
    request.current = controller;
    const token = ++generation.current,
      resource = key,
      readPage = fetcher.current;
    setState((previous) =>
      after ? { ...previous, loading: true, error: "" } : empty,
    );
    try {
      const page = await readPage(after, controller.signal);
      if (
        resource !== context.current ||
        token !== generation.current ||
        controller.signal.aborted
      )
        return;
      if (
        page.next_cursor &&
        (page.next_cursor === after || cursors.current.has(page.next_cursor))
      )
        throw new Error(
          "Saved pagination returned a repeated cursor. Refresh the list.",
        );
      if (page.next_cursor) cursors.current.add(page.next_cursor);
      setState((previous) => {
        const rows = new Map(
          (after ? previous.items : []).map((item) => [id(item), item]),
        );
        for (const item of page.items) rows.set(id(item), item);
        return {
          key: resource,
          items: [...rows.values()],
          next: page.next_cursor,
          loading: false,
          error: "",
        };
      });
    } catch (error) {
      if (
        resource === context.current &&
        token === generation.current &&
        !controller.signal.aborted
      )
        setState((previous) => ({
          ...previous,
          loading: false,
          error: caseError(error).message,
        }));
    } finally {
      if (request.current === controller) request.current = null;
    }
  }
  useEffect(() => {
    void load(null);
    return () => {
      generation.current++;
      request.current?.abort();
      request.current = null;
    };
  }, [key]);
  return {
    ...(state.key === key ? state : empty),
    refresh: () => void load(null),
    more: () => {
      if (state.next) void load(state.next);
    },
  };
}
export function SavedCaseList({
  onOpen,
  onClose,
}: {
  onOpen: (locator: Locator) => void;
  onClose: () => void;
}) {
  const pages = usePages<CaseSummary>(
    "cases",
    fetchCases,
    (item) => item.case_id,
  );
  return (
    <section className="panel caseList" aria-label="Saved cases">
      <div className="panelTitle">
        <div>
          <h2>Saved cases</h2>
          <p>Newest creations first · local saved assessments</p>
        </div>
        <div className="actions">
          <button onClick={pages.refresh}>Refresh saved cases</button>
          <button onClick={onClose}>Close saved cases</button>
        </div>
      </div>
      {pages.loading && <p role="status">Loading saved cases…</p>}
      {pages.error && <p role="alert">{pages.error}</p>}
      {!pages.loading && !pages.error && !pages.items.length && (
        <p>No saved cases yet. Save an accepted dated assessment to begin.</p>
      )}
      {pages.items.map((item) => (
        <article className="caseRow" key={item.case_id}>
          <div>
            <h3>{item.borrower_name}</h3>
            <code>{item.case_id}</code>
            <p>
              Created {item.created_at} · Revision {item.revision}
              <br />
              Last recorded {item.recorded_at}
            </p>
          </div>
          <button
            aria-label={`Open ${item.borrower_name} case ${item.case_id}`}
            onClick={() => onOpen({ caseId: item.case_id, revision: "latest" })}
          >
            Open case
          </button>
        </article>
      ))}
      {pages.next && (
        <button disabled={pages.loading} onClick={pages.more}>
          Load more saved cases
        </button>
      )}
    </section>
  );
}
export function SavedContext({
  saved,
  active,
  onOpen,
}: {
  saved: StoredSelection;
  active: boolean;
  onOpen: (locator: Locator) => void;
}) {
  const s = saved.view.snapshot;
  const label = !active
    ? `Previous saved revision ${s.revision} (inactive)`
    : saved.selection === "latest"
      ? `Revision ${s.revision} · Latest when fetched`
      : saved.selection === "revision"
        ? `Historical revision ${s.revision}`
        : `Acknowledged revision ${s.revision} · Latest unconfirmed`;
  return (
    <section className="savedContext" aria-label="Saved revision context">
      <strong>{label}</strong>
      <span>
        Case <code>{s.case_id}</code> · Run <code>{s.run_id}</code>
      </span>
      <span>
        Recorded {s.recorded_at} · assessment as of{" "}
        {s.event.context.assessment_as_of}
        {saved.headRevision !== null && saved.headRevision > s.revision
          ? ` · Latest known revision ${saved.headRevision}`
          : ""}
      </span>
      <button onClick={() => onOpen({ caseId: s.case_id, revision: "latest" })}>
        Open latest
      </button>
    </section>
  );
}
export function RecordingDetails({ view }: { view: StoredCase }) {
  const s = view.snapshot;
  return (
    <details>
      <summary>Stored run and recording metadata</summary>
      <p>
        Original run {s.run_id} · recorded {s.recorded_at}
      </p>
      <p>
        Source status: {s.recording.source_status}{" "}
        {s.recording.source_revision ?? "· exact build revision not supplied"}
      </p>
      <p>
        Stored hashes are local consistency identifiers; they do not
        authenticate documents or people.
      </p>
      <pre>
        {JSON.stringify(
          {
            input_hash: s.input_hash,
            payload_hash: s.payload_hash,
            storage_serialization_version: s.storage_serialization_version,
            recording: s.recording,
          },
          null,
          2,
        )}
      </pre>
    </details>
  );
}
export function SavedHistory({
  saved,
  active,
  onOpen,
}: {
  saved: StoredSelection;
  active: boolean;
  onOpen: (locator: Locator) => void;
}) {
  const view = saved.view,
    s = view.snapshot,
    event = s.event;
  const pages = usePages<RevisionSummary>(
    `${s.case_id}:${s.revision}`,
    (after, signal) => fetchRevisions(s.case_id, after, signal),
    (item) => String(item.revision),
  );
  const [replay, setReplay] = useState<{
    key: string;
    result: Replay | null;
    error: string;
    loading: boolean;
  }>({ key: s.run_id, result: null, error: "", loading: false });
  const replayRequest = useRef<AbortController | null>(null),
    selected = useRef(s.run_id);
  selected.current = s.run_id;
  useEffect(() => {
    setReplay({ key: s.run_id, result: null, error: "", loading: false });
    return () => {
      replayRequest.current?.abort();
      replayRequest.current = null;
    };
  }, [s.run_id]);
  async function checkReplay() {
    if (replayRequest.current) return;
    const controller = new AbortController();
    replayRequest.current = controller;
    const key = s.run_id;
    setReplay({ key, result: null, error: "", loading: true });
    try {
      const result = await replayCase(view, controller.signal);
      if (selected.current === key && !controller.signal.aborted)
        setReplay({ key, result, error: "", loading: false });
    } catch (error) {
      if (selected.current === key && !controller.signal.aborted)
        setReplay({
          key,
          result: null,
          error: caseError(error).message,
          loading: false,
        });
    } finally {
      if (replayRequest.current === controller) replayRequest.current = null;
    }
  }
  return (
    <section className="panel memo">
      <div className="panelTitle">
        <h2>Saved revision history</h2>
        <button onClick={pages.refresh}>Refresh revisions</button>
      </div>
      {!active && (
        <p>Previous saved selection; its recommendation is inactive.</p>
      )}
      <p>
        Original accepted revisions and server-recorded events. Actor:
        unverified demonstration identity.
      </p>
      {pages.loading && <p role="status">Loading revisions…</p>}
      {pages.error && <p role="alert">{pages.error}</p>}
      <div className="revisionList">
        {pages.items.map((item) => (
          <article className="caseRow" key={item.revision}>
            <div>
              <strong>Revision {item.revision}</strong>
              <p>
                {item.rationale}
                <br />
                {item.recorded_at} · Run {item.run_id}
              </p>
            </div>
            <button
              aria-label={`Open revision ${item.revision}`}
              aria-pressed={item.revision === s.revision}
              onClick={() =>
                onOpen({ caseId: s.case_id, revision: item.revision })
              }
            >
              Revision {item.revision}
            </button>
          </article>
        ))}
      </div>
      {pages.next && (
        <button disabled={pages.loading} onClick={pages.more}>
          Load more revisions
        </button>
      )}
      <article className="savedEvent" aria-label="Selected recorded event">
        <h3>Selected recorded event · revision {s.revision}</h3>
        <strong>
          {event.kind === "creation" ? "Case creation" : event.field_path}
        </strong>
        {event.kind === "edit" && (
          <p>
            {event.before} → {event.after} · {event.context.unit}
          </p>
        )}
        <p>{event.rationale}</p>
        <p>
          {event.context.basis} · as of {event.context.assessment_as_of}
          {event.context.period_start
            ? ` · ${event.context.period_start} – ${event.context.period_end}`
            : ""}
          {event.context.guarantor_name !== null
            ? ` · Guarantor ${event.context.guarantor_index}: ${event.context.guarantor_name}`
            : ""}
        </p>
        <p>
          Recorded {event.recorded_at} · {event.actor}
        </p>
      </article>
      <div className="actions">
        <button disabled={replay.loading} onClick={() => void checkReplay()}>
          Check replay
        </button>
      </div>
      {replay.key === s.run_id && (
        <div className="replayResult" role="status">
          {replay.loading
            ? "Checking the retained policy and definition…"
            : replay.error ||
              (replay.result ? (
                <>
                  <strong>
                    {
                      {
                        matched: "Matched",
                        mismatch: "Mismatch",
                        replay_unavailable: "Replay unavailable",
                      }[replay.result.status]
                    }
                  </strong>
                  <p>{replay.result.explanation}</p>
                  {replay.result.differences.length > 0 && (
                    <ul>
                      {replay.result.differences.map((path) => (
                        <li key={path}>{path}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                "Replay is read-only; the original result stays selected."
              ))}
        </div>
      )}
      <RecordingDetails view={view} />
    </section>
  );
}
function Proposal({ operation }: { operation: PendingWrite }) {
  const command = JSON.parse(operation.body);
  if(operation.kind === "comparison") return <p>Proposed comparison · Case {operation.caseId} · revision {operation.baselineRevision}<br/>Run {operation.baselineRunId} · as of {operation.context.assessment_as_of}<br/>{command.scenarios.map((s: {name:string;rationale:string}) => `${s.name}: ${s.rationale}`).join("; ")}</p>;
  return operation.kind === "edit" ? (
    <p>
      Proposed {operation.review.label}: {operation.review.value} →{" "}
      {command.new_value} · {operation.review.period} · {operation.context.unit}
      <br />
      Rationale: {command.rationale}
    </p>
  ) : (
    <p>
      Proposed creation: {command.input.borrower_name} · as of{" "}
      {command.input.assessment_as_of}
      <br />
      Rationale: {command.rationale}
    </p>
  );
}
export function RecoveryPanel({
  workspace: w,
  onDiscard,
  onReview,
  onOpenComparison,
}: {
  workspace: ReturnType<typeof useAnalystWorkspace>;
  onDiscard: (opener: HTMLElement) => void;
  onReview: (opener: HTMLElement) => void;
  onOpenComparison: (view: StoredComparison) => void;
}) {
  const [error, setError] = useState("");
  return (
    <>
      {w.notice && (
        <p className="writeNotice" role="status">
          {w.notice}
        </p>
      )}
      {(w.operation || w.recoveryError) && (
        <section className="pending" aria-label="Saved write recovery">
          <h2>
            {w.inFlight
              ? w.operation?.kind === "comparison" ? "Saving comparison" : "Saving revision"
              : w.operation
                ? "Unconfirmed saved write"
                : "Saved write recovery unavailable"}
          </h2>
          {w.operation && <Proposal operation={w.operation} />}
          <p>
            {w.recoveryError ||
              w.writeError?.message ||
              "This tab keeps the original command for exact retry. No new accepted event is recorded until the receipt is verified."}
          </p>
          {w.writeError?.retryAfter && (
            <p>Retry after {w.writeError.retryAfter} second(s).</p>
          )}
          <div className="actions">
            {w.operation && (
              <button
                disabled={w.inFlight || (w.writeError?.status === 409 && !w.writeError.certain)}
                onClick={() => {
                  try {
                    w.retryWrite();
                    setError("");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                  }
                }}
              >
                Retry exact write
              </button>
            )}
            {w.operation?.kind === "edit" && (
              <button
                onClick={() =>
                  void w.openSaved({
                    caseId: (
                      w.operation as Extract<PendingOperation, { kind: "edit" }>
                    ).caseId,
                    revision: (
                      w.operation as Extract<PendingOperation, { kind: "edit" }>
                    ).baseRevision,
                  })
                }
              >
                View stored baseline
              </button>
            )}
            {w.operation?.kind === "comparison" && <button onClick={() => {
              if (w.operation?.kind === "comparison") void w.openSaved({ caseId: w.operation.caseId, revision: w.operation.baselineRevision });
            }}>View stored baseline</button>}
            <button
              disabled={w.inFlight}
              onClick={(e) => onDiscard(e.currentTarget)}
            >
              Review discarding tracking
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
        </section>
      )}
      {w.conflict && (
        <section
          className="pending conflict"
          aria-label="Conflicting saved edit"
        >
          <h2>Review conflicting edit</h2>
          <Proposal operation={w.conflict.operation} />
          <p>
            The case changed. Nothing from this proposal was accepted. Review
            the latest field before submitting a fresh revision.
          </p>
          {w.conflict.latest ? (
            <p>
              Latest stored value:{" "}
              {
                inputField(
                  w.conflict.latest.snapshot.normalized_input,
                  w.conflict.operation.review.path,
                ).value
              }{" "}
              · Revision {w.conflict.latest.snapshot.revision}
            </p>
          ) : (
            <p role="status">
              {w.conflict.error || "Loading latest for review…"}
            </p>
          )}
          <div className="actions">
            <button
              disabled={!w.conflict.latest || !!w.operation}
              onClick={(e) => onReview(e.currentTarget)}
            >
              Review proposed edit
            </button>
            <button onClick={w.refreshConflict}>
              Refresh conflict baseline
            </button>
            <button onClick={w.cancelConflict}>Cancel proposal</button>
          </div>
        </section>
      )}
      {w.rejected && (
        <section className="pending">
          <h2>Rejected saved proposal</h2>
          <Proposal operation={w.rejected} />
          <p>{w.writeError?.message}</p>
          <button onClick={w.dismissRejected}>Dismiss rejected proposal</button>
        </section>
      )}
      {w.offer && (
        <section className="pending">
          <h2>Write acknowledged for another selection</h2>
          <p>
            Case {w.offer.snapshot.case_id} · revision{" "}
            {w.offer.snapshot.revision}. The current selection was preserved.
          </p>
          <div className="actions">
            <button
              onClick={() => {
                if (w.offer)
                  void w.openSaved({
                    caseId: w.offer.snapshot.case_id,
                    revision: w.offer.snapshot.revision,
                  });
                w.dismissOffer();
              }}
            >
              Open acknowledged revision
            </button>
            <button onClick={w.dismissOffer}>Dismiss acknowledgment</button>
          </div>
        </section>
      )}
      {w.comparisonAck && (w.comparisonAck.scope !== w.state.id || w.comparisonAck.view.record.case_id !== w.state.saved?.view.snapshot.case_id || w.comparisonAck.view.record.baseline_revision !== w.state.saved?.view.snapshot.revision) && <section className="pending" aria-label="Comparison acknowledged for another selection">
        <h2>Comparison acknowledged for another selection</h2><p>Original comparison {w.comparisonAck.view.record.comparison_id} · baseline revision {w.comparisonAck.view.record.baseline_revision}. The current selection was preserved.</p>
        <div className="actions"><button onClick={() => { if (w.comparisonAck) onOpenComparison(w.comparisonAck.view); }}>Open acknowledged comparison</button><button onClick={w.dismissComparisonAck}>Dismiss comparison acknowledgment</button></div>
      </section>}
    </>
  );
}
