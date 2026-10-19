import {
  compareDecimal,
  decimalEqual,
  groupDecimal,
  parseAnalystAmount,
  parsePercentInput,
  parseWholeNumber,
  shiftDecimal,
} from "./decimal";
import type { Accepted, Input, Mode } from "./contracts";
import type { StoredCase } from "./caseContracts";
import { readLocator, readRecovery } from "./caseRecovery";
export type StoredSelection = {
  view: StoredCase;
  selection: "latest" | "revision" | "receipt";
  headRevision: number | null;
};
export type EditEvent = {
  path: string;
  prior: string | number;
  next: string | number;
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
  /** `idle` is a fresh tab with nothing to restore: the start screen, before any case is chosen. */
  status: "idle" | "evaluating" | "ready" | "unavailable";
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
  filename: "",
  status: "idle",
  error: "",
  history: [],
  saved: null,
  action: "evaluate",
  resetPeriod: true,
};
export const pendingWriteMessage =
  "A saved write needs confirmation. Retry the exact write; no proposal is accepted locally yet.";
/** The first render for this tab, decided from its recovery journal and selection hint before any request:
 * an unconfirmed case write first, then a remembered saved selection, otherwise the start screen. */
export function initialWorkspaceFor(storage: Storage | null): Workspace {
  const pending = readRecovery(storage).operation;
  if (pending && pending.kind !== "comparison")
    return { ...initialWorkspace, status: "unavailable", action: "write", filename: "Pending saved write", error: pendingWriteMessage };
  const locator = readLocator(storage);
  const caseId = locator?.caseId ?? (pending?.kind === "comparison" ? pending.caseId : null);
  return caseId ? { ...initialWorkspace, status: "evaluating", action: "open", filename: `Saved case ${caseId}` } : initialWorkspace;
}
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
  value: string | number;
  unit: "USD" | "%" | "months";
  min?: string | number;
  max?: string | number;
  integer?: boolean;
};
function boundText(value: string | number, unit: EditableField["unit"]): string {
  if (unit === "%") return `${shiftDecimal(String(value), 2)}%`;
  if (unit === "months") return `${value} month${String(value) === "1" ? "" : "s"}`;
  return `$${groupDecimal(String(value))}`;
}
function rangeText(field: EditableField): string {
  const { min, max, unit } = field;
  if (min !== undefined && max !== undefined) return `${boundText(min, unit)} to ${boundText(max, unit)}`;
  return min !== undefined ? `${boundText(min, unit)} or more` : `up to ${boundText(max!, unit)}`;
}
/** Parse an edit as typed in display units ($ amounts, percentages, whole months) into exact API units. */
export function validateEdit(
  field: EditableField,
  raw: string,
  rationale: string,
  options: { requireRationale?: boolean } = {},
): string | number {
  const parsed =
    field.unit === "%" ? parsePercentInput(raw) : field.integer ? parseWholeNumber(raw) : parseAnalystAmount(raw);
  if (!parsed.ok) throw new Error(parsed.message);
  const decimal = parsed.value;
  let next: string | number = decimal;
  if (field.integer) {
    if (!Number.isSafeInteger(Number(decimal))) throw new Error("Enter a safe whole number of months.");
    next = Number(decimal);
  }
  if ((field.min !== undefined && compareDecimal(decimal, String(field.min)) < 0) ||
      (field.max !== undefined && compareDecimal(decimal, String(field.max)) > 0))
    throw new Error(`Value is outside the allowed range: ${rangeText(field)}.`);
  if ((options.requireRationale ?? true) && !rationale.trim()) throw new Error("A nonblank rationale is required.");
  if (decimalEqual(next, field.value)) throw new Error("Enter a changed value or cancel.");
  return next;
}
