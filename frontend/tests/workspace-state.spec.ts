import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { apiBase } from "../src/api";
import { LOCATOR_KEY, RECOVERY_KEY, makeCreate } from "../src/caseRecovery";
import { initialWorkspace, initialWorkspaceFor, transition } from "../src/workspace";
import { abortBackgroundRequests, trackBackground } from "../src/requestPriority";

const dated = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url), "utf8"));

function memoryStorage(entries: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(entries));
  return {
    get length() {
      return values.size;
    },
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
    clear: () => values.clear(),
  };
}
const locator = (caseId: string) =>
  JSON.stringify({ version: "case-selection-v1", apiBase, caseId, revision: "latest" });

test("a tab with nothing to restore starts idle on the start screen", () => {
  for (const storage of [null, memoryStorage()]) {
    const state = initialWorkspaceFor(storage);
    expect(state.status).toBe("idle");
    expect(state.accepted).toBeNull();
    expect(state.saved).toBeNull();
    expect(state.error).toBe("");
  }
  expect(initialWorkspace.status).toBe("idle");
});

test("a remembered saved selection starts by opening it, never on the start screen", () => {
  const caseId = randomUUID();
  const state = initialWorkspaceFor(memoryStorage({ [LOCATOR_KEY]: locator(caseId) }));
  expect(state.status).toBe("evaluating");
  expect(state.action).toBe("open");
  expect(state.filename).toBe(`Saved case ${caseId}`);
});

test("an unconfirmed saved write starts unavailable with exact-retry guidance, ahead of any selection", () => {
  const storage = memoryStorage({
    [RECOVERY_KEY]: JSON.stringify(makeCreate(dated, "Pending creation")),
    [LOCATOR_KEY]: locator(randomUUID()),
  });
  const state = initialWorkspaceFor(storage);
  expect(state.status).toBe("unavailable");
  expect(state.action).toBe("write");
  expect(state.error).toContain("Retry the exact write");
});

test("unreadable tracking or a foreign selection hint still starts idle", () => {
  expect(initialWorkspaceFor(memoryStorage({ [RECOVERY_KEY]: "{invalid" })).status).toBe("idle");
  const foreign = JSON.stringify({ version: "case-selection-v1", apiBase: "https://elsewhere.example", caseId: randomUUID(), revision: "latest" });
  expect(initialWorkspaceFor(memoryStorage({ [LOCATOR_KEY]: foreign })).status).toBe("idle");
});

test("idle starts a selection, and completions for any other selection are ignored", () => {
  const idle = initialWorkspaceFor(null);
  const started = transition(idle, { type: "start", id: 1, draft: null, filename: "alpine_dated_v2.json" });
  expect(started.status).toBe("evaluating");
  expect(started.filename).toBe("alpine_dated_v2.json");
  expect(transition(idle, { type: "failure", id: 1, error: "late" })).toBe(idle);
  expect(transition(idle, { type: "head", id: 0, caseId: randomUUID(), revision: 1, headRevision: 1 })).toBe(idle);
  expect(transition(started, { type: "start", id: 0, draft: null, filename: "older" })).toBe(started);
  expect(transition(started, { type: "failure", id: 0, error: "older" })).toBe(started);
});

test("background requests abort together and never after they are untracked", () => {
  const first = new AbortController(), second = new AbortController(), finished = new AbortController();
  trackBackground(first);
  trackBackground(second);
  const untrack = trackBackground(finished);
  untrack();
  abortBackgroundRequests();
  expect(first.signal.aborted).toBe(true);
  expect(second.signal.aborted).toBe(true);
  expect(finished.signal.aborted).toBe(false);
  const later = new AbortController();
  trackBackground(later);
  expect(later.signal.aborted).toBe(false);
  abortBackgroundRequests();
  expect(later.signal.aborted).toBe(true);
});
