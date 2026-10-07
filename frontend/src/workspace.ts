import type { Accepted, Input, Mode } from "./contracts";
import type { StoredCase } from "./caseContracts";
export type StoredSelection = {
  view: StoredCase;
  selection: "latest" | "revision" | "receipt";
  headRevision: number | null;
};
export type EditEvent = {
  path: string;
  prior: number;
  next: number;
  rationale: string;
  at: string;
};
export type Draft = {
  mode: Mode;
  payload: Input;
  filename: string;
  rawJson?: string;
  edit?: EditEvent;
  resetHistory?: boolean;
};
export type Workspace = {
  id: number;
  accepted: Accepted | null;
  draft: Draft | null;
  filename: string;
  status: "evaluating" | "ready" | "unavailable";
  error: string;
  history: EditEvent[];
  saved: StoredSelection | null;
  action: "evaluate" | "open" | "write";
  resetPeriod: boolean;
};
export const initialWorkspace: Workspace = {
  id: 0,
  accepted: null,
  draft: null,
  filename: "alpine_dated.json",
  status: "evaluating",
  error: "",
  history: [],
  saved: null,
  action: "evaluate",
  resetPeriod: true,
};
export type Event =
  | {
      type: "start";
      id: number;
      draft: Draft | null;
      filename: string;
      action?: Workspace["action"];
    }
  | { type: "success"; id: number; accepted: Accepted }
  | { type: "failure"; id: number; error: string }
  | {
      type: "stored-success";
      id: number;
      view: StoredCase;
      selection: StoredSelection["selection"];
      resetPeriod?: boolean;
    }
  | {
      type: "head";
      id: number;
      caseId: string;
      revision: number;
      headRevision: number;
    };
export function transition(state: Workspace, event: Event): Workspace {
  if (event.type === "head") {
    if (
      state.id !== event.id ||
      state.status !== "ready" ||
      state.saved?.view.snapshot.case_id !== event.caseId ||
      state.saved.view.snapshot.revision !== event.revision ||
      event.headRevision < event.revision
    )
      return state;
    return {
      ...state,
      saved: {
        ...state.saved,
        headRevision: event.headRevision,
        selection:
          event.headRevision === event.revision ? "latest" : "revision",
      },
    };
  }
  if (event.type === "start")
    return event.id < state.id
      ? state
      : {
          ...state,
          id: event.id,
          draft: event.draft,
          filename: event.filename,
          status: "evaluating",
          error: "",
          action: event.action ?? "evaluate",
        };
  if (event.id !== state.id || state.status === "ready") return state;
  if (event.type === "failure")
    return { ...state, status: "unavailable", error: event.error };
  if (event.type === "stored-success") {
    const { view, selection } = event;
    return {
      ...state,
      draft: null,
      filename: `Saved case ${view.snapshot.case_id}`,
      accepted: view.assessment
        ? {
            mode: "dated",
            input: view.assessment.normalized_input,
            result: view.assessment,
            filename: `Saved case ${view.snapshot.case_id}`,
          }
        : null,
      saved: {
        view,
        selection,
        headRevision: selection === "latest" ? view.snapshot.revision : null,
      },
      history: [],
      status: "ready",
      error: "",
      resetPeriod: event.resetPeriod ?? true,
    };
  }
  const history = state.draft?.resetHistory ? [] : state.history;
  return {
    ...state,
    accepted: event.accepted,
    draft: null,
    status: "ready",
    error: "",
    history: state.draft?.edit ? [...history, state.draft.edit] : history,
    saved: null,
    resetPeriod: !!state.draft?.resetHistory,
  };
}
export function applyEdit(input: Input, edit: EditEvent): Input {
  // Paths come exclusively from the workspace's field allowlist, never imported audit strings.
  const path = edit.path.split("/").slice(1);
  const copy = JSON.parse(JSON.stringify(input)) as Input;
  let target: Record<string, unknown> = copy as unknown as Record<
    string,
    unknown
  >;
  for (const k of path.slice(0, -1))
    target = target[k] as Record<string, unknown>;
  target[path[path.length - 1]] = edit.next;
  return copy;
}
export type EditableField = {
  path: string;
  label: string;
  period: string;
  value: number;
  unit: "USD" | "%" | "months";
  min?: number;
  max?: number;
  integer?: boolean;
};
export function validateEdit(
  field: EditableField,
  raw: string,
  rationale: string,
): number {
  if (!/^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(raw.trim()))
    throw new Error("Enter a valid finite number.");
  const display = Number(raw.replace(/,/g, ""));
  const next = field.unit === "%" ? display / 100 : display;
  if (!Number.isFinite(next)) throw new Error("Enter a valid finite number.");
  if (field.integer && !Number.isSafeInteger(next))
    throw new Error("Enter a safe whole number of months.");
  if (
    (field.min !== undefined && next < field.min) ||
    (field.max !== undefined && next > field.max)
  )
    throw new Error(
      `Value is outside the supported range (${field.min ?? "no minimum"} to ${field.max ?? "no maximum"} in API units).`,
    );
  if (!rationale.trim()) throw new Error("A nonblank rationale is required.");
  if (next === field.value) throw new Error("Enter a changed value or cancel.");
  return next;
}
