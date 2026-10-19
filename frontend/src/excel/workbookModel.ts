import type { DatedRequest } from "../contracts";
import { compareDecimal, inputDecimal, shiftDecimal } from "../decimal";
import { parseField } from "../formContracts";
import {
  HEADER_ROW,
  TEMPLATE_VERSION,
  workbookSheets,
  type WorkbookField,
} from "./workbookFields";

export type WorkbookIssue = {
  pointer: string;
  sheet: string;
  cell: string;
  message: string;
};
export type ReviewField = WorkbookField & {
  pointer: string;
  sheet: string;
  cell: string;
  group: string;
  value: string;
  readError?: string;
};
export type WorkbookReview = { fields: ReviewField[] };
export type WorkbookSheet = { sheet: string; data: unknown[][] };
const blank = (value: unknown) =>
  value === null || value === undefined || value === "";
export function columnName(index: number): string {
  let name = "";
  for (let next = index + 1; next > 0; next = Math.floor((next - 1) / 26))
    name = String.fromCharCode(65 + ((next - 1) % 26)) + name;
  return name;
}
export function createReview(sheets: WorkbookSheet[]): WorkbookReview {
  if (
    sheets.length !== workbookSheets.length ||
    new Set(sheets.map((s) => s.sheet)).size !== sheets.length ||
    sheets.some((s) => !workbookSheets.some((c) => c.name === s.sheet))
  )
    throw new Error(
      "Use the five sheets in the Spreadline Excel template without renaming them.",
    );
  const fields: ReviewField[] = [];
  for (const config of workbookSheets) {
    const rows = sheets.find((s) => s.sheet === config.name)!.data;
    if (rows[3]?.[1] !== TEMPLATE_VERSION)
      throw new Error(
        `${config.name}!B4: use template version ${TEMPLATE_VERSION}.`,
      );
    const header = (rows[HEADER_ROW - 1] ?? []).slice();
    while (header.length && blank(header[header.length - 1])) header.pop();
    if (header[0] !== "Field")
      throw new Error(
        `${config.name}!A7: restore the Field header from the template.`,
      );
    const format = header.indexOf("Format");
    if (format < 2 || format !== header.length - 1)
      throw new Error(
        `${config.name}: keep the Format column after the input columns.`,
      );
    const columns = header.slice(1, format);
    if (
      columns.length > config.maximum ||
      (config.prefix === null && columns.length !== 1)
    )
      throw new Error(
        `${config.name}: the number of input columns exceeds the template limit.`,
      );
    columns.forEach((name, i) => {
      if (name !== (config.prefix ? `${config.prefix} ${i + 1}` : "Value"))
        throw new Error(
          `${config.name}!${columnName(i + 1)}7: restore the template column heading.`,
        );
    });
    const labels = new Map<string, number>();
    for (let row = HEADER_ROW; row < rows.length; row++) {
      const values = rows[row];
      if (values.every(blank)) continue;
      const label = values[0];
      if (
        typeof label !== "string" ||
        !config.fields.some((f) => f.label === label)
      )
        throw new Error(
          `${config.name}!A${row + 1}: unknown field label. Use the template labels.`,
        );
      if (labels.has(label))
        throw new Error(
          `${config.name}!A${row + 1}: duplicate field label ${label}.`,
        );
      if (values.slice(format + 1).some((v) => !blank(v)))
        throw new Error(
          `${config.name}: unexpected data beyond the template columns.`,
        );
      labels.set(label, row);
    }
    for (const field of config.fields)
      if (!labels.has(field.label))
        throw new Error(
          `${config.name}: restore the missing field label ${field.label}.`,
        );
    const active = columns.map((_, col) =>
      config.fields.some((f) => !blank(rows[labels.get(f.label)!]?.[col + 1])),
    );
    let encounteredEmpty = false;
    active.forEach((value) => {
      if (!value) encounteredEmpty = true;
      else if (encounteredEmpty && config.prefix)
        throw new Error(
          `${config.name}: remove empty input columns between populated columns.`,
        );
    });
    const last = Math.max(0, active.lastIndexOf(true));
    for (let column = 0; column <= last; column++)
      for (const field of config.fields) {
        const row = labels.get(field.label)!,
          raw = rows[row]?.[column + 1];
        let value = "",
          readError: string | undefined;
        if (raw instanceof Date) {
          if (
            !Number.isFinite(raw.getTime()) ||
            raw.getUTCHours() !== 0 ||
            raw.getUTCMinutes() !== 0 ||
            raw.getUTCSeconds() !== 0 ||
            raw.getUTCMilliseconds() !== 0
          )
            readError = "Use a calendar date without a time.";
          else if (field.kind !== "date")
            readError =
              "This financial cell is formatted as a date. Restore its text format and value.";
          else value = raw.toISOString().slice(0, 10);
        } else if (typeof raw === "string") {
          if (raw.length > 2000)
            throw new Error(
              `${config.name}!${columnName(column + 1)}${row + 1}: input text exceeds 2,000 characters.`,
            );
          value = raw;
        } else if (!blank(raw))
          readError =
            "Use text or an exact numeric Excel cell, not a boolean or unsupported cell type.";
        const prefix =
          config.name === "Financials"
            ? `/years/${column}/`
            : config.name === "Guarantors"
              ? `/guarantors/${column}/`
              : config.name === "Working capital"
                ? "/working_capital/"
                : "/";
        fields.push({
          ...field,
          pointer: prefix + field.key.replace(/\./g, "/"),
          sheet: config.name,
          cell: `${columnName(column + 1)}${row + 1}`,
          group: config.prefix ? `${config.prefix} ${column + 1}` : config.name,
          value,
          readError,
        });
      }
  }
  return { fields };
}
export function parseWorkbookField(field: ReviewField): string | number {
  if (field.readError) throw new Error(field.readError);
  const raw = field.value.trim();
  if (raw.length > 2000)
    throw new Error("Use no more than 2,000 characters in an input cell.");
  if (
    field.kind === "text" ||
    field.kind === "date" ||
    field.kind === "integer"
  ) {
    if (field.kind === "date" && raw.startsWith("0000-"))
      throw new Error("Use a supported calendar year from 0001 onward.");
    return parseField({ ...field, placeholder: undefined }, raw) as
      | string
      | number;
  }
  const percent = field.kind === "rate" && raw.endsWith("%");
  const token = percent ? raw.slice(0, -1).trim() : raw;
  let value = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(token)
    ? inputDecimal(token)
    : (parseField(
        { ...field, kind: "money", min: undefined, max: undefined },
        token,
      ) as string);
  if (percent) value = inputDecimal(shiftDecimal(value, -2));
  if (
    (field.min !== undefined && compareDecimal(value, field.min) < 0) ||
    (field.max !== undefined && compareDecimal(value, field.max) > 0)
  )
    throw new Error(
      `Use ${field.min ?? "the supported minimum"} through ${field.max ?? "the supported maximum"}.`,
    );
  return value;
}
export function validateReview(review: WorkbookReview): {
  input: DatedRequest | null;
  issues: WorkbookIssue[];
} {
  const issues: WorkbookIssue[] = [],
    values = new Map<string, string | number>();
  const groups = new Map<string, ReviewField[]>();
  for (const field of review.fields) {
    const key = field.sheet + field.group;
    groups.set(key, [...(groups.get(key) ?? []), field]);
  }
  const skipped = new Set(
    [...groups.values()]
      .filter(
        (group) =>
          group[0].sheet === "Guarantors" &&
          group.every((f) => !f.value.trim() && !f.readError),
      )
      .flatMap((group) => group.map((f) => f.pointer)),
  );
  for (const field of review.fields) {
    if (skipped.has(field.pointer)) continue;
    try {
      values.set(field.pointer, parseWorkbookField(field));
    } catch (reason) {
      issues.push({
        ...field,
        message:
          reason instanceof Error ? reason.message : "Review this value.",
      });
    }
  }
  const issue = (pointer: string, message: string) => {
    const field = review.fields.find((f) => f.pointer === pointer);
    if (field)
      issues.push({ pointer, sheet: field.sheet, cell: field.cell, message });
  };
  if (issues.length) return { input: null, issues };
  const output: Record<string, unknown> = {
    schema_version: "commercial-assessment-v2",
    units: {
      currency: "USD",
      monetary_unit: "dollars",
      annual_rate_unit: "decimal_nominal",
    },
    years: [],
    guarantors: [],
    proposed_loan: {
      rate_type: "fixed",
      repayment_type: "fully_amortizing",
      payment_frequency: "monthly",
    },
    existing_debt: {},
    working_capital: {},
  };
  for (const [pointer, value] of values) {
    const path = pointer.slice(1).split("/");
    let target = output;
    for (const key of path.slice(0, -1)) {
      if (target[key] === undefined) target[key] = {};
      target = target[key] as Record<string, unknown>;
    }
    target[path[path.length - 1]] = value;
  }
  const input = output as unknown as DatedRequest;
  for (let i = 0; i < input.years.length; i++) {
    const year = input.years[i],
      start = new Date(`${year.period_start}T00:00:00Z`),
      end = new Date(start);
    end.setUTCFullYear(start.getUTCFullYear() + 1, start.getUTCMonth(), 0);
    if (!year.period_start.endsWith("-01") || start.getUTCFullYear() === 9999)
      issue(
        `/years/${i}/period_start`,
        "Start a complete fiscal year on the first day of a month.",
      );
    if (end.toISOString().slice(0, 10) !== year.period_end)
      issue(
        `/years/${i}/period_end`,
        "Use twelve complete calendar months for this financial year.",
      );
    if (i && year.period_start <= input.years[i - 1].period_end)
      issue(
        `/years/${i}/period_start`,
        "List unique, non-overlapping financial years oldest first.",
      );
    if (year.period_end > input.assessment_as_of)
      issue(
        `/years/${i}/period_end`,
        "The financial year must end on or before the assessment date.",
      );
  }
  const latest = input.years[input.years.length - 1];
  for (const key of ["period_start", "period_end"] as const)
    if (input.working_capital[key] !== latest[key])
      issue(
        `/working_capital/${key}`,
        "Match the latest financial year's dates.",
      );
  if (new TextEncoder().encode(JSON.stringify(input)).length > 1_000_000)
    issue(
      "/borrower_name",
      "The resulting case exceeds the existing request-size limit.",
    );
  return { input: issues.length ? null : input, issues };
}
