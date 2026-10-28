import { test, expect } from "@playwright/test";
import type { Factor, Metric } from "../src/contracts";
import {
  WHOLE_DOLLARS,
  editorText,
  factorValueText,
  fieldValueText,
  formatDate,
  formatTimestamp,
  legacyFactorText,
  legacyMoney,
  legacySummaryAmount,
  metricValueText,
  moneyText,
  multipleText,
  ratioPercentText,
  scaleCaption,
  signedMetricText,
} from "../src/format";

const metric = (raw: string | null, reported: string | null, unit: string, precision: number | null): Metric => ({
  fact_id: "current.example",
  raw_value: raw,
  reported_value: reported,
  unit,
  display_precision: precision,
  status: raw === null ? "not_applicable" : "available",
  explanation: raw === null ? "No debt service" : null,
});
const factor = (name: string, raw: string | null): Factor => ({
  name, value: raw ?? "Not applicable", raw_value: raw, weight: "0.35", threshold: "1.25", passed: raw !== null,
  source: "test", comparison_operator: ">=", decline_threshold: "1.0", decline_triggered: false,
});

test("legacy shims reproduce today's workspace strings exactly", () => {
  expect(legacyMoney("4200000")).toBe("4,200,000.00");
  expect(legacyMoney("-58000")).toBe("-58,000.00");
  expect(legacyFactorText(factor("uca_positive", "385000"))).toBe("$385,000.00");
  expect(legacyFactorText(factor("dscr", "3.134936659675626479525752"))).toBe("3.1349x");
  expect(legacyFactorText(factor("dscr", null))).toBe("Not applicable");
  expect(legacyFactorText(factor("k1_history", "stable"))).toBe("stable");
  expect(legacySummaryAmount(metric("630000", "630000.00", "USD", 2), true)).toBe("$630,000.00");
  expect(legacySummaryAmount(metric("3.134936659675626479525752", "3.1349", "ratio", 4))).toBe("3.1349x");
  expect(legacySummaryAmount(metric(null, null, "ratio", 4))).toBe("Not applicable");
});

test("analyst money display rounds once from the exact value", () => {
  expect(moneyText("4200000.49")).toBe("$4,200,000");
  expect(moneyText("-58000")).toBe("($58,000)");
  expect(moneyText("-58000", WHOLE_DOLLARS, { currency: false })).toBe("(58,000)");
  expect(moneyText("4200000", { scale: "thousands", cents: false })).toBe("$4,200");
  expect(moneyText("2352984.826672761045726790462363", { scale: "millions", cents: false })).toBe("$2.4");
  expect(moneyText("630000", { scale: "units", cents: true })).toBe("$630,000.00");
  expect(scaleCaption(WHOLE_DOLLARS)).toBe("USD");
  expect(scaleCaption({ scale: "thousands", cents: false })).toBe("USD thousands");
  expect(scaleCaption({ scale: "millions", cents: false })).toBe("USD millions");
});

test("metric display rounds from the raw value when showing fewer places than reported", () => {
  expect(metricValueText(metric("2.5049", "2.50", "USD", 2), "money")).toBe("$3");
  expect(metricValueText(metric("630000", "630000.00", "USD", 2), "money", { scale: "units", cents: true })).toBe(
    "$630,000.00");
  expect(metricValueText(metric("3.134936659675626479525752", "3.1349", "ratio", 4), "multiple")).toBe("3.13x");
  expect(metricValueText(metric("1.2496", "1.2496", "ratio", 4), "multiple", WHOLE_DOLLARS, "1.25")).toBe("1.2496x");
  expect(metricValueText(metric("0.15", "0.1500", "ratio", 4), "percent")).toBe("15.0%");
  expect(metricValueText(metric(null, null, "ratio", 4), "multiple")).toBe("Not applicable");
  expect(metricValueText(metric("stable", "stable", "category", null), "category")).toBe("stable");
});

test("editor and field text keep exact editing values", () => {
  expect(editorText("0.105", "%")).toBe("10.5");
  expect(editorText("4200000", "USD")).toBe("4200000");
  expect(editorText(120, "months")).toBe("120");
  expect(fieldValueText("4200000", "USD")).toBe("$4,200,000");
  expect(fieldValueText("0.105", "%")).toBe("10.50%");
  expect(fieldValueText(120, "months")).toBe("120 months");
});

test("calendar dates are formatted without a time-zone shift", () => {
  expect(formatDate("2026-10-06")).toBe("Oct 6, 2026");
  expect(formatDate("2024-12-31")).toBe("Dec 31, 2024");
  expect(formatTimestamp("2026-10-16T22:43:57.123456+00:00")).toContain("2026");
  expect(formatTimestamp("not a time")).toBe("not a time");
});

