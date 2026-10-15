import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  guardSavedCase,
  guardCasePage,
  guardRevisionPage,
  guardReplay,
  object,
  type CaseSnapshot,
} from "../src/caseContracts";
import { writeCase, fetchCase } from "../src/caseApi";
import {
  makeCreate,
  makeEdit,
  saveRecovery,
  readRecovery,
  clearRecovery,
  discardRecovery,
  RECOVERY_KEY,
} from "../src/caseRecovery";
import { initialWorkspace, transition } from "../src/workspace";

const dated = JSON.parse(
  readFileSync(
    new URL("../../backend/fixtures/alpine_dated.json", import.meta.url),
    "utf8",
  ),
);
let original: CaseSnapshot, changed: CaseSnapshot, etag: string, changedEtag: string;
test.beforeAll(async ({ request }) => {
  const response = await request.post("http://127.0.0.1:8000/cases", {
    headers: { "Idempotency-Key": randomUUID() },
    data: { input: dated, rationale: "Synthetic stored contract" },
  });
  expect(response.status()).toBe(201);
  etag = response.headers().etag;
  original = guardSavedCase(await response.json(), etag).snapshot;
  const edit = await request.post(
    `http://127.0.0.1:8000/cases/${original.case_id}/revisions`,
    {
      headers: { "Idempotency-Key": randomUUID(), "If-Match": etag },
      data: {
        field_path: "/proposed_loan/annual_rate",
        new_value: "0.125",
        rationale: "Synthetic rate",
      },
    },
  );
  expect(edit.status()).toBe(201);
  changedEtag = edit.headers().etag;
  changed = guardSavedCase(await edit.json(), changedEtag).snapshot;
});
test("real stored receipts retain original assessment and event identity", () => {
  const view = guardSavedCase(original, etag);
  expect(view.assessment?.current_facts.ebitda.raw_value).toBe("630000");
  expect(view.assessment?.current_facts.ebitda.reported_value).toBe("630000.00");
  expect(view.snapshot.event.kind).toBe("creation");
  expect(guardSavedCase(changed, changedEtag).snapshot.event.before).toBe(
    "0.105",
  );
});
for (const [name, mutate] of [
  ["event identity", (b: CaseSnapshot) => (b.event.run_id = randomUUID())],
  ["parent linkage", (b: CaseSnapshot) => (b.parent_revision = 4)],
  ["outer input", (b: CaseSnapshot) => (object(b.normalized_input.proposed_loan, "test loan").amount = "500001")],
  ["recording metadata", (b: CaseSnapshot) => Reflect.deleteProperty(b.recording.packages, "fastapi")],
  ["finite event", (b: CaseSnapshot) => (b.event.before = Infinity)],
  ["required policy", (b: CaseSnapshot) => Reflect.deleteProperty(b.assessment, "policy_snapshot")],
] as const)
  test(`stored guard rejects ${name}`, () => {
    const copy = structuredClone(changed);
    mutate(copy);
    expect(() => guardSavedCase(copy, changedEtag)).toThrow();
  });
for (const [label, bad] of [
  ["missing", () => null],
  ["weak", () => `W/${etag}`],
  ["inconsistent", () => '"different"'],
  ["multiple", () => `${etag}, ${etag}`],
] as const)
  test(`stored guard refuses ${label} ETag`, () =>
    expect(() => guardSavedCase(original, bad())).toThrow());
