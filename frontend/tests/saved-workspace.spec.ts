import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
const dated = JSON.parse(
  readFileSync(
    new URL("../../backend/fixtures/alpine_dated.json", import.meta.url),
    "utf8",
  ),
);

async function save(page: Page, rationale = "Synthetic creation") {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill(rationale);
  const response = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === "/cases" &&
      r.request().method() === "POST" &&
      r.status() === 201,
  );
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  const snapshot = await (await response).json();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when fetched",
  );
  await expect(page.locator(".uploadbar")).toContainText(
    `Saved case ${snapshot.case_id}`,
  );
  return snapshot;
}
async function editRevenue(page: Page, value: string, rationale: string) {
  await page.getByRole("button", { name: "spread", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    })
    .click();
  await page.getByLabel("New value").fill(value);
  await page.getByLabel("Rationale").fill(rationale);
  await page
    .getByRole("button", { name: "Save revision", exact: true })
    .click();
}
async function openSaved(page: Page, id: string) {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Saved cases", exact: true }).click();
  await page
    .locator(".caseRow")
    .filter({ hasText: id })
    .getByRole("button", { name: /^Open / })
    .click();
  await expect(page.locator(".savedContext")).toContainText(id);
}

test("real save/reload/edit/history reads original runs without stateless recalculation", async ({
  page,
  request,
}, info) => {
  const snapshot = await save(page);
  let assessments = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/commercial/assessment")) assessments++;
  });
  await page.reload();
  await expect(page.locator(".savedContext")).toContainText(snapshot.case_id);
  await editRevenue(page, "1", "Synthetic revenue revision");
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await expect(page.locator(".savedContext")).toContainText("Revision 2");
  await page.getByRole("button", { name: "history", exact: true }).click();
  await expect(page.locator(".savedEvent")).toContainText("4200000 → 1");
  await expect(page.locator(".savedEvent")).toContainText("2025-01-01");
  await page
    .getByRole("button", { name: "Open revision 1", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Historical revision 1",
  );
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.screenshot({
    path: info.outputPath("historical-revision.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "spread", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    }),
  ).toBeDisabled();
  const original = await request.get(
    `http://127.0.0.1:8000/cases/${snapshot.case_id}/revisions/1`,
  );
  expect(await original.json()).toEqual(snapshot);
  expect(assessments).toBe(0);
  await page.getByRole("button", { name: "Open latest", exact: true }).click();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
});
test("lost create response survives reload and retry creates exactly one case", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  let committed: any;
  let originalKey = "";
  await page.route("**/cases", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    originalKey = route.request().headers()["idempotency-key"];
    committed = await (await route.fetch()).json();
    await route.abort();
  });
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Synthetic lost response");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await page.unroute("**/cases");
  await page.reload();
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  const retry = page.waitForRequest(
    (r) => new URL(r.url()).pathname === "/cases" && r.method() === "POST",
  );
  await page
    .getByRole("button", { name: "Retry exact write", exact: true })
    .click();
  expect((await retry).headers()["idempotency-key"]).toBe(originalKey);
  await expect(page.locator(".savedContext")).toContainText(committed.case_id);
  const revisions = await request.get(
    `http://127.0.0.1:8000/cases/${committed.case_id}/revisions`,
  );
  expect((await revisions.json()).items).toHaveLength(1);
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toHaveCount(0);
});
test("two contexts require explicit conflict review before a fresh saved edit", async ({
  page,
  browser,
  request,
}, info) => {
  const snapshot = await save(page);
  const context = await browser.newContext();
  const other = await context.newPage();
  const sent: { key: string; etag: string }[] = [];
  other.on("request", (r) => {
    if (
      r.method() === "POST" &&
      new URL(r.url()).pathname === `/cases/${snapshot.case_id}/revisions`
    ) {
      sent.push({
        key: r.headers()["idempotency-key"],
        etag: r.headers()["if-match"],
      });
    }
  });
  try {
    await openSaved(other, snapshot.case_id);
    await editRevenue(page, "4200001", "First context");
    await expect(page.locator(".savedContext")).toContainText("Revision 2");
    await editRevenue(other, "1", "Second context proposal");
    await expect(
      other.getByRole("heading", { name: "Review conflicting edit" }),
    ).toBeVisible();
    await expect(other.locator(".conflict")).toContainText("4200001");
    await expect(other.locator(".decision strong")).toHaveText("UNAVAILABLE");
    for (const width of [1440, 390]) {
      await other.setViewportSize({ width, height: 1000 });
      await expect
        .poll(() =>
          other.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      await other.screenshot({
        path: info.outputPath(`conflict-${width}.png`),
        fullPage: true,
      });
    }
    let current = await request.get(
      `http://127.0.0.1:8000/cases/${snapshot.case_id}`,
    );
    expect((await current.json()).revision).toBe(2);
    await other
      .getByRole("button", { name: "Review proposed edit", exact: true })
      .click();
    await expect(other.getByLabel("New value")).toHaveValue("1");
    await expect(other.getByLabel("Rationale")).toHaveValue(
      "Second context proposal",
    );
    await other
      .getByRole("button", { name: "Save revision", exact: true })
      .click();
    await expect(other.locator(".decision strong")).toHaveText("DECLINE");
    current = await request.get(
      `http://127.0.0.1:8000/cases/${snapshot.case_id}`,
    );
    const final = await current.json();
    expect(final.revision).toBe(3);
    expect(final.event.before).toBe(4200001);
    expect(sent).toHaveLength(2);
    expect(sent[1].key).not.toBe(sent[0].key);
    expect(sent[1].etag).not.toBe(sent[0].etag);
  } finally {
    await context.close();
  }
});
test("saved controls retain keyboard focus, fit mobile and replay without changing the selected run", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) errors.push(m.text());
  });
  const snapshot = await save(page);
  await page.getByRole("button", { name: "history", exact: true }).click();
  await page.getByRole("button", { name: "Check replay", exact: true }).click();
  await expect(page.locator(".replayResult")).toContainText("Matched");
  await expect(page.locator(".savedContext")).toContainText(snapshot.run_id);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: info.outputPath(`saved-history-${width}.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
test("a rejected saved edit never falls back to stateless re-evaluation", async ({
  page,
  request,
}) => {
  const snapshot = await save(page);
  await page.route("**/cases/*/revisions", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 422,
          headers: { "Access-Control-Allow-Origin": "*" },
          json: {
            detail: {
              code: "invalid_edit_value",
              message: "Synthetic rejection",
            },
          },
        })
      : route.continue(),
  );
  await editRevenue(page, "1", "Rejected proposal");
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await expect(
    page.getByRole("button", {
      name: "Re-evaluate last accepted case",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.locator(".pending").filter({ hasText: "Rejected saved proposal" }),
  ).toContainText("Rejected proposal");
  await page
    .getByRole("button", { name: "View previous stored revision", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Historical revision 1",
  );
  expect(
    (
      await (
        await request.get(`http://127.0.0.1:8000/cases/${snapshot.case_id}`)
      ).json()
    ).revision,
  ).toBe(1);
});
test("stateless edits remain usable when the browser cannot keep recovery storage", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new Error("Storage unavailable");
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const field = page.getByRole("button", {
    name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
    exact: true,
  });
  await expect(field).toBeEnabled();
  await field.click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Unsaved edit only");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await expect(
    page.getByRole("button", { name: "Save case", exact: true }),
  ).toBeDisabled();
});
test("lost edit retry after reload identifies its old receipt when head advanced", async ({
  page,
  request,
}) => {
  const initial = await save(page);
  let committed: any,
    committedEtag = "",
    originalEtag = "",
    key = "",
    body = "";
  await page.route("**/cases/*/revisions", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    key = route.request().headers()["idempotency-key"];
    originalEtag = route.request().headers()["if-match"];
    body = route.request().postData()!;
    const response = await route.fetch();
    committed = await response.json();
    committedEtag = response.headers().etag;
    await route.abort();
  });
  await page.getByRole("button", { name: "assumptions", exact: true }).click();
  await page
    .getByRole("button", { name: "Annual nominal rate", exact: true })
    .click();
  await page.getByLabel("New value").fill("12.5");
  await page.getByLabel("Rationale").fill("Lost rate revision");
  await page
    .getByRole("button", { name: "Save revision", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toBeEnabled();
  expect(committed.event.after).toBe(0.125);
  const advance = await request.post(
    `http://127.0.0.1:8000/cases/${initial.case_id}/revisions`,
    {
      headers: { "If-Match": committedEtag, "Idempotency-Key": randomUUID() },
      data: {
        field_path: "/proposed_loan/amount",
        new_value: 600000,
        rationale: "Another writer",
      },
    },
  );
  expect(advance.status()).toBe(201);
  await page.unroute("**/cases/*/revisions");
  await page.reload();
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  const retry = page.waitForRequest(
    (r) => r.method() === "POST" && r.url().endsWith("/revisions"),
  );
  await page
    .getByRole("button", { name: "Retry exact write", exact: true })
    .click();
  const sent = await retry;
  expect(sent.headers()["idempotency-key"]).toBe(key);
  expect(sent.headers()["if-match"]).toBe(originalEtag);
  expect(sent.postData()).toBe(body);
  await expect(page.locator(".savedContext")).toContainText(
    "Historical revision 2",
  );
  await expect(page.locator(".savedContext")).toContainText(
    "Latest known revision 3",
  );
  await page.getByRole("button", { name: "assumptions", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Annual nominal rate", exact: true }),
  ).toBeDisabled();
  expect(
    await (
      await request.get(
        `http://127.0.0.1:8000/cases/${initial.case_id}/revisions/2`,
      )
    ).json(),
  ).toEqual(committed);
  await page.getByRole("button", { name: "Open latest", exact: true }).click();
  await expect(page.locator(".savedContext")).toContainText("Revision 3");
});
test("accepted receipt remains readable and read-only when latest refresh fails", async ({
  page,
}) => {
  let writes = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && new URL(r.url()).pathname === "/cases")
      writes++;
  });
  await page.route("**/cases/*", (route) =>
    route.request().method() === "GET" &&
    /^\/cases\/[^/]+$/.test(new URL(route.request().url()).pathname)
      ? route.fulfill({
          status: 503,
          headers: { "Access-Control-Allow-Origin": "*" },
          json: {
            detail: {
              code: "storage_busy",
              message: "Synthetic read contention",
            },
          },
        })
      : route.continue(),
  );
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page
    .getByLabel("Save rationale")
    .fill("Accepted before refresh failure");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest unconfirmed",
  );
  await expect(page.locator(".writeNotice")).toContainText("Write accepted");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(
    page.getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toHaveCount(0);
  await page.unroute("**/cases/*");
  await page.getByRole("button", { name: "Open latest", exact: true }).click();
  await expect(page.locator(".savedContext")).toContainText(
    "Latest when fetched",
  );
  expect(writes).toBe(1);
});
test("late committed write resolves tracking without replacing a newer selection", async ({
  page,
}) => {
  await save(page);
  let release!: () => void, entered!: () => void;
  const waiting = new Promise<void>((r) => (entered = r)),
    released = new Promise<void>((r) => (release = r));
  await page.route("**/cases/*/revisions", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const response = await route.fetch();
    entered();
    await released;
    await route.fulfill({ response });
  });
  await editRevenue(page, "1", "Late accepted edit");
  await waiting;
  await page
    .getByRole("button", { name: "Legacy Alpine demo", exact: true })
    .click();
  await expect(
    page.getByText("Legacy · undated input", { exact: true }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("heading", {
      name: "Write acknowledged for another selection",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Legacy · undated input", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open acknowledged revision", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Historical revision 2",
  );
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
});
test("unsupported stored definition stays original JSON and replay cannot replace it", async ({
  page,
}) => {
  const initial = await save(page);
  let evaluations = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/commercial/assessment")) evaluations++;
  });
  await page.route(`**/cases/${initial.case_id}`, async (route) => {
    const response = await route.fetch(),
      body = await response.json();
    body.assessment.calculation_version = "retained-unknown";
    await route.fulfill({ response, json: body });
  });
  await page.route(`**/cases/${initial.case_id}/revisions/1/replay`, (route) =>
    route.fulfill({
      headers: { "Access-Control-Allow-Origin": "*" },
      json: {
        case_id: initial.case_id,
        revision: 1,
        run_id: initial.run_id,
        status: "replay_unavailable",
        differences: [],
        explanation: "Retained definition unavailable",
      },
    }),
  );
  await page.getByRole("button", { name: "Open latest", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Original stored assessment" }),
  ).toBeVisible();
  await expect(page.locator(".compatibility pre")).toContainText(
    "retained-unknown",
  );
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await page.getByRole("button", { name: "Check replay", exact: true }).click();
  await expect(page.locator(".replayResult")).toContainText(
    "Replay unavailable",
  );
  await expect(page.locator(".compatibility pre")).toContainText(
    initial.run_id,
  );
  expect(evaluations).toBe(0);
});
test("malformed successful save keeps its exact recovery key after the real commit", async ({
  page,
  request,
}) => {
  let accepted: any,
    key = "";
  await page.route("**/cases", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    key = route.request().headers()["idempotency-key"];
    const response = await route.fetch();
    accepted = await response.json();
    const headers = response.headers();
    delete headers.etag;
    await route.fulfill({ response, headers });
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await page.getByLabel("Save rationale").fill("Invalid receipt headers");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("UNAVAILABLE");
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toBeEnabled();
  await page.unroute("**/cases");
  const retry = page.waitForRequest(
    (r) => r.method() === "POST" && new URL(r.url()).pathname === "/cases",
  );
  await page
    .getByRole("button", { name: "Retry exact write", exact: true })
    .click();
  expect((await retry).headers()["idempotency-key"]).toBe(key);
  await expect(page.locator(".savedContext")).toContainText(accepted.case_id);
  expect(
    (
      await (
        await request.get(
          `http://127.0.0.1:8000/cases/${accepted.case_id}/revisions`,
        )
      ).json()
    ).items,
  ).toHaveLength(1);
});
test("saved pagination reads more than one page of cases and revisions", async ({
  page,
  request,
}) => {
  let oldest: any,
    etag = "";
  for (let i = 0; i < 26; i++) {
    const response = await request.post("http://127.0.0.1:8000/cases", {
      headers: { "Idempotency-Key": randomUUID() },
      data: {
        input: { ...dated, borrower_name: `Page Case ${i}` },
        rationale: "Page creation",
      },
    });
    expect(response.status()).toBe(201);
    if (!i) {
      oldest = await response.json();
      etag = response.headers().etag;
    }
  }
  for (let i = 0; i < 30; i++) {
    const response = await request.post(
      `http://127.0.0.1:8000/cases/${oldest.case_id}/revisions`,
      {
        headers: { "Idempotency-Key": randomUUID(), "If-Match": etag },
        data: {
          field_path: "/proposed_loan/amount",
          new_value: 600001 + i,
          rationale: `Page revision ${i}`,
        },
      },
    );
    expect(response.status()).toBe(201);
    etag = response.headers().etag;
  }
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Saved cases", exact: true }).click();
  await expect(
    page.locator(".caseRow").filter({ hasText: oldest.case_id }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Load more saved cases", exact: true })
    .click();
  await page
    .locator(".caseRow")
    .filter({ hasText: oldest.case_id })
    .getByRole("button", { name: /^Open / })
    .click();
  await expect(page.locator(".savedContext")).toContainText("Revision 31");
  await page.getByRole("button", { name: "history", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Open revision 1", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Load more revisions", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open revision 1", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(
    "Historical revision 1",
  );
  await expect(page.locator(".savedEvent")).toContainText("Case creation");
});
test("saving after session edits starts one recorded creation and legacy stays unsaved", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page
    .getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    })
    .click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("Local session change");
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await page.getByRole("button", { name: "Save case", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Earlier session edits are not added",
  );
  await page.getByLabel("Save rationale").fill("Save changed input");
  const response = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" && new URL(r.url()).pathname === "/cases",
  );
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  const s = await (await response).json();
  expect(s.event.kind).toBe("creation");
  expect(s.event.before).toBeNull();
  expect(s.normalized_input.years[1].gross_receipts).toBe(1);
  expect(
    (
      await (
        await request.get(`http://127.0.0.1:8000/cases/${s.case_id}/revisions`)
      ).json()
    ).items,
  ).toHaveLength(1);
  await page
    .getByRole("button", { name: "Legacy Alpine demo", exact: true })
    .click();
  await expect(
    page.getByText("Legacy · undated input", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save case", exact: true }),
  ).toBeDisabled();
});
test("save rationale validation and cancellation preserve the accepted input and focus", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  let writes = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && new URL(r.url()).pathname === "/cases")
      writes++;
  });
  const saveButton = page.getByRole("button", {
    name: "Save case",
    exact: true,
  });
  await saveButton.click();
  await expect(page.getByLabel("Save rationale")).toBeFocused();
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "nonblank",
  );
  await page.getByLabel("Save rationale").fill("x".repeat(2001));
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "2,000",
  );
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Save rationale")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(saveButton).toBeFocused();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  expect(writes).toBe(0);
});

