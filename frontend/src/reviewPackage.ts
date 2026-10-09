import { guardSavedCase, object, requireCase, sameJson, type StoredCase, type CaseSnapshot } from "./caseContracts";
import { guardComparison, type StoredComparison, type ComparisonRecord } from "./scenarioContracts";
import { prototypeDisclaimer } from "./prototypeDisclaimer";

export const MAX_EXPORT_BYTES = 16777216;
export type ReviewSource = ReturnType<typeof captureReviewSource>;

export function reviewFilename(snapshot: CaseSnapshot, comparison: ComparisonRecord | null) {
  return `spreadline-case-${snapshot.case_id}-r${snapshot.revision}-${snapshot.run_id}${comparison ? `-comparison-${comparison.comparison_id}` : ""}.json`;
}

// Freeze a plain parsed JSON representation; do not invoke getters/toJSON or
// merge imported keys into configuration objects. Source guards keep their depths.
function frozenJson<T>(value: T, maxDepth: number): T {
  const ancestors = new Set<object>();
  function copy(v: unknown, depth: number): unknown {
    requireCase(depth < maxDepth, "export source JSON depth");
    if (v === null || typeof v === "string" || typeof v === "boolean") return v;
    if (typeof v === "number") { requireCase(Number.isFinite(v), "export finite number"); return v; }
    requireCase(typeof v === "object" && v !== null, "export JSON value");
    const obj = v as Record<string, unknown>;
    requireCase(!ancestors.has(obj), "export JSON cycle");
    requireCase(Object.getOwnPropertySymbols(obj).length === 0, "export JSON symbol keys");
    const array = Array.isArray(obj);
    requireCase(array || Object.getPrototypeOf(obj) === Object.prototype || Object.getPrototypeOf(obj) === null, "export plain JSON object");
    const names = Object.getOwnPropertyNames(obj).filter(k => !array || k !== "length");
    if (array) requireCase(names.length === obj.length && names.every((k, i) => k === String(i)), "export dense JSON array");
    ancestors.add(obj);
    const result: Record<string, unknown> | unknown[] = array ? [] : Object.create(null);
    for (const key of names) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key)!;
      requireCase(descriptor.enumerable && "value" in descriptor, "export plain JSON property");
      (result as Record<string, unknown>)[key] = copy(descriptor.value, depth + 1);
    }
    ancestors.delete(obj);
    return Object.freeze(result);
  }
  return copy(value, 0) as T;
}

export function comparisonMatches(view: StoredCase, comparison: StoredComparison): void {
  const s = view.snapshot, r = comparison.record, b = object(r.preview.baseline, "export comparison baseline");
  requireCase(r.case_id === s.case_id && r.baseline_revision === s.revision && r.baseline_run_id === s.run_id &&
    b.case_id === s.case_id && b.revision === s.revision && b.run_id === s.run_id &&
    b.input_hash === s.input_hash && b.payload_hash === s.payload_hash && sameJson(b.assessment, s.assessment),
    "retained comparison must match the selected original case, revision, run, hashes and full baseline assessment");
}

export function captureReviewSource(view: StoredCase, included: StoredComparison | null) {
  const snapshot = frozenJson(view.snapshot, 64);
  const original = guardSavedCase(snapshot, view.etag);
  const comparison = included === null ? null : guardComparison(frozenJson(included.record, 100), included.etag);
  if (comparison) comparisonMatches(original, comparison);
  const filename = reviewFilename(snapshot, comparison?.record ?? null);
  const reviewPackage = Object.freeze({
    schema_version: "spreadline-review-package-v1",
    serialization_version: "review-package-json-v1",
    scope: "saved_case_revision",
    case: Object.freeze({ etag: original.etag, snapshot }),
    comparison: comparison ? Object.freeze({ etag: comparison.etag, record: comparison.record }) : null,
    provenance: Object.freeze({ representation: "browser_parsed_json", actor_status: "prototype_unverified", integrity_status: "recorded_hashes_not_verified_by_export" }),
    disclaimer: prototypeDisclaimer,
  });
  return { package: reviewPackage, filename, view: original, comparison };
}

function* quoted(value: string): Generator<string> {
  yield '"';
  for (let start = 0; start < value.length;) {
    let end = Math.min(start + 4096, value.length);
    // JSON.stringify must see each valid surrogate pair in a single segment.
    if (end < value.length && value.charCodeAt(end - 1) >= 0xd800 && value.charCodeAt(end - 1) <= 0xdbff &&
      value.charCodeAt(end) >= 0xdc00 && value.charCodeAt(end) <= 0xdfff) end--;
    yield JSON.stringify(value.slice(start, end)).slice(1, -1);
    start = end;
  }
  yield '"';
}

function* tokens(value: unknown, depth = 0, ancestors = new Set<object>()): Generator<string> {
  requireCase(depth < 104, "export envelope JSON depth");
  if (typeof value === "string") { yield* quoted(value); return; }
  if (value === null || typeof value === "boolean") { yield String(value); return; }
  if (typeof value === "number") { requireCase(Number.isFinite(value), "export finite number"); yield JSON.stringify(value); return; }
  requireCase(typeof value === "object" && value !== null, "export JSON value");
  const obj = value as Record<string, unknown>, array = Array.isArray(obj);
  requireCase(!ancestors.has(obj), "export JSON cycle");
  requireCase(Object.getOwnPropertySymbols(obj).length === 0 &&
    (array || Object.getPrototypeOf(obj) === Object.prototype || Object.getPrototypeOf(obj) === null), "export plain JSON object");
  const keys = Object.getOwnPropertyNames(obj).filter(k => !array || k !== "length");
  if (array) requireCase(keys.length === obj.length && keys.every((k, i) => k === String(i)), "export dense JSON array");
  else keys.sort(); // Default comparison is deterministic UTF-16, including numeric-looking keys.
  ancestors.add(obj);
  yield array ? "[" : "{";
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i], descriptor = Object.getOwnPropertyDescriptor(obj, key)!;
    requireCase(descriptor.enumerable && "value" in descriptor, "export plain JSON property");
    yield `${i ? "," : ""}\n${"  ".repeat(depth + 1)}`;
    if (!array) { yield* quoted(key); yield ": "; }
    yield* tokens(descriptor.value, depth + 1, ancestors);
  }
  if (keys.length) yield `\n${"  ".repeat(depth)}`;
  yield array ? "]" : "}";
  ancestors.delete(obj);
}

export async function serializeReviewPackage(value: unknown, signal?: AbortSignal) {
  const encoder = new TextEncoder(), chunks: Uint8Array[] = [];
  let size = 0, pending = "", sinceYield = 0;
  function check() { if (signal?.aborted) throw new Error("Export preparation cancelled."); }
  function flush() {
    check();
    const chunk = encoder.encode(pending);
    if (size + chunk.byteLength > MAX_EXPORT_BYTES) throw new Error("The complete review package exceeds 16 MiB. No file was prepared. Choose a case-only package explicitly, or a smaller original.");
    size += chunk.byteLength;
    sinceYield += chunk.byteLength;
    chunks.push(chunk);
    pending = "";
  }
  check();
  for (const token of tokens(value)) {
    pending += token;
    if (pending.length >= 8192) flush();
    if (sinceYield >= 131072) {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      sinceYield = 0;
      check();
    }
  }
  pending += "\n";
  flush();
  check();
  return { chunks, size };
}
