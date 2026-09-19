import { cn } from "@/lib/utils";
import type { Health } from "@/lib/monitor/types";

export function Sparkline({
  values,
  health,
  className,
}: {
  values: number[];
  health: Health;
  className?: string;
}) {
  const w = 240;
  const h = 64;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = Math.max(max - min, 1);
  const pts = values
    .map((v, i) => {
      const x = values.length <= 1 ? 0 : (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke =
    health === "hot" ? "var(--color-hot)" : health === "warm" ? "var(--color-warm)" : "var(--color-ink)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-16 w-full overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
