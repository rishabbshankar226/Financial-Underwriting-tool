import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnalysisError, fetchAnalysis, type AnalysisSubject } from "./analysisApi";
import type { CommercialAnalysis } from "./analysisContracts";
import { trackBackground } from "./requestPriority";

/** `none`: nothing to analyze (no ready dated assessment); `waiting`: a saved write is in flight. */
export type AnalysisState =
  | { status: "none" }
  | { status: "waiting" }
  | { status: "loading" }
  | { status: "ready"; analysis: CommercialAnalysis }
  | { status: "error"; kind: AnalysisError["kind"]; message: string };
type Settled = Extract<AnalysisState, { status: "ready" | "error" }>;
const CACHE_SIZE = 4;

const AnalysisContext = createContext<{ state: AnalysisState; retry: () => void }>({
  state: { status: "none" },
  retry: () => {},
});

/** Fetches the analysis of the selected assessment in the background: at most one request at a time, never
 * while a saved write is in flight (the write cancels it), and the last four results kept by subject key. */
export function AnalysisProvider({
  subject,
  paused,
  children,
}: {
  subject: AnalysisSubject | null;
  paused: boolean;
  children: ReactNode;
}) {
  const cache = useRef(new Map<string, Settled>());
  const active = useRef<{ key: string; controller: AbortController } | null>(null);
  // Bumped when a request settles, so the effect re-runs and requests again after a write's cancellation.
  const [attempt, setAttempt] = useState(0);
  const key = subject?.key ?? null;
  useEffect(() => {
    const current = active.current;
    if (current && (current.key !== key || current.controller.signal.aborted)) {
      current.controller.abort();
      active.current = null;
    }
    if (!subject || paused || active.current) return;
    const known = cache.current.get(subject.key);
    if (known) {
      cache.current.delete(subject.key);
      cache.current.set(subject.key, known);
      return;
    }
    const request = { key: subject.key, controller: new AbortController() };
    active.current = request;
    const untrack = trackBackground(request.controller);
    const remember = (entry: Settled) => {
      cache.current.delete(request.key);
      cache.current.set(request.key, entry);
      while (cache.current.size > CACHE_SIZE) cache.current.delete(cache.current.keys().next().value as string);
    };
    fetchAnalysis(subject, request.controller.signal)
      .then(
        (analysis) => remember({ status: "ready", analysis }),
        (error: unknown) => {
          if (request.controller.signal.aborted) return;
          remember(
            error instanceof AnalysisError
              ? { status: "error", kind: error.kind, message: error.message }
              : { status: "error", kind: "failed", message: error instanceof Error ? error.message : String(error) },
          );
        },
      )
      .finally(() => {
        untrack();
        if (active.current === request) {
          active.current = null;
          setAttempt((value) => value + 1);
        }
      });
  }, [key, paused, attempt]);
  useEffect(
    () => () => {
      active.current?.controller.abort();
      active.current = null;
    },
    [],
  );
  const known = key ? cache.current.get(key) : undefined;
  const state: AnalysisState = !subject ? { status: "none" } : known ?? (paused ? { status: "waiting" } : { status: "loading" });
  return createElement(
    AnalysisContext.Provider,
    {
      value: {
        state,
        retry: () => {
          if (key && cache.current.get(key)?.status === "error") {
            cache.current.delete(key);
            setAttempt((value) => value + 1);
          }
        },
      },
    },
    children,
  );
}

export function useAnalysis() {
  return useContext(AnalysisContext);
}