test("unsaved edits preserve the existing session rationale behavior", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page
    .getByRole("button", {
      name: "Edit Gross receipts for 2025-01-01 – 2025-12-31",
      exact: true,
    })
    .click();
  await page.getByLabel("New value").fill("1");
  await page.getByLabel("Rationale").fill("x".repeat(2001));
  await page
    .getByRole("button", { name: "Evaluate edit", exact: true })
    .click();
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await page.getByRole("button", { name: "history", exact: true }).click();
  await expect(page.locator(".audit")).toContainText("x".repeat(2001));
});

test("an older saved read cannot replace the newer selected case", async ({
  page,
  request,
}) => {
  const cases = [];
  for (const name of ["Delayed saved case", "Latest selected saved case"]) {
    const response = await request.post("http://127.0.0.1:8000/cases", {
      headers: { "Idempotency-Key": randomUUID() },
      data: {
        input: { ...dated, borrower_name: name },
        rationale: "Synthetic read race",
      },
    });
    expect(response.status()).toBe(201);
    cases.push(await response.json());
  }
  let release!: () => void, entered!: () => void, finished!: () => void;
  const started = new Promise<void>((r) => (entered = r)),
    held = new Promise<void>((r) => (release = r)),
    completed = new Promise<void>((r) => (finished = r));
  await page.route(`**/cases/${cases[0].case_id}`, async (route) => {
    const response = await route.fetch();
    entered();
    await held;
    try {
      await route.fulfill({ response });
    } finally {
      finished();
    }
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Saved cases", exact: true }).click();
  await page
    .locator(".caseRow")
    .filter({ hasText: cases[0].case_id })
    .getByRole("button", { name: /^Open / })
    .click();
  await started;
  await page.getByRole("button", { name: "Saved cases", exact: true }).click();
  await page
    .locator(".caseRow")
    .filter({ hasText: cases[1].case_id })
    .getByRole("button", { name: /^Open / })
    .click();
  await expect(page.locator(".savedContext")).toContainText(cases[1].case_id);
  release();
  await completed;
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Latest selected saved case",
  );
  await expect(page.locator(".savedContext")).toContainText(cases[1].run_id);
  await page.reload();
  await expect(page.locator(".savedContext")).toContainText(cases[1].case_id);
});

test("invalid recovery tracking never auto-posts and needs explicit discard", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("spreadline.pending-write.v1", "{invalid"),
  );
  let writes = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && new URL(r.url()).pathname.startsWith("/cases"))
      writes++;
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await expect(
    page.getByRole("heading", { name: "Saved write recovery unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry exact write", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Save case", exact: true }),
  ).toBeDisabled();
  const review = page.getByRole("button", {
    name: "Review discarding tracking",
    exact: true,
  });
  await review.click();
  await expect(
    page.getByRole("button", { name: "Keep tracking", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(review).toBeFocused();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("spreadline.pending-write.v1"),
    ),
  ).toBe("{invalid");
  await review.click();
  await page
    .getByRole("button", { name: "Discard tracking", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save case", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("spreadline.pending-write.v1"),
    ),
  ).toBeNull();
  expect(writes).toBe(0);
});

test("a journal quota failure stops the write and preserves the accepted result", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "spreadline.pending-write.v1")
        throw new DOMException("Synthetic quota failure", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  let writes = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && new URL(r.url()).pathname === "/cases")
      writes++;
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  const saveButton = page.getByRole("button", {
    name: "Save case",
    exact: true,
  });
  await saveButton.click();
  await page.getByLabel("Save rationale").fill("Preflight storage failure");
  await page
    .getByRole("button", { name: "Save accepted case", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Nothing was sent",
  );
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  expect(writes).toBe(0);
  await page.keyboard.press("Escape");
  await expect(saveButton).toBeFocused();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("spreadline.pending-write.v1"),
    ),
  ).toBeNull();
});