test("unknown assessment definitions remain readable without becoming a typed result", () => {
  const copy = structuredClone(original);
  copy.assessment.calculation_version = "retained-unknown";
  const view = guardSavedCase(copy, etag);
  expect(view.assessment).toBeNull();
  expect(view.compatibility).toContain("retained-unknown");
  expect(view.snapshot.assessment.policy_snapshot).toEqual(
    original.assessment.policy_snapshot,
  );
});
test("frozen v1 receipts retain reviewed hashes and stay opaque and read-only", () => {
  const fixture = new URL("../../backend/tests/fixtures/schema_v1/", import.meta.url);
  const sql = readFileSync(new URL("store.sql", fixture));
  const provenance = object(JSON.parse(readFileSync(new URL("provenance.json", fixture), "utf8")), "frozen provenance");
  expect(createHash("sha256").update(sql).digest("hex")).toBe(provenance.sql_sha256);
  const reviewed = provenance.receipts;
  expect(Array.isArray(reviewed)).toBe(true);
  if (!Array.isArray(reviewed)) throw new Error("Missing reviewed receipt evidence");
  const extracted: unknown = JSON.parse(execFileSync("python3", ["-c", [
    "import json, sqlite3, sys",
    "connection = sqlite3.connect(':memory:')",
    "connection.executescript(sys.stdin.read())",
    "rows = connection.execute('SELECT operation_id,etag,receipt_json FROM successful_operations ORDER BY revision').fetchall()",
    "print(json.dumps(rows))",
  ].join("\n")], {input: sql, encoding: "utf8"}));
  expect(Array.isArray(extracted)).toBe(true);
  if (!Array.isArray(extracted)) throw new Error("Missing frozen receipts");
  expect(extracted).toHaveLength(reviewed.length);
  extracted.forEach((row: unknown, index) => {
    if (!Array.isArray(row) || row.length !== 3 || !row.every(value => typeof value === "string")) {
      throw new Error("Malformed frozen receipt row");
    }
    const [operation, originalEtag, receipt] = row as [string, string, string];
    const evidence = object(reviewed[index], "reviewed receipt");
    expect(operation).toBe(evidence.operation_id);
    expect(originalEtag).toBe(evidence.etag);
    expect(createHash("sha256").update(receipt).digest("hex")).toBe(evidence.receipt_sha256);
    const parsed = object(JSON.parse(receipt), "original receipt");
    const view = guardSavedCase(parsed, originalEtag);
    expect(view.snapshot).toBe(parsed);
    expect(view.assessment).toBeNull();
    expect(view.compatibility).toContain("commercial-assessment-v1");
    expect(view.snapshot.assessment.schema_version).toBe("commercial-assessment-v1");
    expect(view.snapshot.normalized_input.schema_version).toBe("commercial-assessment-v1");
    expect(() => makeEdit(view, {
      path: field.path, prior: "0.105", next: "0.125", rationale: "Refused archive edit", at: "unverified",
    }, field)).toThrow();
  });
});
test("pages and replay reject cross-case identities and malformed results", () => {
  expect(() =>
    guardCasePage({ items: [original], next_cursor: null }),
  ).toThrow();
  expect(() =>
    guardRevisionPage(
      {
        items: [
          {
            case_id: randomUUID(),
            revision: 1,
            parent_revision: null,
            run_id: original.run_id,
            recorded_at: original.recorded_at,
            rationale: "Initial",
          },
        ],
        next_cursor: null,
      },
      original.case_id,
    ),
  ).toThrow();
  expect(() =>
    guardReplay(
      {
        case_id: original.case_id,
        revision: 2,
        run_id: original.run_id,
        status: "matched",
        differences: [],
        explanation: "Matched",
      },
      guardSavedCase(original, etag),
    ),
  ).toThrow();
});
const field = {
  path: "/proposed_loan/annual_rate",
  label: "Annual nominal rate",
  period: "Assumption as of 2026-01-15",
  value: "0.105",
  unit: "%" as const,
  min: "0",
  max: "1",
};
function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      values.set(k, v);
    },
    removeItem: (k) => {
      values.delete(k);
    },
    clear: () => values.clear(),
    key: (i) => [...values.keys()][i] ?? null,
    get length() {
      return values.size;
    },
  };
}
test("reload recovery retains the exact serialized command, UUID and old ETag", () => {
  const operation = makeEdit(
    guardSavedCase(original, etag),
    {
      path: field.path,
      prior: "0.105",
      next: "0.125",
      rationale: "Synthetic rate",
      at: "unverified local",
    },
    field,
  );
  const storage = memoryStorage();
  saveRecovery(storage, operation);
  const restored = readRecovery(storage).operation!;
  expect(restored.id).toBe(operation.id);
  expect(restored.body).toBe(operation.body);
  expect(restored.kind === "edit" && restored.etag).toBe(etag);
  expect(JSON.parse(restored.body)).toEqual({
    field_path: field.path,
    new_value: "0.125",
    rationale: "Synthetic rate",
  });
});
test("wrong backend and modified recovery envelopes cannot authorize requests", () => {
  const storage = memoryStorage();
  const operation = makeCreate(dated, "Initial");
  saveRecovery(storage, operation);
  expect(readRecovery(storage, "http://127.0.0.1:9999").operation).toBeNull();
  const copy = JSON.parse(storage.getItem(RECOVERY_KEY)!);
  copy.body = '{"input":{},"rationale":"A","rationale":"B"}';
  storage.setItem(RECOVERY_KEY, JSON.stringify(copy));
  expect(readRecovery(storage).operation).toBeNull();
  expect(readRecovery(storage).error).toBeTruthy();
});
test("recovery storage failure stops before an operation can be sent", () => {
  const storage = memoryStorage();
  storage.setItem = () => {
    throw new Error("Quota unavailable");
  };
  expect(() => saveRecovery(storage, makeCreate(dated, "Initial"))).toThrow(
    "recover",
  );
});
test("write success with missing headers stays uncertain instead of becoming accepted", async () => {
  await expect(
    writeCase(
      makeCreate(dated, "Synthetic stored contract"),
      new AbortController().signal,
      (async () =>
        new Response(JSON.stringify(original), {
          status: 201,
        })) as typeof fetch,
    ),
  ).rejects.toMatchObject({ certain: false });
});
test("read verifies the requested case instead of installing another case", async () => {
  await expect(
    fetchCase(
      randomUUID(),
      "latest",
      new AbortController().signal,
      (async () =>
        new Response(JSON.stringify(original), {
          headers: { ETag: etag },
        })) as typeof fetch,
    ),
  ).rejects.toThrow();
});
test("write retries send an identical command and accept the original historical receipt", async () => {
  const assessment = guardSavedCase(original, etag).assessment;
  expect(assessment).not.toBeNull();
  if (!assessment) throw new Error("Expected the active assessment contract");
  const operation = makeCreate(assessment.normalized_input, "Synthetic stored contract");
  const sent: RequestInit[] = [];
  const transport = (async (_url, init) => {
    sent.push(init!);
    return new Response(JSON.stringify(original), {
      status: 201,
      headers: {
        ETag: etag,
        "Idempotency-Replayed": sent.length === 1 ? "false" : "true",
      },
    });
  }) as typeof fetch;
  await writeCase(operation, new AbortController().signal, transport);
  const receipt = await writeCase(
    operation,
    new AbortController().signal,
    transport,
  );
  expect(sent[0].body).toBe(sent[1].body);
  expect(sent[0].headers).toEqual(sent[1].headers);
  expect(receipt.replayed).toBe(true);
  expect(receipt.view.snapshot.revision).toBe(1);
});
test("saved selection never installs stale results and an old receipt is not editable as latest", () => {
  const view = guardSavedCase(original, etag);
  const loading = transition(initialWorkspace, {
    type: "start",
    id: 1,
    filename: "Saved case",
    draft: null,
    action: "open",
  });
  const stored = transition(loading, {
    type: "stored-success",
    id: 1,
    view,
    selection: "receipt",
  });
  expect(stored.saved?.headRevision).toBeNull();
  expect(stored.filename).toBe(`Saved case ${original.case_id}`);
  expect(stored.accepted?.input).toEqual(original.normalized_input);
  const advanced = transition(stored, {
    type: "head",
    id: 1,
    caseId: original.case_id,
    revision: 1,
    headRevision: 2,
  });
  expect(advanced.saved?.selection).toBe("revision");
  expect(advanced.saved?.headRevision).toBe(2);
  const next = transition(advanced, {
    type: "start",
    id: 2,
    filename: "Other case",
    draft: null,
    action: "open",
  });
  expect(
    transition(next, {
      type: "stored-success",
      id: 1,
      view: guardSavedCase(changed, changedEtag),
      selection: "latest",
    }),
  ).toBe(next);
});
test("invalid review dates in a recovery journal are refused before retry", () => {
  const storage = memoryStorage();
  const operation = makeEdit(
    guardSavedCase(original, etag),
    {
      path: field.path,
      prior: "0.105",
      next: "0.125",
      rationale: "Synthetic rate",
      at: "unverified",
    },
    field,
  );
  saveRecovery(storage, operation);
  const copy = JSON.parse(storage.getItem(RECOVERY_KEY)!);
  copy.context.assessment_as_of = "untrusted-date";
  storage.setItem(RECOVERY_KEY, JSON.stringify(copy));
  expect(readRecovery(storage).operation).toBeNull();
});
test("failed journal removal does not claim recovery tracking was cleared", () => {
  const storage = memoryStorage(),
    operation = makeCreate(dated, "Initial");
  saveRecovery(storage, operation);
  storage.removeItem = () => {};
  expect(() => clearRecovery(storage, operation.id)).toThrow();
  expect(() => discardRecovery(storage)).toThrow();
  expect(readRecovery(storage).operation?.id).toBe(operation.id);
});
for (const status of [400, 404, 409, 412, 413, 422, 428, 503])
  test(`write error ${status} preserves certainty and retry semantics`, async () => {
    const transport = (async () =>
      new Response(
        JSON.stringify({
          detail: {
            code: status === 503 ? "storage_busy" : "synthetic_contract_error",
            message: "Synthetic rejection",
          },
        }),
        { status, headers: { "Retry-After": "1" } },
      )) as typeof fetch;
    await expect(
      writeCase(
        makeCreate(dated, "Initial"),
        new AbortController().signal,
        transport,
      ),
    ).rejects.toMatchObject({
      status,
      certain: ![409, 503].includes(status),
      retryAfter: "1",
    });
  });
test("a non-JSON write failure remains uncertain", async () => {
  await expect(
    writeCase(
      makeCreate(dated, "Initial"),
      new AbortController().signal,
      (async () => new Response("unreadable", { status: 503 })) as typeof fetch,
    ),
  ).rejects.toMatchObject({ certain: false });
});
