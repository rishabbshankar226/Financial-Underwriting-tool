import {
  annualFields,
  guardAssessment,
  guardDatedInput,
  type Assessment,
  type DatedRequest,
} from "./contracts";

type Obj = Record<string, unknown>;
export type CaseCreate = { input: DatedRequest; rationale: string };
export type CaseEdit = {
  field_path: string;
  new_value: number;
  rationale: string;
};
export type EventContext = {
  basis:
    | "case_creation"
    | "annual_financials"
    | "working_capital"
    | "current_assumptions";
  assessment_as_of: string;
  period_start: string | null;
  period_end: string | null;
  guarantor_index: number | null;
  guarantor_name: string | null;
  unit: string | null;
};
export type CaseEvent = {
  kind: "creation" | "edit";
  case_id: string;
  revision: number;
  run_id: string;
  field_path: string | null;
  before: number | null;
  after: number | null;
  context: EventContext;
  rationale: string;
  actor: "prototype-demo-unverified";
  recorded_at: string;
};
export type Recording = {
  python_version: string;
  sqlite_version: string;
  packages: Record<string, string>;
  dependency_baseline_sha256: string;
  source_revision: string | null;
  source_status: "build_reported" | "development_unverified";
};
export type CaseSnapshot = {
  storage_serialization_version: "case-json-v1";
  case_id: string;
  revision: number;
  parent_revision: number | null;
  run_id: string;
  recorded_at: string;
  normalized_input: Obj;
  input_hash: string;
  assessment: Obj;
  event: CaseEvent;
  recording: Recording;
  payload_hash: string;
};
export type StoredCase = {
  snapshot: CaseSnapshot;
  etag: string;
  assessment: Assessment | null;
  compatibility: string | null;
};
export type CaseSummary = {
  case_id: string;
  borrower_name: string;
  created_at: string;
  revision: number;
  run_id: string;
  recorded_at: string;
};
export type RevisionSummary = {
  case_id: string;
  revision: number;
  parent_revision: number | null;
  run_id: string;
  recorded_at: string;
  rationale: string;
};
export type Page<T> = { items: T[]; next_cursor: string | null };
export type Replay = {
  case_id: string;
  revision: number;
  run_id: string;
  status: "matched" | "mismatch" | "replay_unavailable";
  differences: string[];
  explanation: string;
};

export function requireCase(ok: unknown, field: string): asserts ok {
  if (!ok) throw new Error(`Invalid saved-case response or command: ${field}.`);
}
export function object(value: unknown, field: string): Obj {
  requireCase(
    value !== null && typeof value === "object" && !Array.isArray(value),
    field,
  );
  return value as Obj;
}
export const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
export const text = (v: unknown): v is string => typeof v === "string";
export const uuid = (v: unknown): v is string =>
  text(v) && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
export const revision = (v: unknown): v is number =>
  Number.isSafeInteger(v) && Number(v) >= 1;
export const hash = (v: unknown) => text(v) && /^[0-9a-f]{64}$/.test(v);
export const date = (v: unknown): v is string =>
  text(v) &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export const timestamp = (v: unknown): v is string =>
  text(v) &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(v) &&
  date(v.slice(0, 10)) &&
  Number.isFinite(Date.parse(v));