test("saved names and rationales render as text and long content fits mobile", async ({
  page,
  request,
}, info) => {
  const name =
    '<img src=x onerror="window.savedTextExecuted=true">' + "A".repeat(300);
  const rationale =
    "<script>window.savedTextExecuted=true</script>" + "R".repeat(1700);
  const response = await request.post("http://127.0.0.1:8000/cases", {
    headers: { "Idempotency-Key": randomUUID() },
    data: { input: { ...dated, borrower_name: name }, rationale },
  });
  expect(response.status()).toBe(201);
  const snapshot = await response.json();
  await openSaved(page, snapshot.case_id);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
  await page.getByRole("button", { name: "history", exact: true }).click();
  await expect(page.locator(".savedEvent")).toContainText(rationale);
  expect(
    await page.evaluate(() => (window as any).savedTextExecuted),
  ).toBeUndefined();
  await expect(page.locator("h1 img, .savedEvent script")).toHaveCount(0);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({
      path: info.outputPath(`long-text-${width}.png`),
      fullPage: true,
    });
  }
});

test("a refreshed case page wins over an older delayed list response", async ({
  page,
  request,
}) => {
  let release!: () => void, entered!: () => void, finished!: () => void;
  const started = new Promise<void>((r) => (entered = r)),
    held = new Promise<void>((r) => (release = r)),
    completed = new Promise<void>((r) => (finished = r));
  let delay = true;
  let older: any;
  await page.route("**/cases?*", async (route) => {
    if (!delay) return route.continue();
    delay = false;
    const response = await route.fetch();
    older = await response.json();
    entered();
    await held;
    try {
      await route.fulfill({ response });
    } finally {
      finished();
    }
  });
  await page.goto("/");
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
  await page.getByRole("button", { name: "Saved cases", exact: true }).click();
  await started;
  const response = await request.post("http://127.0.0.1:8000/cases", {
    headers: { "Idempotency-Key": randomUUID() },
    data: {
      input: { ...dated, borrower_name: "Created after the old list read" },
      rationale: "Synthetic list race",
    },
  });
  expect(response.status()).toBe(201);
  const fresh = await response.json();
  expect(older.items.some((item: any) => item.case_id === fresh.case_id)).toBe(
    false,
  );
  await page
    .getByRole("button", { name: "Refresh saved cases", exact: true })
    .click();
  const row = page.locator(".caseRow").filter({ hasText: fresh.case_id });
  await expect(row).toBeVisible();
  release();
  await completed;
  await expect(row).toHaveCount(1);
  await expect(row).toBeVisible();
  await expect(page.locator(".decision strong")).toHaveText("APPROVE");
});

