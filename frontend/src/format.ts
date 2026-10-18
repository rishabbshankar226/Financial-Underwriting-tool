import type { Factor, Metric } from "./contracts";
import {
  compareDecimal,
  disambiguatingPlaces,
  formatAccounting,
  formatDecimal,
  formatMultiple,
  formatRatioPercent,
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
    // Dollar places actually shown: thousands and millions remove three and six.
    const shown = moneyPlaces(display) - (display.scale === "thousands" ? 3 : display.scale === "millions" ? 6 : 0);
    return moneyText(shown < (metric.display_precision ?? 0) ? raw : reported, display);
  }
  if (kind === "percent") return formatRatioPercent(raw, 1);
  return formatMultiple(raw, { threshold });
}

export const WITH_CENTS: MoneyDisplay = { scale: "units", cents: true };

/** A multiple with enough places (2 to 4) to compare with every policy line shown beside it as the exact
 * value does, so 1.0004 beside a 1.00x decline floor reads "1.0004x", never "1.00x". */
export function multipleText(value: string, thresholds: readonly (string | boolean | null | undefined)[]): string {
  const places = thresholds.reduce<number>(
    (most, threshold) => (isDecimal(threshold) ? Math.max(most, disambiguatingPlaces(value, threshold, 2, 4)) : most),
    2,
  );
  return formatMultiple(value, { places });
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
  if (factor.name === "uca_positive") return moneyText(value);
  return multipleText(value, [factor.threshold, factor.decline_threshold]);
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
  return factor.name === "uca_positive" ? `$${legacyMoney(value)}` : `${formatDecimal(value, 4)}x`;
}

export function legacySummaryAmount(metric: Metric, currency = false): string {
  const value = metric.reported_value ?? metric.raw_value;
  if (metric.status !== "available" || !isDecimal(value)) return "Not applicable";
  return currency ? `$${formatDecimal(value, 2)}` : `${formatDecimal(value, 4)}x`;
}
