import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { apiBase } from "../src/api";
import { actor } from "../src/caseContracts";
import { authenticatedFetch, authenticationState, clearApiCredential, setApiCredential } from "../src/authentication";
import { guardOperation, RECOVERY_KEY } from "../src/caseRecovery";
import { SavedWriteController } from "../src/useSavedWrite";
import { TEST_API_ORIGIN, TEST_API_TOKEN } from "./testCredentials";

test.beforeEach(() => clearApiCredential());
test.afterEach(() => clearApiCredential());

test("credentials reject every trailing line terminator before creating a session", () => {
  for (const suffix of ["\n", "\r", "\r\n", "\u2028", "\u2029"]) {
    expect(() => setApiCredential(TEST_API_TOKEN + suffix, TEST_API_ORIGIN)).toThrow();
    expect(authenticationState().connected).toBe(false);
  }
});

test("recorded actors require the complete ASCII identifier", () => {
  expect(actor("configured.operator:1")).toBe(true);
  expect(actor("prototype-demo-unverified")).toBe(true);
  for (const suffix of ["\n", "\r", "\r\n", "\u2028", "\u2029"]) {
    expect(actor("configured.operator:1" + suffix)).toBe(false);
  }
});

test("same-origin GET preserves pagination query parameters", async () => {
  setApiCredential(TEST_API_TOKEN, TEST_API_ORIGIN);
  let target = "";
  const url = `${TEST_API_ORIGIN}/cases?limit=25&after=original%2Fcursor`;
  await authenticatedFetch(url, {}, async input => {
    target = String(input);
    return new Response("{}");
  });
  expect(target).toBe(url);
});

test("anonymous requests and changed origins never reach the caller transport", async () => {
  let calls = 0;
  const transport: typeof fetch = async () => { calls++; return new Response("{}"); };
  await expect(authenticatedFetch(`${TEST_API_ORIGIN}/cases`, {}, transport)).rejects.toThrow("Connect");
  expect(calls).toBe(0);
  setApiCredential(TEST_API_TOKEN, TEST_API_ORIGIN);
  for (const url of ["https://untrusted.example/cases", "http://127.0.0.1:8001/cases", "http://localhost:8000/cases", "http://127.0.0.1:8000@untrusted.example/cases"]) {
    await expect(authenticatedFetch(url, {}, transport)).rejects.toThrow();
  }
  expect(calls).toBe(0);
});

test("API configuration rejects embedded credentials, query parameters and insecure remote URLs", () => {
  for (const url of ["https://user:password@api.example", "https://api.example/?token=secret", "https://api.example/#secret", "http://untrusted.example"]) {
    expect(() => setApiCredential(TEST_API_TOKEN, url)).toThrow();
    expect(authenticationState().connected).toBe(false);
  }
});

test("authorized transport preserves the exact body and disables redirect, cookie and cache credentials", async () => {
  setApiCredential(TEST_API_TOKEN, TEST_API_ORIGIN);
  const body = '{"amount":"9007199254740993.015"}  ';
  const sent: RequestInit[] = [];
  await authenticatedFetch(`${TEST_API_ORIGIN}/cases`, {
    method: "POST", body, headers: { "Idempotency-Key": "exact-key", "Content-Type": "application/json" },
    credentials: "include", redirect: "follow",
  }, async (_input, init) => { sent.push(init!); return new Response("{}"); });
  expect(sent).toHaveLength(1);
  expect(sent[0].body).toBe(body);
  const headers = new Headers(sent[0].headers);
  expect(headers.get("Authorization")).toBe(`Bearer ${TEST_API_TOKEN}`);
  expect(headers.get("Idempotency-Key")).toBe("exact-key");
  expect(sent[0].redirect).toBe("error");
  expect(sent[0].credentials).toBe("omit");
  expect(sent[0].cache).toBe("no-store");
  expect(sent[0].referrerPolicy).toBe("no-referrer");
});