test("mismatch replay stays separate and a delayed old replay cannot cross revisions", async ({
  page,
  request,
}) => {
  const initial = await save(page);
  await editRevenue(page, "1", "Synthetic replay selection");
  await expect(page.locator(".savedContext")).toContainText("Revision 2");
  const current = await (
    await request.get(`http://127.0.0.1:8000/cases/${initial.case_id}`)
  ).json();
  await page.route(
    `**/cases/${initial.case_id}/revisions/2/replay`,
    async (route) => {
      const response = await route.fetch(),
        body = await response.json();
      await route.fulfill({
        response,
        json: {
          ...body,
          status: "mismatch",
          differences: ["/decision/outcome"],
          explanation: "Synthetic selected-run mismatch",
        },
      });
    },
  );
  await page.getByRole("button", { name: "history", exact: true }).click();
  await page.getByRole("button", { name: "Check replay", exact: true }).click();
  await expect(page.locator(".replayResult")).toContainText("Mismatch");
  await expect(page.locator(".replayResult")).toContainText(
    "/decision/outcome",
  );
  await expect(page.locator(".decision strong")).toHaveText("DECLINE");
  await expect(page.locator(".savedContext")).toContainText(current.run_id);
  let release!: () => void, entered!: () => void, finished!: () => void;
  const started = new Promise<void>((r) => (entered = r)),
    held = new Promise<void>((r) => (release = r)),
    completed = new Promise<void>((r) => (finished = r));
  await page.route(
    `**/cases/${initial.case_id}/revisions/1/replay`,
    async (route) => {
      const response = await route.fetch(),
        body = await response.json();
      entered();
      await held;
      try {
        await route.fulfill({
          response,
          json: {
            ...body,
            status: "mismatch",
            differences: ["/decision/outcome"],
            explanation: "Obsolete replay marker",
          },
        });
      } finally {
        finished();
      }
    },
  );
  await page
    .getByRole("button", { name: "Open revision 1", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(initial.run_id);
  await page.getByRole("button", { name: "Check replay", exact: true }).click();
  await started;
  await page
    .getByRole("button", { name: "Open revision 2", exact: true })
    .click();
  await expect(page.locator(".savedContext")).toContainText(current.run_id);
  release();
  await completed;
  await expect(page.locator(".replayResult")).toContainText(
    "Replay is read-only",
  );
  await expect(page.locator(".replayResult")).not.toContainText(
    "Obsolete replay marker",
  );
  expect(
    await (
      await request.get(
        `http://127.0.0.1:8000/cases/${initial.case_id}/revisions/2`,
      )
    ).json(),
  ).toEqual(current);
});
