import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/decimal.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2022 },
}).outputText;
const decimal = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

// The expected cents use an independent quotient/remainder oracle.
test("half-even formatting preserves large balances and tie rules", () => {
  const examples = [
    ["2.675", "2.68"], ["2.685", "2.68"], ["2.665", "2.66"],
    ["-2.675", "-2.68"], ["-2.685", "-2.68"], ["0.005", "0.00"],
    ["-0.005", "0.00"], ["10000000000000000.01", "10,000,000,000,000,000.01"],
    ["1e30", "1,000,000,000,000,000,000,000,000,000,000.00"],
  ];
  for (const [value, expected] of examples) assert.equal(decimal.formatDecimal(value), expected);
});

test("generated signed subcent amounts satisfy the independent rounding oracle", () => {
  for (let integer = -125; integer <= 125; integer++) {
    for (const fraction of [4n, 5n, 6n, 14n, 15n, 16n, 24n, 25n, 26n, 994n, 995n, 996n]) {
      const magnitude = BigInt(Math.abs(integer)) * 1000n + fraction;
      const raw = `${integer < 0 ? "-" : ""}${magnitude / 1000n}.${(magnitude % 1000n).toString().padStart(3, "0")}`;
      let cents = magnitude / 10n;
      const residue = magnitude % 10n;
      if (residue > 5n || residue === 5n && cents % 2n === 1n) cents++;
      const expected = `${integer < 0 && cents !== 0n ? "-" : ""}${cents / 100n}.${(cents % 100n).toString().padStart(2, "0")}`;
      assert.equal(decimal.formatDecimal(raw, 2, false), expected);
    }
  }
});

test("percentage conversion and decimal comparisons are exact", () => {
  assert.equal(decimal.shiftDecimal("5.25", -2), "0.0525");
  assert.equal(decimal.shiftDecimal("0.0525", 2), "5.25");
  assert.equal(decimal.shiftDecimal("-10", -2), "-0.1");
  assert.equal(decimal.compareDecimal("1.249999999999999999999999999999", "1.25"), -1);
  assert.equal(decimal.compareDecimal("10000000000000000.01", "10000000000000000"), 1);
  assert.equal(decimal.decimalEqual("1.2500", "1.25"), true);
});

test("JSON input tokens retain cents, exponents, quoted descriptions and integers", () => {
  const value = decimal.parseInputJson('{"amount":10000000000000000.01,"rate":5.25e-2,"term_months":120,"description":"2026 \\\"price 2.675\\\"","rows":[-0.005,true,null]}');
  assert.deepEqual(value, {
    amount: "10000000000000000.01", rate: "5.25e-2", term_months: "120",
    description: '2026 "price 2.675"', rows: ["-0.005", true, null],
  });
  assert.throws(() => decimal.parseInputJson('{"amount":01}'));
  assert.throws(() => decimal.parseInputJson('{"amount":NaN}'));
});

test("unsupported domains fail before formatting or submission", () => {
  for (const value of ["NaN", "Infinity", "", "1e129", "1e-129", "true"]) {
    assert.equal(decimal.isDecimal(value), false);
    assert.throws(() => decimal.canonicalDecimal(value));
  }
  for (const value of ["1e31", "1e-31", "12345678901234567890123456789012345"]) {
    assert.throws(() => decimal.inputDecimal(value));
  }
  assert.equal(decimal.inputDecimal("1e-30"), "0.000000000000000000000000000001");
  assert.equal(decimal.inputDecimal("-0.000"), "0");
  assert.throws(() => decimal.formatDecimal("1", 31));
});
