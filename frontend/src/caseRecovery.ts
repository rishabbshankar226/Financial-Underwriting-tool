import { apiBase } from "./api";
import {
  date,
  editPath,
  guardCreate,
  guardEdit,
  inputField,
  object,
  rationale,
  requireCase,
  revision,
  sameJson,
  text,
  uuid,
  type EventContext,
  type StoredCase,
} from "./caseContracts";
import type { DatedRequest } from "./contracts";
import type { EditableField, EditEvent } from "./workspace";

export const RECOVERY_KEY = "spreadline.pending-write.v1";
export const LOCATOR_KEY = "spreadline.case-selection.v1";
const MAX_BODY = 1_000_000;
const MAX_JOURNAL = 2_100_000;
type OperationBase = {
  version: "case-write-v1";
  id: string;
  apiBase: string;
  body: string;
};
export type PendingOperation = OperationBase &
  (
    | { kind: "create" }
    | {
        kind: "edit";
        caseId: string;
        baseRevision: number;
        etag: string;
        review: EditableField;
        context: EventContext;
      }
  );
export type Locator = { caseId: string; revision: "latest" | number };
export function browserStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
function size(value: string) {
  return new TextEncoder().encode(value).length;
}
export function guardOperation(
  value: unknown,
  base = apiBase,
): PendingOperation {
  const op = object(value, "recovery operation");
  requireCase(
    op.version === "case-write-v1" &&
      uuid(op.id) &&
      op.apiBase === base &&
      text(op.body) &&
      size(op.body) <= MAX_BODY,
    "recovery version, backend or size",
  );
  const command: unknown = JSON.parse(op.body);
  requireCase(
    JSON.stringify(command) === op.body,
    "unchanged canonical browser command",
  );
  const allowed = ["version", "id", "apiBase", "body", "kind"];
  if (op.kind === "create") guardCreate(command);
  else {
    requireCase(
      op.kind === "edit" && uuid(op.caseId) && revision(op.baseRevision),
      "edit recovery identity",
    );
    requireCase(
      text(op.etag) &&
        new RegExp(
          `^"case-json-v1:${op.caseId}:${op.baseRevision}:[0-9a-f]{64}"$`,
        ).test(op.etag),
      "edit recovery ETag",
    );
    const edit = guardEdit(command),
      field = object(op.review, "review field"),
      context = object(op.context, "review context");
    requireCase(
      field.path === edit.field_path &&
        text(field.label) &&
        text(field.period) &&
        typeof field.value === "number" &&
        Number.isFinite(field.value) &&
        ["USD", "%", "months"].includes(String(field.unit)),
      "recovery review",
    );
    for (const k of ["min", "max"])
      requireCase(
        field[k] === undefined ||
          (typeof field[k] === "number" && Number.isFinite(field[k])),
        "field range",
      );
    requireCase(
      field.integer === undefined || typeof field.integer === "boolean",
      "field integer",
    );
    requireCase(
      Object.keys(field).every((k) =>
        [
          "path",
          "label",
          "period",
          "value",
          "unit",
          "min",
          "max",
          "integer",
        ].includes(k),
      ),
      "review fields",
    );
    const parts = editPath(edit.field_path),
      group = parts[0],
      inputName = parts[parts.length - 1];
    const unit = ["annual_rate", "ownership_percentage"].includes(inputName)
      ? "decimal fraction"
      : inputName === "term_months"
        ? "months"
        : "USD dollars";
    requireCase(
      date(context.assessment_as_of) &&
        context.basis ===
          (group === "years"
            ? "annual_financials"
            : group === "working_capital"
              ? "working_capital"
              : "current_assumptions") &&
        context.unit === unit &&
        field.unit ===
          (unit === "decimal fraction"
            ? "%"
            : unit === "months"
              ? "months"
              : "USD"),
      "recovery context",
    );
    requireCase(
      ["years", "working_capital"].includes(group)
        ? date(context.period_start) &&
            date(context.period_end) &&
            context.period_start <= context.period_end &&
            context.period_end <= context.assessment_as_of
        : context.period_start === null && context.period_end === null,
      "recovery period",
    );
    requireCase(
      group === "guarantors"
        ? context.guarantor_index === Number(parts[1]) &&
            text(context.guarantor_name)
        : context.guarantor_index === null && context.guarantor_name === null,
      "recovery guarantor",
    );
    requireCase(
      Object.keys(context).length === 7 &&
        [
          "basis",
          "assessment_as_of",
          "period_start",
          "period_end",
          "guarantor_index",
          "guarantor_name",
          "unit",
        ].every((k) => k in context),
      "recovery context fields",
    );
    allowed.push("caseId", "baseRevision", "etag", "review", "context");
  }
  requireCase(
    Object.keys(op).length === allowed.length &&
      Object.keys(op).every((k) => allowed.includes(k)),
    "recovery fields",
  );
  const result = op as PendingOperation;
  if (result.kind === "edit") {
    Object.freeze(result.review);
    Object.freeze(result.context);
  }
  return Object.freeze(result);
}
export function makeCreate(
  input: DatedRequest,
  reason: string,
): PendingOperation {
  const command = guardCreate({ input, rationale: rationale(reason) });
  return guardOperation({
    version: "case-write-v1",
    id: crypto.randomUUID(),
    apiBase,
    kind: "create",
    body: JSON.stringify(command),
  });
}
export function makeEdit(
  view: StoredCase,
  edit: EditEvent,
  field: EditableField,
): PendingOperation {
  requireCase(view.assessment, "supported saved assessment");
  const selected = inputField(view.assessment.normalized_input, edit.path);
  requireCase(
    selected.value === edit.prior &&
      field.value === edit.prior &&
      field.path === edit.path &&
      edit.next !== edit.prior,
    "reviewed base input",
  );
  const command = guardEdit({
    field_path: edit.path,
    new_value: edit.next,
    rationale: rationale(edit.rationale),
  });
  return guardOperation({
    version: "case-write-v1",
    id: crypto.randomUUID(),
    apiBase,
    kind: "edit",
    body: JSON.stringify(command),
    caseId: view.snapshot.case_id,
    baseRevision: view.snapshot.revision,
    etag: view.etag,
    review: { ...field },
    context: selected.context,
  });
}
export function saveRecovery(
  storage: Storage | null,
  operation: PendingOperation,
): void {
  try {
    requireCase(storage, "browser recovery storage");
    const op = guardOperation(operation),
      existing = storage.getItem(RECOVERY_KEY);
    if (existing)
      requireCase(
        sameJson(guardOperation(JSON.parse(existing)), op),
        "another unresolved operation",
      );
    const serialized = JSON.stringify(op);
    requireCase(size(serialized) <= MAX_JOURNAL, "recovery journal size");
    storage.setItem(RECOVERY_KEY, serialized);
    requireCase(
      storage.getItem(RECOVERY_KEY) === serialized,
      "persisted recovery record",
    );
  } catch {
    throw new Error(
      "This tab could not keep the write for recovery. Nothing was sent. Resolve its pending record or enable browser session storage before saving.",
    );
  }
}
export function readRecovery(
  storage: Storage | null,
  base = apiBase,
): { operation: PendingOperation | null; error: string } {
  try {
    if (!storage)
      return {
        operation: null,
        error:
          "This browser cannot keep a saved write for recovery. Saved reads and unsaved assessment remain available.",
      };
    const raw = storage.getItem(RECOVERY_KEY);
    if (!raw) return { operation: null, error: "" };
    requireCase(size(raw) <= MAX_JOURNAL, "recovery size");
    return { operation: guardOperation(JSON.parse(raw), base), error: "" };
  } catch {
    return {
      operation: null,
      error:
        "This tab has recovery tracking that cannot be safely restored for this backend. Check saved cases before discarding tracking; a previous write might already be saved.",
    };
  }
}
export function clearRecovery(storage: Storage | null, id: string): void {
  requireCase(storage, "browser recovery storage");
  const raw = storage.getItem(RECOVERY_KEY);
  if (raw)
    requireCase(
      guardOperation(JSON.parse(raw)).id === id,
      "matching recovery record",
    );
  storage.removeItem(RECOVERY_KEY);
  requireCase(
    storage.getItem(RECOVERY_KEY) === null,
    "cleared recovery record",
  );
}
export function discardRecovery(storage: Storage | null): void {
  requireCase(storage, "browser recovery storage");
  storage.removeItem(RECOVERY_KEY);
  requireCase(
    storage.getItem(RECOVERY_KEY) === null,
    "discarded recovery record",
  );
}
export function readLocator(storage: Storage | null): Locator | null {
  try {
    const raw = storage?.getItem(LOCATOR_KEY);
    if (!raw || raw.length > 500) return null;
    const v = object(JSON.parse(raw), "saved selection");
    requireCase(
      v.version === "case-selection-v1" &&
        v.apiBase === apiBase &&
        uuid(v.caseId) &&
        (v.revision === "latest" || revision(v.revision)),
      "saved selection identity",
    );
    requireCase(Object.keys(v).length === 4, "saved selection fields");
    return { caseId: v.caseId, revision: v.revision as "latest" | number };
  } catch {
    return null;
  }
}
export function writeLocator(
  storage: Storage | null,
  locator: Locator | null,
): void {
  try {
    if (!locator) storage?.removeItem(LOCATOR_KEY);
    else
      storage?.setItem(
        LOCATOR_KEY,
        JSON.stringify({ version: "case-selection-v1", apiBase, ...locator }),
      );
  } catch {
    /* A selection hint is optional; the write journal is mandatory. */
  }
}
