import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { BrowserFactsPanel } from "./browser-facts";
import { DetailPanel } from "./detail-panel";
import { MetricCard } from "./metric-card";
import { StatusBanner } from "./status-banner";
import { probeBrowser } from "@/lib/monitor/browser-probe";
import {
  cpuHealth,
  diskHealth,
  gpuHealth,
  ramHealth,
} from "@/lib/monitor/health";
import { latestSample, useMonitor } from "@/lib/monitor/store";
import {
  MACHINE,
  WORKLOADS,
  type BrowserFacts,
} from "@/lib/monitor/types";
import { fromCelsius } from "@/lib/monitor/units";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const workload = useMonitor((s) => s.workload);
  const paused = useMonitor((s) => s.paused);
  const selected = useMonitor((s) => s.selected);
  const samples = useMonitor((s) => s.samples);
  const setWorkload = useMonitor((s) => s.setWorkload);
  const setSelected = useMonitor((s) => s.setSelected);
  const togglePaused = useMonitor((s) => s.togglePaused);
  const tick = useMonitor((s) => s.tick);
  const tempUnit = useMonitor((s) => s.tempUnit);
  const setTempUnit = useMonitor((s) => s.setTempUnit);
  const hydrateTempUnit = useMonitor((s) => s.hydrateTempUnit);
  const [facts, setFacts] = useState<BrowserFacts | null>(null);

  useEffect(() => {
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  useEffect(() => {
    hydrateTempUnit();
  }, [hydrateTempUnit]);

  useEffect(() => {
    let live = true;
    probeBrowser().then((f) => {
      if (live) setFacts(f);
    });
    return () => {
      live = false;
    };
  }, []);

  const s = latestSample(samples);
  const totalW = s.cpuPower + s.gpuPower;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">Hardware</p>
            <h1 className="mt-1 text-3xl font-medium tracking-tight sm:text-4xl">Glance</h1>
            <p className="mt-2 max-w-md text-sm text-muted text-pretty">
              The few numbers that matter. Not two hundred sensors.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="text-sm text-muted sm:text-right">
              <p className="font-medium text-fg">{MACHINE.name}</p>
              <p className="mt-0.5">{MACHINE.cpu}</p>
              <p>{MACHINE.gpu}</p>
            </div>
            <div
              className="inline-flex self-start rounded-full bg-raised p-1 shadow-[var(--shadow-border)] sm:self-end"
              role="group"
              aria-label="Temperature unit"
            >
              <UnitChip label="°F" active={tempUnit === "F"} onClick={() => setTempUnit("F")} />
              <UnitChip label="°C" active={tempUnit === "C"} onClick={() => setTempUnit("C")} />
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Workload">
            {WORKLOADS.map((w) => (
              <WorkloadChip
                key={w.id}
                active={workload === w.id}
                label={w.label}
                hint={w.hint}
                onClick={() => setWorkload(w.id)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={togglePaused}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full bg-raised px-4 text-sm font-medium shadow-[var(--shadow-border)] transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>

        <div className="stagger-in mt-6 flex flex-col gap-4">
          <StatusBanner sample={s} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricCard
              id="cpu"
              title="Processor"
              primary={Math.round(fromCelsius(s.cpuTemp, tempUnit)).toString()}
              unit={`°${tempUnit}`}
              secondary={`${s.cpuLoad.toFixed(0)}% busy · ${s.cpuPower.toFixed(0)} W`}
              value={s.cpuTemp}
              health={cpuHealth(s)}
              selected={selected === "cpu"}
              onSelect={setSelected}
            />
            <MetricCard
              id="gpu"
              title="Graphics"
              primary={Math.round(fromCelsius(s.gpuTemp, tempUnit)).toString()}
              unit={`°${tempUnit}`}
              secondary={`${s.gpuLoad.toFixed(0)}% busy · ${s.gpuVram.toFixed(0)}% VRAM`}
              value={s.gpuTemp}
              health={gpuHealth(s)}
              selected={selected === "gpu"}
              onSelect={setSelected}
            />
            <MetricCard
              id="ram"
              title="Memory"
              primary={s.ram.toFixed(0)}
              unit="%"
              secondary={`${MACHINE.ram} installed`}
              value={s.ram}
              health={ramHealth(s)}
              selected={selected === "ram"}
              onSelect={setSelected}
            />
            <MetricCard
              id="disk"
              title="Storage"
              primary={s.diskUsed.toFixed(0)}
              unit="% full"
              secondary={`${s.diskActivity.toFixed(0)}% activity · ${MACHINE.storage}`}
              value={s.diskUsed}
              health={diskHealth(s)}
              selected={selected === "disk"}
              onSelect={setSelected}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat label="Network down" value={`${s.netDown.toFixed(1)} MB/s`} />
            <MiniStat label="Network up" value={`${s.netUp.toFixed(1)} MB/s`} />
            <MiniStat label="Board power" value={`${totalW.toFixed(0)} W`} className="col-span-2 sm:col-span-1" />
          </div>

          <DetailPanel id={selected} samples={samples} unit={tempUnit} />
          <BrowserFactsPanel facts={facts} />

          <p className="px-1 text-xs text-subtle text-pretty">
            Live numbers above are a realistic desktop demo so you can see the layout. A webpage
            cannot read your real CPU or GPU sensors — use the workload chips to try idle, gaming,
            and worst-case heat.
          </p>
        </div>
      </div>
    </div>
  );
}

function UnitChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-9 min-w-11 rounded-full px-3 text-sm font-medium transition-[background,color,transform] duration-150 ease-out active:scale-[0.96]",
        active ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
      )}
    >
      {label}
    </button>
  );
}

function WorkloadChip({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={cn(
        "min-h-11 rounded-full px-4 text-sm font-medium transition-[background,color,transform] duration-150 ease-out active:scale-[0.96]",
        active ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg",
      )}
    >
      {label}
    </button>
  );
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]", className)}>
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums">{value}</p>
    </div>
  );
}
