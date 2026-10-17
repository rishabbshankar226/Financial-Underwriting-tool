import { readFileSync } from "node:fs";
import { test, expect } from "./authenticatedTest";
import { EvaluationError, evaluate } from "../src/api";
import { detectMode } from "../src/contracts";
import { parseInputJson } from "../src/decimal";
import { evaluationFailureMessage, importFailureMessage, rejectedCaseLead } from "../src/errorCopy";
import { describeFieldPath, pointerFromLoc } from "../src/fieldCatalog";
import type { Draft } from "../src/workspace";

const dated = JSON.parse(readFileSync(new URL("../../backend/fixtures/alpine_dated_v2.json", import.meta.url), "utf8"));
const draft: Draft = { mode: "dated", payload: dated, filename: "dated.json" };
const json = (status: number, body: unknown) =>
  async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function failure(transport: typeof fetch): Promise<unknown> {
  try {
    await evaluate(draft, new AbortController().signal, transport);
  } catch (error) {
    return error;
  }
  throw new Error("Expected the evaluation to fail");
}

test("field pointers read as analyst labels with their period or guarantor", () => {
  expect(describeFieldPath("/years/1/gross_receipts")).toBe("Gross receipts (period 2)");
  expect(describeFieldPath("/years/0/period_start")).toBe("Period start (period 1)");
  expect(describeFieldPath("/guarantors/0/wages")).toBe("Annual wages (guarantor 1)");
  expect(describeFieldPath("/guarantors")).toBe("Guarantors");
  expect(describeFieldPath("/proposed_loan/annual_rate")).toBe("Annual nominal rate");
  expect(describeFieldPath("/working_capital/period_end")).toBe("Working capital period end");
  expect(describeFieldPath("/borrower_name")).toBe("Borrower name");
  expect(describeFieldPath("/years")).toBe("Fiscal periods");
  expect(describeFieldPath("")).toBe("The case file");
  expect(describeFieldPath("/unexpected_key")).toBe("Unexpected key");
  expect(describeFieldPath("/a~1b")).toBe("A/b");
});

test("validation locations become escaped JSON Pointers", () => {
  expect(pointerFromLoc(["body", "years", 0, "gross_receipts"])).toBe("/years/0/gross_receipts");
  expect(pointerFromLoc(["body"])).toBe("");
  expect(pointerFromLoc(["body", "a/b", "c~d"])).toBe("/a~1b/c~0d");
  expect(pointerFromLoc("not a location")).toBe("");
});

test("a field-mapped rejection lists the first problems by label without echoing values", async () => {
  const error = await failure(
    json(422, {
      detail: [{ type: "missing", loc: ["body", "borrower_name"], msg: "Field required" }],
      errors: {
        version: "field-errors-v1",
        items: ["/borrower_name", "/geography", "/years", "/existing_debt", "/proposed_loan", "/working_capital"].map(
          (pointer) => ({ pointer, code: "required", message: "This value is required.", limit: null }),
        ),
        truncated: false,
      },
    }),
  );
  expect(error).toBeInstanceOf(EvaluationError);
  const rejected = error as EvaluationError;
  expect(rejected.status).toBe(422);
  expect(rejected.fieldErrors.map((item) => item.pointer)).toContain("/working_capital");
  const message = evaluationFailureMessage(rejected);
  expect(message.startsWith(rejectedCaseLead)).toBe(true);
  expect(message).toContain("Borrower name: This value is required.");
  expect(message).toContain("Geography: This value is required.");
  expect(message).toContain("and 3 more");
  expect(message).not.toContain("body.");
});

test("a document-level rejection keeps the server's specific reason", async () => {
  const error = await failure(
    json(422, {
      detail: "Duplicate JSON key: amount",
      errors: {
        version: "field-errors-v1",
        items: [{ pointer: "", code: "duplicate_key", message: "The JSON document repeats an object key.", limit: null }],
        truncated: false,
      },
    }),
  );
  expect(evaluationFailureMessage(error)).toBe(`${rejectedCaseLead}: Duplicate JSON key: amount`);
});

test("hosts without the errors envelope still map validation locations to labels", async () => {
  const error = await failure(json(422, { detail: [{ loc: ["body", "years", 0, "gross_receipts"], msg: "Input should be a valid decimal" }] }));
  expect((error as EvaluationError).fieldErrors).toEqual([
    { pointer: "/years/0/gross_receipts", code: "invalid_value", message: "Input should be a valid decimal", limit: null },
  ]);
  expect(evaluationFailureMessage(error)).toContain("Gross receipts (period 1): Input should be a valid decimal");
});

test("oversized, unreachable, unreadable and incomplete evaluations read plainly", async () => {
  expect(evaluationFailureMessage(await failure(json(413, { detail: "Request body exceeds 1000000 bytes" })))).toContain(
    "1,000,000-byte",
  );
  const offline = await failure(async () => {
    throw new TypeError("Failed to fetch");
  });
  expect((offline as EvaluationError).status).toBe(0);
  expect(evaluationFailureMessage(offline)).toContain("could not be reached");
  const unreadable = await failure(async () => new Response("Offline", { status: 503 }));
  expect((unreadable as Error).message).toContain("unreadable");
  expect(evaluationFailureMessage(unreadable)).toContain("unreadable response (503)");
  const incomplete = evaluationFailureMessage(new Error("Incomplete or invalid assessment: policy"));
  expect(incomplete).toContain("incomplete result");
  expect(incomplete).toContain("policy");
});

test("import failures explain the file problem in plain language", () => {
  expect(importFailureMessage(new Error("Use a JSON file no larger than 1,000,000 bytes."))).toContain("1,000,000 bytes");
  let syntax: unknown;
  try {
    parseInputJson("{");
  } catch (error) {
    syntax = error;
  }
  expect(importFailureMessage(syntax)).toContain("is not valid JSON");
  let version: unknown;
  try {
    detectMode({ schema_version: "commercial-assessment-v9" });
  } catch (error) {
    version = error;
  }
  expect(importFailureMessage(version)).toContain("schema version is not supported");
  let shape: unknown;
  try {
    detectMode([]);
  } catch (error) {
    shape = error;
  }
  expect(importFailureMessage(shape)).toContain("does not contain a case");
});
