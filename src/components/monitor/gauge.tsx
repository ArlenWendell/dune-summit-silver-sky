import type { Health } from "@/lib/monitor/types";

const CX = 50;
const CY = 46;
const R = 36;

function pt(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

const START = pt(135);
const END = pt(45);
const D = `M ${START.x.toFixed(2)} ${START.y.toFixed(2)} A ${R} ${R} 0 1 1 ${END.x.toFixed(2)} ${END.y.toFixed(2)}`;

export function Gauge({
  value,
  max = 100,
  health,
}: {
  value: number;
  max?: number;
  health: Health;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const color =
    health === "hot" ? "var(--color-hot)" : health === "warm" ? "var(--color-warm)" : "var(--color-ink)";

  return (
    <svg viewBox="0 0 100 78" className="h-[4.5rem] w-[5.5rem] shrink-0" aria-hidden>
      <path
        d={D}
        fill="none"
        stroke="var(--color-track)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d={D}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${pct * 100} 100`}
        style={{ transition: "stroke-dasharray 400ms cubic-bezier(0.22, 1, 0.36, 1), stroke 250ms ease" }}
      />
    </svg>
  );
}
