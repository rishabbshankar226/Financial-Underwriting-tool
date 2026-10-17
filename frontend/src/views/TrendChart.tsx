import { trendBars } from "../trendGeometry";

export type TrendPoint = { label: string; short: string; value: string | null; text: string };
const box = { width: 240, height: 64, gap: 8 };

/** A small bar chart of server-reported amounts by period. Bar sizes come from BigInt scaling and are only
 * geometry; the formatted values are the chart's accessible name and its visible legend. */
export function TrendChart({ title, points }: { title: string; points: TrendPoint[] }) {
  const chart = trendBars(points.map((point) => point.value), box);
  const name = `${title}: ${points.map((point) => `${point.text} for ${point.label}`).join("; ")}`;
  return (
    <figure className="trendChart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${box.width} ${box.height}`} preserveAspectRatio="none" role="img" aria-label={name}>
        <line className="trendBaseline" x1="0" x2={box.width} y1={chart.baseline} y2={chart.baseline} />
        {chart.bars.map((bar, index) =>
          bar ? (
            <rect
              key={index}
              className={bar.negative ? "trendBar negative" : "trendBar"}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
            />
          ) : null,
        )}
      </svg>
      <ol className="trendLegend" aria-hidden="true">
        {points.map((point) => (
          <li key={point.label}>
            <span>{point.short}</span>
            <strong>{point.text}</strong>
          </li>
        ))}
      </ol>
    </figure>
  );
}
