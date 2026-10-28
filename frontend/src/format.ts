import type { Factor, Metric } from "./contracts";
import {
  compareDecimal,
  formatAccounting,
  formatDecimal,
  formatMultiple,
  formatRatioPercent,
  groupDecimal,
  isDecimal,
  shiftDecimal,
  type DisplayScale,
} from "./decimal";
import type { EditableField } from "./workspace";

/** Presentation glue over exact decimal strings. Nothing here computes a financial result. */
export type MoneyDisplay = { scale: DisplayScale; cents: boolean };
export const WHOLE_DOLLARS: MoneyDisplay = { scale: "units", cents: false };
export type MetricKind = "money" | "multiple" | "percent" | "category";

const moneyPlaces = (display: MoneyDisplay) =>
  display.scale === "millions" ? 1 : display.scale === "thousands" ? 0 : display.cents ? 2 : 0;

export function moneyText(
  value: string,
  display: MoneyDisplay = WHOLE_DOLLARS,
  options: { currency?: boolean } = {},
): string {
  return formatAccounting(value, {
    scale: display.scale,
    places: moneyPlaces(display),
    currency: options.currency ?? true,
  });
}

export function scaleCaption(display: MoneyDisplay): string {
  return display.scale === "units" ? "USD" : `USD ${display.scale}`;
}

/** The most places a figure beside a policy line shows before it falls back to its exact string. */
const MAX_PLACES = 30;

/** Fewest places, from `min`, at which the rounded value compares with every line beside it as the exact value
 * does; null when no rounding up to MAX_PLACES keeps every comparison. */
function placesBeside(value: string, lines: readonly unknown[], min: number): number | null {
  const decimals = lines.filter(isDecimal);
  for (let places = min; places <= MAX_PLACES; places++) {
    const shown = formatDecimal(value, places, false);
    if (decimals.every((line) => compareDecimal(shown, line) === compareDecimal(value, line))) return places;
  }
  return null;
}

/** Money beside a policy line: more places when whole dollars would compare with the line differently from the
 * exact value, so 0.40 beside "Must exceed $0" reads "$0.40", never "$0". */
function moneyBeside(value: string, display: MoneyDisplay, lines: readonly unknown[]): string {
  if (display.scale !== "units") return moneyText(value, display);
  const base = moneyPlaces(display),
    places = placesBeside(value, lines, base);
  if (places === null) return value.startsWith("-") ? `($${value.slice(1)})` : `$${value}`;
  // Past whole dollars, show at least cents.
  return formatAccounting(value, { places: places > base ? Math.max(places, 2) : places, currency: true });
}

/** Shown values round once: from the raw value when showing fewer places than the server reported. */
export function metricValueText(
  metric: Metric,
  kind: MetricKind,
  display: MoneyDisplay = WHOLE_DOLLARS,
  threshold?: string,
): string {
  if (metric.status !== "available") return "Not applicable";
  const reported = metric.reported_value ?? metric.raw_value;
  if (kind === "category" || !isDecimal(reported)) return String(reported);
  const raw = isDecimal(metric.raw_value) ? metric.raw_value : reported;
  if (kind === "money") {
    if (threshold !== undefined) return moneyBeside(raw, display, [threshold]);
    // Dollar places actually shown: thousands and millions remove three and six.
    const shown = moneyPlaces(display) - (display.scale === "thousands" ? 3 : display.scale === "millions" ? 6 : 0);
    return moneyText(shown < (metric.display_precision ?? 0) ? raw : reported, display);
  }
  if (kind === "percent") return formatRatioPercent(raw, 1);
  return multipleText(raw, [threshold]);
}

export const WITH_CENTS: MoneyDisplay = { scale: "units", cents: true };

/** A multiple with enough places (2 or more) to compare with every policy line shown beside it as the exact
 * value does, so 1.0004 beside a 1.00x decline floor reads "1.0004x" and 1.24996 beside 1.25x reads
 * "1.24996x", never "1.00x" or "1.2500x". */
export function multipleText(value: string, thresholds: readonly (string | boolean | null | undefined)[]): string {
  const places = placesBeside(value, thresholds, 2);
  return places === null ? `${value}x` : formatMultiple(value, { places });
}

/** A money amount without its sign, for a figure already labeled as a shortfall: "$647,015". */
export function moneyMagnitudeText(value: string, display: MoneyDisplay = WHOLE_DOLLARS): string {
  return moneyText(value.startsWith("-") ? value.slice(1) : value, display);
}

