import type { Accepted, Input, Mode } from "./contracts";
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
};
export const initialWorkspace: Workspace = {
  id: 0,
  accepted: null,
  draft: null,
  filename: "alpine_dated.json",
  status: "evaluating",
  error: "",
  history: [],
};
export type Event =
  | { type: "start"; id: number; draft: Draft | null; filename: string }
  | { type: "success"; id: number; accepted: Accepted }
  | { type: "failure"; id: number; error: string };
export function transition(state: Workspace, event: Event): Workspace {
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
        };
  if (event.id !== state.id || state.status === "ready") return state;
  if (event.type === "failure")
    return { ...state, status: "unavailable", error: event.error };
  const history = state.draft?.resetHistory ? [] : state.history;
  return {
    ...state,
    accepted: event.accepted,
    draft: null,
    status: "ready",
    error: "",
    history: state.draft?.edit ? [...history, state.draft.edit] : history,
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
