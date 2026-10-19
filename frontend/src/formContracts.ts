import {
  compareDecimal,
  parseAnalystAmount,
  parseWholeNumber,
} from "./decimal";

export type FieldKind = "money" | "rate" | "integer" | "text" | "date";
export type FieldSpec = {
  pointer: string;
  label: string;
  kind: FieldKind;
  helper?: string;
  min?: string;
  max?: string;
  optional?: boolean;
  placeholder?: string;
};
export type FormValue = Record<string, unknown>;
export const cloneForm = (value: FormValue): FormValue =>
  JSON.parse(JSON.stringify(value)) as FormValue;
export function pointerParts(pointer: string): string[] {
  if (!pointer.startsWith("/") || /~(?![01])/.test(pointer)) return [];
  return pointer
    .slice(1)
    .split("/")
    .map((value) => value.replace(/~1/g, "/").replace(/~0/g, "~"));
}
export function formValue(value: FormValue, pointer: string): unknown {
  let current: unknown = value;
  for (const key of pointerParts(pointer)) {
    if (
      !current ||
      typeof current !== "object" ||
      !Object.prototype.hasOwnProperty.call(current, key)
    )
      return "";
    current = (current as FormValue)[key];
  }
  return current;
}
export function setFormValue(
  value: FormValue,
  pointer: string,
  next: unknown,
): FormValue {
  const copy = cloneForm(value),
    keys = pointerParts(pointer);
  if (
    !keys.length ||
    keys.some((key) => ["__proto__", "constructor", "prototype"].includes(key))
  )
    throw new Error("Unsupported form field path.");
  let target = copy;
  for (const key of keys.slice(0, -1)) {
    if (
      !Object.prototype.hasOwnProperty.call(target, key) ||
      !target[key] ||
      typeof target[key] !== "object"
    )
      throw new Error("The parent form group is unavailable.");
    target = target[key] as FormValue;
  }
  if (keys.length) target[keys[keys.length - 1]] = next;
  return copy;
}
export function parseField(
  spec: FieldSpec,
  value: unknown,
): string | number | null {
  const raw =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  if (spec.optional && !raw.trim()) return null;
  if (!raw.trim()) throw new Error("Enter a value for this field.");
  if (spec.kind === "text") return raw;
  if (spec.kind === "date") {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(raw) ||
      !Number.isFinite(Date.parse(raw)) ||
      new Date(raw).toISOString().slice(0, 10) !== raw
    )
      throw new Error("Enter a valid calendar date, for example 2025-12-31.");
    return raw;
  }
  const parsed =
    spec.kind === "integer"
      ? parseWholeNumber(raw)
      : parseAnalystAmount(raw, { currency: spec.kind === "money" });
  if (!parsed.ok) throw new Error(parsed.message);
  if (
    (spec.min !== undefined && compareDecimal(parsed.value, spec.min) < 0) ||
    (spec.max !== undefined && compareDecimal(parsed.value, spec.max) > 0)
  )
    throw new Error(
      `Use ${spec.min ?? "the supported minimum"} through ${spec.max ?? "the supported maximum"}.`,
    );
  if (spec.kind !== "integer") return parsed.value;
  // Only declared integer fields cross into the JS integer domain.
  const integer = Number(parsed.value);
  if (!Number.isSafeInteger(integer))
    throw new Error("Enter an exact safe integer.");
  return integer;
}

function record(value: unknown): FormValue {
  return value as FormValue;
}
export function structuralHints(
  value: FormValue,
): { label: string; valid: boolean }[] {
  if (value.schema_version !== "commercial-assessment-v2") return [];
  const years = value.years as { period_start: string; period_end: string }[];
  const validDate = (date: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date;
  const complete = years.every((year) => {
    if (
      !validDate(year.period_start) ||
      !validDate(year.period_end) ||
      !year.period_start.endsWith("-01")
    )
      return false;
    const start = new Date(`${year.period_start}T00:00:00Z`);
    const end = new Date(start);
    end.setUTCFullYear(start.getUTCFullYear() + 1, start.getUTCMonth(), 0);
    return end.toISOString().slice(0, 10) === year.period_end;
  });
  const ordered = years.every(
    (year, index) =>
      validDate(year.period_start) &&
      validDate(year.period_end) &&
      (index === 0 || year.period_start > years[index - 1].period_end),
  );
  const capital = record(value.working_capital),
    last = years[years.length - 1];
  return [
    { label: "Complete fiscal years", valid: complete },
    { label: "Ordered, non-overlapping periods", valid: ordered },
    {
      label: "Working capital matches latest period",
      valid:
        !!last?.period_end &&
        capital.period_start === last.period_start &&
        capital.period_end === last.period_end,
    },
  ];
}