/** A signed distance from a policy line, rounded once from the raw value: "+1.88x", "-0.12x", "+$385,000"
 * or "($12,000)". Multiples keep enough places that a positive cushion never reads as zero. */
export function signedMetricText(metric: Metric, kind: "multiple" | "money"): string {
  if (metric.status !== "available" || !isDecimal(metric.raw_value)) return "Not applicable";
  const raw = metric.raw_value,
    positive = compareDecimal(raw, "0") > 0;
  if (kind === "money") return `${positive ? "+" : ""}${moneyText(raw)}`;
  return `${positive ? "+" : ""}${formatMultiple(raw, { threshold: "0" })}`;
}

/** A policy factor's measured value: UCA in whole dollars, coverage as a multiple that keeps enough places
 * to compare with its threshold as the exact value does, and K-1 history as its category. */
export function factorValueText(factor: Factor): string {
  const value = factor.raw_value;
  if (value === null) return "Not applicable";
  if (!isDecimal(value)) return String(value);
  if (factor.name === "uca_positive") return moneyBeside(value, WHOLE_DOLLARS, [factor.threshold]);
  return multipleText(value, [factor.threshold, factor.decline_threshold]);
}

/** A ratio as a percentage beside its policy lines, rounded once from the raw value: one place, or more when
 * fewer would compare with a line differently, so 0.42996 beside a 43% line reads "42.996%", never "43.0%". */
export function percentBeside(ratio: string, lines: readonly unknown[]): string {
  // Percent places are ratio places less two.
  const places = placesBeside(ratio, lines, 3);
  return places === null ? `${shiftDecimal(ratio, 2)}%` : formatRatioPercent(ratio, places - 2);
}

/** A ratio metric shown as a percentage of its base, rounded once from the raw value. */
export function ratioPercentText(metric: Metric, places = 1): string {
  if (metric.status !== "available" || !isDecimal(metric.raw_value)) return "Not applicable";
  return formatRatioPercent(metric.raw_value, places);
}

/** The exact stored value as the editor shows it: percentages in percent units, nothing rounded. */
export function editorText(value: string | number, unit: EditableField["unit"]): string {
  return unit === "%" ? shiftDecimal(String(value), 2) : String(value);
}

/** A recorded value exactly as stored, grouped and in its unit: "$500,000.1", "10.5%" for 0.105, "120 months".
 * Nothing is rounded, so an audit entry never shows an edit as "$500,000 → $500,000". */
export function exactValueText(value: string | number, unit: EditableField["unit"]): string {
  const text = String(value);
  if (!isDecimal(text)) return text;
  if (unit === "%") return `${groupDecimal(shiftDecimal(text, 2))}%`;
  if (unit === "months") return `${text} months`;
  return text.startsWith("-") ? `($${groupDecimal(text.slice(1))})` : `$${groupDecimal(text)}`;
}

export function fieldValueText(value: string | number, unit: EditableField["unit"]): string {
  if (unit === "%") return `${formatDecimal(shiftDecimal(String(value), 2), 2)}%`;
  if (unit === "months") return `${value} months`;
  return moneyText(String(value));
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const timestampFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

/** Calendar dates are civil dates; formatting in UTC avoids shifting them across a time zone. */
export function formatDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? isoDate : dateFormat.format(parsed);
}

export function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : timestampFormat.format(parsed);
}

// Shims that reproduce today's workspace strings until each view is restyled.
export const legacyMoney = (value: string) => formatDecimal(value, 2);

export function legacyFactorText(factor: Factor): string {
  const value = factor.raw_value;
  if (value === null) return "Not applicable";
  if (!isDecimal(value)) return String(value);
  // Four places (two for UCA dollars), or more when fewer would compare with the factor's lines differently.
  const lines = [factor.threshold, factor.decline_threshold];
  if (factor.name === "uca_positive") return `$${formatDecimal(value, placesBeside(value, lines, 2) ?? MAX_PLACES)}`;
  const places = placesBeside(value, lines, 4);
  return places === null ? `${value}x` : `${formatDecimal(value, places)}x`;
}

export function legacySummaryAmount(metric: Metric, currency = false): string {
  const value = metric.reported_value ?? metric.raw_value;
  if (metric.status !== "available" || !isDecimal(value)) return "Not applicable";
  return currency ? `$${formatDecimal(value, 2)}` : `${formatDecimal(value, 4)}x`;
}
