import { create } from "zustand";
import { nextSample, seedSample } from "./simulator";
import type { MetricId, Sample, Workload } from "./types";
import { readTempUnit, writeTempUnit, type TempUnit } from "./units";

const HISTORY = 60;

type MonitorState = {
  workload: Workload;
  paused: boolean;
  selected: MetricId;
  samples: Sample[];
  tempUnit: TempUnit;
  setWorkload: (w: Workload) => void;
  setSelected: (id: MetricId) => void;
  setTempUnit: (unit: TempUnit) => void;
  hydrateTempUnit: () => void;
  togglePaused: () => void;
  tick: () => void;
};

export const useMonitor = create<MonitorState>((set, get) => ({
  workload: "everyday",
  paused: false,
  selected: "cpu",
  samples: [seedSample("everyday")],
  tempUnit: "F",
  setWorkload: (w) => {
    const { samples } = get();
    const last = samples[samples.length - 1] ?? seedSample(w);
    set({ workload: w, samples: [...samples, { ...last, t: Date.now() }].slice(-HISTORY) });
  },
  setSelected: (id) => set({ selected: id }),
  setTempUnit: (unit) => {
    writeTempUnit(unit);
    set({ tempUnit: unit });
  },
  hydrateTempUnit: () => set({ tempUnit: readTempUnit() }),
  togglePaused: () => set({ paused: !get().paused }),
  tick: () => {
    const { paused, workload, samples } = get();
    if (paused) return;
    const last = samples[samples.length - 1] ?? seedSample(workload);
    const next = nextSample(last, workload);
    set({ samples: [...samples, next].slice(-HISTORY) });
  },
}));

export function latestSample(samples: Sample[]): Sample {
  return samples[samples.length - 1] ?? seedSample("everyday");
}
