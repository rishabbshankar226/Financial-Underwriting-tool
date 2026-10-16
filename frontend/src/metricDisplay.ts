import type { Metric } from "./contracts";
import { formatDecimal, isDecimal } from "./decimal";

export function metricText(metric: Metric): string {
  if (metric.status === "not_applicable") return "Not applicable";
  const value = metric.reported_value ?? metric.raw_value;
  if (!isDecimal(value)) return String(value);
  return `${formatDecimal(value, metric.display_precision ?? 0)} ${metric.unit}`;
}
