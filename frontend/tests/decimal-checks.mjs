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

test("accounting display scales exactly, rounds half-even once and never shows negative zero", () => {
  const examples = [
    ["-58000", {}, "(58,000)"],
    ["-58000", { currency: true }, "($58,000)"],
    ["-58000", { negative: "minus" }, "-58,000"],
    ["-58000", { currency: true, negative: "minus" }, "-$58,000"],
    ["1234.5", { places: 2 }, "1,234.50"],
    ["4200000", { scale: "thousands" }, "4,200"],
    ["1500", { scale: "thousands" }, "2"],
    ["2500", { scale: "thousands" }, "2"],
    ["-2500", { scale: "thousands" }, "(2)"],
    ["999500", { scale: "thousands" }, "1,000"],
    ["-400", { scale: "thousands" }, "0"],
    ["-0.005", { places: 2 }, "0.00"],
    ["2352984.826672761045726790462363", { scale: "millions", places: 1, currency: true }, "$2.4"],
    ["1e30", { scale: "millions" }, "1,000,000,000,000,000,000,000,000"],
    ["630000", { group: false }, "630000"],
  ];
  for (const [value, options, expected] of examples)
    assert.equal(decimal.formatAccounting(value, options), expected, `${value} ${JSON.stringify(options)}`);
  assert.equal(decimal.scaleDecimal("4200000", "thousands"), "4200");
  assert.equal(decimal.scaleDecimal("4200000", "millions"), "4.2");
  assert.equal(decimal.groupDecimal("-1250.505"), "-1,250.505");
});

test("generated thousand-scale display satisfies an independent half-even oracle", () => {
  for (let dollars = -25_000; dollars <= 25_000; dollars += 7) {
    const magnitude = BigInt(Math.abs(dollars));
    let thousands = magnitude / 1000n;
    const remainder = magnitude % 1000n;
    if (remainder > 500n || remainder === 500n && thousands % 2n === 1n) thousands++;
    const body = thousands.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const expected = dollars < 0 && thousands !== 0n ? `(${body})` : body;
    assert.equal(decimal.formatAccounting(String(dollars), { scale: "thousands" }), expected, String(dollars));
  }
});

test("percent and multiple displays shift exactly and keep threshold comparisons honest", () => {
  assert.equal(decimal.formatRatioPercent("0.105"), "10.5%");
  assert.equal(decimal.formatRatioPercent("-0.0325"), "-3.2%");
  assert.equal(decimal.formatRatioPercent("-0.0325", 1, { negative: "parentheses" }), "(3.2%)");
  assert.equal(decimal.formatRatioPercent("0.1", 0), "10%");
  assert.equal(decimal.formatRatioPercent("0.076923076923076923076923", 1, { signed: true }), "+7.7%");
  assert.equal(decimal.formatRatioPercent("0", 1, { signed: true }), "0.0%");
  assert.equal(decimal.formatRatioPercent("-0.0004", 1, { signed: true }), "0.0%");
  assert.equal(decimal.formatMultiple("3.1349"), "3.13x");
  assert.equal(decimal.formatMultiple("1.2496", { threshold: "1.25" }), "1.2496x");
  assert.equal(decimal.formatMultiple("1.255", { threshold: "1.25" }), "1.26x");
  assert.equal(decimal.formatMultiple("1.25", { threshold: "1.25" }), "1.25x");
  assert.equal(decimal.disambiguatingPlaces("1.2496", "1.25", 2, 4), 4);
  assert.equal(decimal.disambiguatingPlaces("1.2449", "1.25", 2, 4), 2);
  assert.equal(decimal.disambiguatingPlaces("0.99999", "1", 2, 4), 4);
});

test("analyst amounts parse to exact canonical decimals or fail with a typed reason", () => {
  // Thirty-four significant digits inside the supported magnitude range.
  const thirtyFour = "1234567890123456789012345.678901234";
  const accepted = [
    ["1,250,000", "1250000"], ["$1,250,000", "1250000"], ["(1,250,000)", "-1250000"],
    ["($1,250,000.50)", "-1250000.5"], ["$(5)", "-5"], ["-$58,000", "-58000"], ["$-58,000", "-58000"],
    ["  4200000  ", "4200000"], [" 1250 ", "1250"], ["−5", "-5"], [".5", "0.5"],
    ["1250.", "1250"], ["-0", "0"], ["0012", "12"], ["1,250.50", "1250.5"], [thirtyFour, thirtyFour],
  ];
  for (const [raw, value] of accepted) assert.deepEqual(decimal.parseAnalystAmount(raw), { ok: true, value }, raw);
  const rejected = [
    ["", "empty"], ["   ", "empty"], ["4.2m", "suffix"], ["250k", "suffix"], ["3B", "suffix"], ["1e6", "exponent"],
    ["12%", "percent"], ["1,25", "grouping"], ["12,50,000", "grouping"], ["1 250", "invalid"], ["--5", "sign"],
    ["-(5)", "sign"], ["(-5)", "sign"], ["(5", "parentheses"], ["5)", "parentheses"], ["$$5", "invalid"],
    ["abc", "invalid"], [thirtyFour + "5", "digits"], ["1" + "0".repeat(31), "range"],
    ["0." + "0".repeat(30) + "1", "range"],
  ];
  for (const [raw, code] of rejected) {
    const result = decimal.parseAnalystAmount(raw);
    assert.equal(result.ok, false, raw);
    assert.equal(result.code, code, raw);
    assert.ok(result.message.length > 0, raw);
  }
  assert.match(decimal.parseAnalystAmount("abc").message, /finite number/);
  assert.equal(decimal.parseAnalystAmount("-5", { allowNegative: false }).code, "negative");
  assert.equal(decimal.parseAnalystAmount("$5", { currency: false }).code, "invalid");
});

test("percent and whole-number inputs become exact API values", () => {
  for (const [raw, value] of [["12.5", "0.125"], ["12.5%", "0.125"], ["(2.5%)", "-0.025"], ["(2.5)%", "-0.025"],
    ["-10", "-0.1"], ["0", "0"], ["100", "1"], [" 10.5 % ", "0.105"]])
    assert.deepEqual(decimal.parsePercentInput(raw), { ok: true, value }, raw);
  for (const raw of ["12.5%%", "$5", "1e2", "", "5k"]) assert.equal(decimal.parsePercentInput(raw).ok, false, raw);
  assert.equal(decimal.parsePercentInput("-5", { allowNegative: false }).code, "negative");
  for (const [raw, value] of [["120", "120"], ["1,200", "1200"], ["120.0", "120"]])
    assert.deepEqual(decimal.parseWholeNumber(raw), { ok: true, value }, raw);
  for (const raw of ["12.5", "$120", "1e2", "abc"]) {
    const result = decimal.parseWholeNumber(raw);
    assert.equal(result.ok, false, raw);
    assert.match(result.message, /whole/, raw);
  }
});
