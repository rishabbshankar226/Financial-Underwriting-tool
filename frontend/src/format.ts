import type { Factor, Metric } from "./contracts";
import {
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
