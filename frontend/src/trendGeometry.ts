import { compareDecimal, scaledUnits } from "./decimal";

/** SVG bars for a short series of server-reported decimals. Heights and offsets come from BigInt scaling and
 * stay strings: they are drawing geometry only, never rendered or reused as figures. */
export type TrendBar = { x: number; width: number; y: string; height: string; negative: boolean };
export type TrendGeometry = { baseline: number; bars: (TrendBar | null)[] };
export type TrendBox = { width: number; height: number; gap: number };

const MAX_BAR_WIDTH = 40;
const magnitude = (value: string) => (value.startsWith("-") ? value.slice(1) : value);

export function trendBars(values: (string | null)[], box: TrendBox): TrendGeometry {
  const present = values.filter((value): value is string => value !== null);
  const signed = present.some((value) => compareDecimal(value, "0") < 0);
  // A series with a negative value hangs it below a middle baseline; otherwise bars stand on the bottom edge.
  const baseline = signed ? Math.floor(box.height / 2) : box.height;
  const largest = present.reduce((max, value) => (compareDecimal(magnitude(value), max) > 0 ? magnitude(value) : max), "0");
  const count = values.length;
  const width = count ? Math.max(1, Math.min(MAX_BAR_WIDTH, Math.floor((box.width - box.gap * (count - 1)) / count))) : 0;
  return {
    baseline,
    bars: values.map((value, index) => {
      if (value === null) return null;
      const units = scaledUnits(value, largest, baseline);
      const negative = units < 0n;
      const height = negative ? -units : units;
      return {
        x: index * (width + box.gap),
        width,
        y: (negative ? BigInt(baseline) : BigInt(baseline) - height).toString(),
        height: height.toString(),
        negative,
      };
    }),
  };
}
