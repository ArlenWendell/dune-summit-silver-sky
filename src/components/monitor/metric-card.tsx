import { Gauge } from "./gauge";
import { cn } from "@/lib/utils";
import { healthInk, healthLabel } from "@/lib/monitor/health";
import type { Health, MetricId } from "@/lib/monitor/types";

export function MetricCard({
  id,
  title,
  primary,
  secondary,
  unit,
  value,
  max,
  health,
  selected,
  onSelect,
}: {
  id: MetricId;
  title: string;
  primary: string;
  secondary: string;
  unit: string;
  value: number;
  max?: number;
  health: Health;
  selected: boolean;
  onSelect: (id: MetricId) => void;
}) {
  const tone = healthInk(health);

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-xl bg-surface p-2 text-left shadow-[var(--shadow-border)]",
        "transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.96]",
        "hover:shadow-[0_0_0_1px_rgb(255_255_255_/_0.13)]",
        selected && "shadow-[0_0_0_1px_rgb(213_218_227_/_0.45)]",
      )}
    >
      <div className="flex min-h-28 items-center gap-1 rounded-lg bg-display px-3 py-3 text-ink">
        <Gauge value={value} max={max} health={health} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink/55">{title}</p>
            <span className={cn("text-xs font-medium", tone)}>{healthLabel(health)}</span>
          </div>
          <p className={cn("mt-1 font-mono text-2xl font-medium tabular-nums leading-none tracking-tight", tone)}>
            {primary}
            <span className="ml-1 text-sm font-medium opacity-70">{unit}</span>
          </p>
          <p className="mt-2 truncate text-xs text-ink/50">{secondary}</p>
        </div>
      </div>
    </button>
  );
}
