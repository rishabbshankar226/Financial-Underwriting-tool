import { test, expect } from "@playwright/test";
import { trendBars } from "../src/trendGeometry";

const box = { width: 240, height: 64, gap: 8 };

test("positive series stand on the bottom baseline and the largest bar fills the plot", () => {
  const chart = trendBars(["3900000", "4200000"], box);
  expect(chart.baseline).toBe(64);
  const [first, second] = chart.bars;
  expect(second).toMatchObject({ height: "64", y: "0", negative: false });
  expect(first).toMatchObject({ height: "59", y: "5", negative: false });
  expect(first!.x).toBe(0);
  expect(second!.x + second!.width).toBeLessThanOrEqual(box.width);
  expect(second!.x).toBe(first!.width + box.gap);
});

test("a negative value moves the baseline to the middle and hangs below it", () => {
  const chart = trendBars(["630000", "-315000", null], box);
  expect(chart.baseline).toBe(32);
  expect(chart.bars[0]).toMatchObject({ height: "32", y: "0", negative: false });
  expect(chart.bars[1]).toMatchObject({ height: "16", y: "32", negative: true });
  expect(chart.bars[2]).toBeNull();
});

test("zero, empty and unavailable series draw no bar heights", () => {
  expect(trendBars(["0", "0"], box).bars.map((bar) => bar?.height)).toEqual(["0", "0"]);
  expect(trendBars([null], box).bars).toEqual([null]);
  expect(trendBars([], box).bars).toEqual([]);
});

test("ten periods fit the drawing width with even spacing", () => {
  const chart = trendBars(Array.from({ length: 10 }, (_, index) => String(index + 1)), box);
  const bars = chart.bars.filter((bar) => bar !== null);
  expect(bars).toHaveLength(10);
  for (let index = 1; index < bars.length; index++) expect(bars[index].x - bars[index - 1].x).toBe(bars[0].width + box.gap);
  expect(bars[9].x + bars[9].width).toBeLessThanOrEqual(box.width);
  expect(bars[0].width).toBeGreaterThan(0);
});