test("caller authorization cannot override the memory credential", async () => {
  setApiCredential(TEST_API_TOKEN, TEST_API_ORIGIN);
  let calls = 0;
  await expect(authenticatedFetch(`${TEST_API_ORIGIN}/cases`, {
    headers: { authorization: "Bearer caller-controlled-value" },
  }, async () => { calls++; return new Response("{}"); })).rejects.toThrow("authorization");
  expect(calls).toBe(0);
});

test("a rejected credential clears the session before another request can be sent", async () => {
  setApiCredential(TEST_API_TOKEN, TEST_API_ORIGIN);
  const rejected = await authenticatedFetch(`${TEST_API_ORIGIN}/cases`, {}, async () => new Response("{}", { status: 401 }));
  expect(rejected.status).toBe(401);
  expect(authenticationState().connected).toBe(false);
  expect(authenticationState().message).toContain("Reconnect");
  let calls = 0;
  await expect(authenticatedFetch(`${TEST_API_ORIGIN}/cases`, {}, async () => { calls++; return new Response("{}"); })).rejects.toThrow("Connect");
  expect(calls).toBe(0);
});

test("disconnect aborts an active transport and rejects a later stale response", async () => {
  setApiCredential(TEST_API_TOKEN, TEST_API_ORIGIN);
  let release!: (response: Response) => void;
  let signal: AbortSignal | null = null;
  const pending = authenticatedFetch(`${TEST_API_ORIGIN}/cases`, {}, async (_input, init) => {
    signal = init?.signal ?? null;
    return await new Promise<Response>(resolve => release = resolve);
  });
  const observed = signal as AbortSignal | null;
  expect(observed).not.toBeNull();
  clearApiCredential();
  expect(observed?.aborted).toBe(true);
  release(new Response("{}"));
  await expect(pending).rejects.toThrow("connection changed");
  expect(authenticationState().connected).toBe(false);
});

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

for (const interruption of ["timeout", "cancel", "disconnect"] as const) {
  test(`${interruption} leaves the exact pending command and key available for explicit retry`, async () => {
    const input: unknown = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url), "utf8"));
    const operation = guardOperation({ version: "case-write-v1", kind: "create", id: randomUUID(), apiBase,
      body: JSON.stringify({ input, rationale: "Synthetic interrupted authenticated write" }) });
    const deadline = new AbortController(), timeout = AbortSignal.timeout, deadlines: number[] = [];
    AbortSignal.timeout = milliseconds => { deadlines.push(milliseconds); return deadline.signal; };
    setApiCredential(TEST_API_TOKEN, apiBase);
    const storage = memoryStorage();
    let calls = 0, sent = "", key: string | null = null;
    const controller = new SavedWriteController(storage, async (_input, init) => {
      calls++;
      sent = String(init?.body);
      key = new Headers(init?.headers).get("Idempotency-Key");
      const signal = init?.signal;
      if (!signal) throw new Error("Authenticated writes require a bounded abort signal");
      return await new Promise<Response>((_resolve, reject) => {
        if (signal.aborted) reject(signal.reason);
        else signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      });
    });
    try {
      const pending = controller.start(operation);
      const journal = storage.getItem(RECOVERY_KEY);
      expect(journal).not.toBeNull();
      if (interruption === "timeout") deadline.abort(new DOMException("Synthetic request deadline", "TimeoutError"));
      else if (interruption === "cancel") controller.abort();
      else clearApiCredential();
      await expect(pending).rejects.toMatchObject({ certain: false });
      expect(deadlines).toEqual([30_000]);
      expect(calls).toBe(1);
      expect(sent).toBe(operation.body);
      expect(key).toBe(operation.id);
      expect(controller.snapshot().inFlight).toBe(false);
      expect(controller.snapshot().operation).toEqual(operation);
      expect(storage.getItem(RECOVERY_KEY)).toBe(journal);
      expect(journal).not.toContain(TEST_API_TOKEN);
    } finally {
      AbortSignal.timeout = timeout;
      controller.abort();
    }
  });
}
