import { Sparkline } from "./sparkline";
import {
  cpuHealth,
  diskHealth,
  gpuHealth,
  healthInk,
  ramHealth,
} from "@/lib/monitor/health";
import { MACHINE, type Health, type MetricId, type Sample } from "@/lib/monitor/types";
import { formatTemp, type TempUnit } from "@/lib/monitor/units";
import { cn } from "@/lib/utils";

function copyFor(unit: TempUnit): Record<
  MetricId,
  { title: string; why: string; series: (s: Sample) => number; health: (s: Sample) => Health }
> {
  const healthyCpu = formatTemp(80, unit);
  return {
    cpu: {
      title: "Processor",
      why: `Load is how busy the chip is. Heat is what actually matters. A game at 40–60% load and under ${healthyCpu} is healthy. Constant max heat while the desktop is idle is not.`,
      series: (s) => s.cpuTemp,
      health: cpuHealth,
    },
    gpu: {
      title: "Graphics card",
      why: `High load during a game is the whole point of the card. Watch temperature instead. Most big NVIDIA cards are happy around ${formatTemp(65, unit)}–${formatTemp(75, unit)}. Sitting near ${formatTemp(85, unit)} for a long stretch is when you check case airflow.`,
      series: (s) => s.gpuTemp,
      health: gpuHealth,
    },
    ram: {
      title: "Memory",
      why: "This is how full your RAM is. When it stays near the top, Windows starts using the disk as fake memory and the PC feels sticky. Closing browsers and games frees it instantly.",
      series: (s) => s.ram,
      health: ramHealth,
    },
    disk: {
      title: "Storage",
      why: "This is how full the drive is, not how fast it is. Past about 90% full, Windows updates get flaky and everything hitchy. Activity (the smaller number) is just how hard it is reading and writing right now.",
      series: (s) => s.diskUsed,
      health: diskHealth,
    },
  };
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line py-2.5 first:border-t-0 first:pt-0">
      <span className="text-sm text-muted">{k}</span>
      <span className={cn("font-mono text-sm tabular-nums", tone)}>{v}</span>
    </div>
  );
}

export function DetailPanel({
  id,
  samples,
  unit,
}: {
  id: MetricId;
  samples: Sample[];
  unit: TempUnit;
}) {
  const latest = samples[samples.length - 1];
  if (!latest) return null;
  const meta = copyFor(unit)[id];
  const health = meta.health(latest);
  const series = samples.map(meta.series);
  const tone = healthInk(health);

  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">Last minute</p>
          <h3 className="text-lg font-medium tracking-tight">{meta.title}</h3>
        </div>
        <p className={cn("text-xs font-medium", tone)}>
          {id === "cpu" || id === "gpu" ? "Temperature over time" : "Use over time"}
        </p>
      </div>
      <div className="mt-4 rounded-lg bg-display px-3 py-3">
        <Sparkline values={series} health={health} className="h-24" />
      </div>
      <p className="mt-4 max-w-2xl text-sm text-muted text-pretty">{meta.why}</p>
      <div className="mt-5">
        {id === "cpu" && (
          <>
            <Row k="Chip" v={MACHINE.cpu} />
            <Row k="Layout" v={MACHINE.cpuDetail} />
            <Row k="Load" v={`${latest.cpuLoad.toFixed(0)}%`} />
            <Row k="Temperature" v={formatTemp(latest.cpuTemp, unit)} tone={tone} />
            <Row k="Power" v={`${latest.cpuPower.toFixed(0)} W`} />
          </>
        )}
        {id === "gpu" && (
          <>
            <Row k="Card" v={MACHINE.gpu} />
            <Row k="Memory size" v={MACHINE.gpuDetail} />
            <Row k="Load" v={`${latest.gpuLoad.toFixed(0)}%`} />
            <Row k="Temperature" v={formatTemp(latest.gpuTemp, unit)} tone={tone} />
            <Row k="Video memory" v={`${latest.gpuVram.toFixed(0)}% used`} />
            <Row k="Fan" v={`${latest.gpuFan.toFixed(0)}%`} />
            <Row k="Power" v={`${latest.gpuPower.toFixed(0)} W`} />
          </>
        )}
        {id === "ram" && (
          <>
            <Row k="Installed" v={MACHINE.ram} />
            <Row k="In use" v={`${latest.ram.toFixed(0)}%`} tone={tone} />
            <Row k="Headroom" v={`${(100 - latest.ram).toFixed(0)}% free`} />
          </>
        )}
        {id === "disk" && (
          <>
            <Row k="Drive" v={MACHINE.storage} />
            <Row k="Space used" v={`${latest.diskUsed.toFixed(0)}%`} tone={tone} />
            <Row k="Activity right now" v={`${latest.diskActivity.toFixed(0)}%`} />
          </>
        )}
      </div>
    </section>
  );
}
