import { overallCopy, overallHealth } from "@/lib/monitor/health";
import type { Sample } from "@/lib/monitor/types";
import { cn } from "@/lib/utils";

export function StatusBanner({ sample }: { sample: Sample }) {
  const health = overallHealth(sample);
  const copy = overallCopy(sample);
  const chip =
    health === "hot"
      ? "bg-hot-dim text-hot"
      : health === "warm"
        ? "bg-warm-dim text-warm"
        : "bg-display text-ink";

  return (
    <section
      className={cn("rounded-xl px-5 py-4 shadow-[var(--shadow-border)]", "bg-surface")}
      aria-live="polite"
    >
      <p className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", chip)}>
        {health === "hot" ? "Critical" : health === "warm" ? "Threshold" : "All good"}
      </p>
      <h2 className="mt-3 text-xl font-medium tracking-tight text-balance sm:text-2xl">{copy.title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted text-pretty">{copy.body}</p>
    </section>
  );
}