export function finiteJson(value: unknown, depth = 0, maxDepth = 64): void {
  requireCase(depth < maxDepth, "JSON depth");
  if (value === null || text(value) || typeof value === "boolean") return;
  if (typeof value === "number") {
    requireCase(finite(value), "finite JSON number");
    return;
  }
  requireCase(typeof value === "object", "JSON value");
  for (const child of Object.values(value as Obj)) finiteJson(child, depth + 1, maxDepth);
}
export function sameJson(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (
    !a ||
    !b ||
    typeof a !== "object" ||
    typeof b !== "object" ||
    Array.isArray(a) !== Array.isArray(b)
  )
    return false;
  const ak = Object.keys(a),
    bk = Object.keys(b);
  return (
    ak.length === bk.length &&
    ak.every(
      (k) =>
        Object.prototype.hasOwnProperty.call(b, k) &&
        sameJson((a as Obj)[k], (b as Obj)[k]),
    )
  );
}
function exact(value: Obj, keys: readonly string[]) {
  requireCase(
    Object.keys(value).length === keys.length &&
      keys.every((k) => Object.prototype.hasOwnProperty.call(value, k)),
    "command fields",
  );
}
export function rationale(value: unknown): string {
  requireCase(
    text(value) && [...value].length <= 2000 && value.trim().length > 0,
    "nonblank rationale, at most 2,000 characters",
  );
  return value.trim();
}
const editGroups: Record<string, readonly string[]> = {
  years: annualFields,
  existing_debt: ["cpltd_annual", "operating_lease_annual"],
  proposed_loan: ["amount", "annual_rate", "term_months"],
  guarantors: [
    "ownership_percentage",
    "wages",
    "interest_dividend_income",
    "mortgage_pi_annual",
    "auto_loan_annual",
    "credit_card_min_annual",
  ],
  working_capital: [
    "ar_increase",
    "inventory_increase",
    "ap_increase",
    "cash_taxes_paid",
  ],
};
export function editPath(path: unknown): string[] {
  requireCase(
    text(path) && path.length <= 160 && path.startsWith("/"),
    "numeric field path",
  );
  const parts = path.slice(1).split("/"),
    group = parts[0],
    field = parts[parts.length - 1];
  requireCase(
    Object.prototype.hasOwnProperty.call(editGroups, group) &&
      editGroups[group].includes(field),
    "numeric field allowlist",
  );
  requireCase(
    ["years", "guarantors"].includes(group)
      ? parts.length === 3 && /^(?:0|[1-9][0-9]{0,8})$/.test(parts[1])
      : parts.length === 2,
    "field index",
  );
  return parts;
}
export function inputField(
  input: Obj | DatedRequest,
  path: string,
): { value: number; context: EventContext } {
  const parts = editPath(path),
    group = parts[0],
    field = parts[parts.length - 1];
  const data = input as unknown as Obj;
  let target: Obj;
  const context: EventContext = {
    basis: "current_assumptions",
    assessment_as_of: String(data.assessment_as_of),
    period_start: null,
    period_end: null,
    guarantor_index: null,
    guarantor_name: null,
    unit: "USD dollars",
  };
  if (parts.length === 3) {
    const entries = data[group];
    requireCase(
      Array.isArray(entries) && Number(parts[1]) < entries.length,
      "existing input index",
    );
    target = object(entries[Number(parts[1])], "input row");
    if (group === "guarantors") {
      context.guarantor_index = Number(parts[1]);
      context.guarantor_name = String(target.name);
    } else context.basis = "annual_financials";
  } else {
    target = object(data[group], "input group");
    if (group === "working_capital") context.basis = "working_capital";
  }
  if (["annual_financials", "working_capital"].includes(context.basis)) {
    requireCase(
      date(target.period_start) && date(target.period_end),
      "input dates",
    );
    context.period_start = target.period_start;
    context.period_end = target.period_end;
  }
  if (["annual_rate", "ownership_percentage"].includes(field))
    context.unit = "decimal fraction";
  if (field === "term_months") context.unit = "months";
  requireCase(finite(target[field]), "numeric input");
  return { value: target[field], context };
}
export function guardCreate(value: unknown): CaseCreate {
  const command = object(value, "create command");
  exact(command, ["input", "rationale"]);
  const input = guardDatedInput(command.input);
  exact(input as unknown as Obj, [
    "schema_version",
    "assessment_as_of",
    "borrower_name",
    "geography",
    "units",
    "years",
    "existing_debt",
    "proposed_loan",
    "guarantors",
    "working_capital",
  ]);
  exact(input.units, ["currency", "monetary_unit", "annual_rate_unit"]);
  for (const year of input.years)
    exact(year, [...annualFields, "period_start", "period_end"]);
  exact(input.existing_debt, editGroups.existing_debt);
  exact(input.proposed_loan, [
    ...editGroups.proposed_loan,
    "rate_type",
    "repayment_type",
    "payment_frequency",
  ]);
  for (const g of input.guarantors)
    exact(g, ["name", ...editGroups.guarantors]);
  exact(input.working_capital, [
    ...editGroups.working_capital,
    "period_start",
    "period_end",
  ]);
  finiteJson(command);
  rationale(command.rationale);
  return command as CaseCreate;
}
export function guardEdit(value: unknown): CaseEdit {
  const command = object(value, "edit command");
  exact(command, ["field_path", "new_value", "rationale"]);
  editPath(command.field_path);
  requireCase(finite(command.new_value), "finite edit value");
  rationale(command.rationale);
  if (command.field_path === "/proposed_loan/term_months")
    requireCase(
      Number.isSafeInteger(command.new_value) && command.new_value >= 12,
      "whole term months",
    );
  return command as CaseEdit;
}
export function guardSavedCase(
  value: unknown,
  etag: string | null,
): StoredCase {
  const s = object(value, "snapshot");
  finiteJson(s);
  requireCase(
    s.storage_serialization_version === "case-json-v1" &&
      uuid(s.case_id) &&
      uuid(s.run_id) &&
      revision(s.revision),
    "snapshot identity",
  );
  requireCase(
    s.parent_revision === (s.revision === 1 ? null : s.revision - 1) &&
      timestamp(s.recorded_at),
    "snapshot parent/time",
  );
  requireCase(hash(s.input_hash) && hash(s.payload_hash), "snapshot hashes");
  requireCase(
    etag === `"case-json-v1:${s.case_id}:${s.revision}:${s.payload_hash}"`,
    "strong ETag",
  );
  const input = object(s.normalized_input, "stored input"),
    a = object(s.assessment, "stored assessment");
  requireCase(
    text(a.schema_version) &&
      text(a.calculation_version) &&
      text(a.serialization_version),
    "assessment versions",
  );
  const known =
    a.schema_version === "commercial-assessment-v1" &&
    a.calculation_version === "commercial-calculation-v1" &&
    a.serialization_version === "assessment-json-v1";
  const assessment = known ? guardAssessment(a) : null;
  if (assessment)
    requireCase(
      sameJson(input, assessment.normalized_input),
      "outer normalized input",
    );
  const e = object(s.event, "event"),
    c = object(e.context, "event context");
  requireCase(
    e.case_id === s.case_id &&
      e.revision === s.revision &&
      e.run_id === s.run_id &&
      e.recorded_at === s.recorded_at &&
      e.actor === "prototype-demo-unverified",
    "event identity",
  );
  rationale(e.rationale);
  requireCase(date(c.assessment_as_of), "event as-of");
  requireCase(
    (c.period_start === null && c.period_end === null) ||
      (date(c.period_start) &&
        date(c.period_end) &&
        c.period_start <= c.period_end),
    "event period",
  );
  requireCase(
    (c.guarantor_index === null && c.guarantor_name === null) ||
      (Number.isSafeInteger(c.guarantor_index) &&
        Number(c.guarantor_index) >= 0 &&
        text(c.guarantor_name)),
    "event guarantor",
  );
  if (s.revision === 1) {
    requireCase(
      e.kind === "creation" &&
        e.field_path === null &&
        e.before === null &&
        e.after === null &&
        c.basis === "case_creation" &&
        c.unit === null &&
        c.period_start === null &&
        c.guarantor_index === null,
      "creation event",
    );
  } else {
    requireCase(
      e.kind === "edit" &&
        finite(e.before) &&
        finite(e.after) &&
        e.before !== e.after &&
        text(e.field_path),
      "edit event",
    );
    editPath(e.field_path);
    requireCase(
      ["annual_financials", "working_capital", "current_assumptions"].includes(
        String(c.basis),
      ) &&
        ["USD dollars", "decimal fraction", "months"].includes(String(c.unit)),
      "edit context",
    );
    if (assessment) {
      const selected = inputField(assessment.normalized_input, e.field_path);
      requireCase(
        selected.value === e.after && sameJson(selected.context, c),
        "server-derived edit context",
      );
    }
  }
  if (assessment)
    requireCase(
      c.assessment_as_of === assessment.normalized_input.assessment_as_of,
      "event assumptions date",
    );
  guardRecording(s.recording);
  return {
    snapshot: s as CaseSnapshot,
    etag: etag!,
    assessment,
    compatibility: known
      ? null
      : `Stored assessment definition: ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON is available; typed display and editing are unavailable.`,
  };
}
export function guardRecording(value: unknown): Recording {
  const r = object(value, "recording metadata"),
    packages = object(r.packages, "installed packages");
  requireCase(
    text(r.python_version) &&
      text(r.sqlite_version) &&
      hash(r.dependency_baseline_sha256),
    "recording versions",
  );
  for (const name of ["fastapi", "pydantic", "starlette", "uvicorn"])
    requireCase(
      text(packages[name]) && packages[name].length > 0,
      `installed ${name}`,
    );
  requireCase(
    r.source_status === "development_unverified"
      ? r.source_revision === null
      : r.source_status === "build_reported" &&
          text(r.source_revision) &&
          /^[0-9a-f]{40}$/.test(r.source_revision),
    "recorded source",
  );
  return r as Recording;
}
function page(value: unknown): Obj {
  const p = object(value, "page");
  requireCase(
    Array.isArray(p.items) && p.items.length <= 25,
    "bounded page items",
  );
  requireCase(
    p.next_cursor === null ||
      (text(p.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(p.next_cursor)),
    "page cursor",
  );
  return p;
}
function summary(v: unknown): Obj {
  const s = object(v, "summary");
  requireCase(
    uuid(s.case_id) &&
      uuid(s.run_id) &&
      revision(s.revision) &&
      timestamp(s.recorded_at),
    "summary identity",
  );
  return s;
}
export function guardCasePage(value: unknown): Page<CaseSummary> {
  const p = page(value);
  const ids = new Set<string>();
  for (const v of p.items as unknown[]) {
    const s = summary(v);
    requireCase(
      text(s.borrower_name) &&
        timestamp(s.created_at) &&
        !ids.has(s.case_id as string),
      "case summary",
    );
    ids.add(s.case_id as string);
  }
  return p as Page<CaseSummary>;
}
export function guardRevisionPage(
  value: unknown,
  caseId: string,
): Page<RevisionSummary> {
  const p = page(value);
  let previous = Infinity;
  for (const v of p.items as unknown[]) {
    const s = summary(v);
    requireCase(
      s.case_id === caseId &&
        s.parent_revision ===
          (s.revision === 1 ? null : Number(s.revision) - 1) &&
        Number(s.revision) < previous,
      "revision summary",
    );
    rationale(s.rationale);
    previous = Number(s.revision);
  }
  return p as Page<RevisionSummary>;
}
export function guardReplay(value: unknown, view: StoredCase): Replay {
  const r = object(value, "replay");
  const s = view.snapshot;
  requireCase(
    r.case_id === s.case_id &&
      r.revision === s.revision &&
      r.run_id === s.run_id &&
      ["matched", "mismatch", "replay_unavailable"].includes(String(r.status)),
    "replay identity/status",
  );
  requireCase(
    Array.isArray(r.differences) &&
      r.differences.every(text) &&
      text(r.explanation),
    "replay details",
  );
  requireCase(
    r.status !== "matched" || r.differences.length === 0,
    "matched replay differences",
  );
  return r as Replay;
}
