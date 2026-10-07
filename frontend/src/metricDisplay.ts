import type { Metric } from "./contracts";

export function metricText(metric: Metric): string {
  if (metric.status === "not_applicable") return "Not applicable";
  if (typeof metric.raw_value !== "number") return String(metric.raw_value);
  return `${metric.raw_value.toLocaleString("en-US", {
    minimumFractionDigits: metric.display_precision ?? 0,
    maximumFractionDigits: metric.display_precision ?? 0,
  })} ${metric.unit}`;
}