test("cushions are signed distances from the policy line and never read as zero when positive", () => {
  expect(signedMetricText(metric("1.884936659675626479525751", "1.8849", "ratio", 4), "multiple")).toBe("+1.88x");
  expect(signedMetricText(metric("-0.1234", "-0.1234", "ratio", 4), "multiple")).toBe("-0.12x");
  expect(signedMetricText(metric("0.00004", "0.0000", "ratio", 4), "multiple")).toBe("+0.0000x");
  expect(signedMetricText(metric("0.004", "0.0040", "ratio", 4), "multiple")).toBe("+0.004x");
  expect(signedMetricText(metric("0", "0.0000", "ratio", 4), "multiple")).toBe("0.00x");
  expect(signedMetricText(metric("385000", "385000.00", "USD", 2), "money")).toBe("+$385,000");
  expect(signedMetricText(metric("-12000.5", "-12000.50", "USD", 2), "money")).toBe("($12,000)");
  expect(signedMetricText(metric(null, null, "ratio", 4), "multiple")).toBe("Not applicable");
  expect(ratioPercentText(metric("0.0857254291241919449252040419", "0.0857", "ratio", 4), 2)).toBe("8.57%");
  expect(ratioPercentText(metric("0.5715028608279462995013602794", "0.5715", "ratio", 4))).toBe("57.2%");
  expect(ratioPercentText(metric(null, null, "ratio", 4))).toBe("Not applicable");
});

test("coverage factors use the analyst formats and keep threshold comparisons honest", () => {
  expect(factorValueText(factor("dscr", "3.134936659675626479525752"))).toBe("3.13x");
  expect(factorValueText({ ...factor("dscr", "1.2496"), threshold: "1.25" })).toBe("1.2496x");
  expect(factorValueText(factor("uca_positive", "385000"))).toBe("$385,000");
  expect(factorValueText(factor("uca_positive", "-3814999"))).toBe("($3,814,999)");
  expect(factorValueText(factor("dscr", null))).toBe("Not applicable");
  expect(factorValueText(factor("k1_history", "stable"))).toBe("stable");
});

test("multiples keep enough places to compare honestly with every line shown beside them", () => {
  expect(multipleText("1.0004", ["1.2", "1"])).toBe("1.0004x");
  expect(multipleText("0.996", ["1.25", "1"])).toBe("0.996x");
  expect(multipleText("1.2496", ["1.25", "1"])).toBe("1.2496x");
  expect(multipleText("3.134936659675626479525752", ["1.25", "1"])).toBe("3.13x");
  expect(multipleText("3.134936659675626479525752", [null, undefined])).toBe("3.13x");
  expect(factorValueText({ ...factor("fccr", "1.0004"), threshold: "1.2", decline_threshold: "1" })).toBe("1.0004x");
  expect(factorValueText({ ...factor("dscr", "0.996"), threshold: "1.25", decline_threshold: "1" })).toBe("0.996x");
});

test("C-1: a figure beside a policy line never rounds onto the line or past it", () => {
  // Four places were the ceiling, so these read "1.2500x" beside a 1.25x minimum they miss.
  expect(multipleText("1.24996", ["1.25", "1"])).toBe("1.24996x");
  expect(multipleText("1.249996", ["1.25", "1"])).toBe("1.249996x");
  expect(multipleText("0.99999", ["1.25", "1"])).toBe("0.99999x");
  // Every line is checked at the same places: 1.2445 needs three, and at three 1.2449 lands on 1.245.
  expect(multipleText("1.2449", ["1.2445", "1.245"])).toBe("1.2449x");
  expect(multipleText(`1.${"2".repeat(40)}`, ["1.25"])).toBe("1.22x");
  expect(multipleText(`1.24${"9".repeat(40)}`, ["1.25"])).toBe(`1.24${"9".repeat(40)}x`);
  expect(metricValueText(metric("1.24996", "1.2500", "ratio", 4), "multiple", WHOLE_DOLLARS, "1.25")).toBe("1.24996x");
  // Whole dollars put +0.40 and -0.40 both on "$0" beside "Must exceed $0".
  expect(metricValueText(metric("0.40", "0.40", "USD", 2), "money", WHOLE_DOLLARS, "0")).toBe("$0.40");
  expect(metricValueText(metric("-0.40", "-0.40", "USD", 2), "money", WHOLE_DOLLARS, "0")).toBe("($0.40)");
  expect(metricValueText(metric("385000", "385000.00", "USD", 2), "money", WHOLE_DOLLARS, "0")).toBe("$385,000");
  expect(factorValueText({ ...factor("uca_positive", "0.004"), threshold: "0" })).toBe("$0.004");
  expect(legacyFactorText({ ...factor("dscr", "1.249996"), threshold: "1.25", decline_threshold: "1" })).toBe("1.249996x");
  expect(legacyFactorText({ ...factor("dscr", "3.134936659675626479525752"), threshold: "1.25" })).toBe("3.1349x");
});
