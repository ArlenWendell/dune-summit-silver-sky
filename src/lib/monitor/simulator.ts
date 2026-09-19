import type { Sample, Workload } from "./types";

type Target = {
  cpuLoad: number;
  cpuTemp: number;
  cpuPower: number;
  gpuLoad: number;
  gpuTemp: number;
  gpuVram: number;
  gpuFan: number;
  gpuPower: number;
  ram: number;
  diskUsed: number;
  diskActivity: number;
  netDown: number;
  netUp: number;
};

const TARGETS: Record<Workload, Target> = {
  rest: {
    cpuLoad: 6,
    cpuTemp: 42,
    cpuPower: 28,
    gpuLoad: 2,
    gpuTemp: 36,
    gpuVram: 8,
    gpuFan: 30,
    gpuPower: 18,
    ram: 28,
    diskUsed: 64,
    diskActivity: 1,
    netDown: 0.2,
    netUp: 0.05,
  },
  everyday: {
    cpuLoad: 18,
    cpuTemp: 56,
    cpuPower: 65,
    gpuLoad: 12,
    gpuTemp: 48,
    gpuVram: 22,
    gpuFan: 35,
    gpuPower: 40,
    ram: 46,
    diskUsed: 64,
    diskActivity: 8,
    netDown: 4.5,
    netUp: 0.4,
  },
  gaming: {
    cpuLoad: 44,
    cpuTemp: 72,
    cpuPower: 145,
    gpuLoad: 97,
    gpuTemp: 71,
    gpuVram: 78,
    gpuFan: 68,
    gpuPower: 380,
    ram: 62,
    diskUsed: 64,
    diskActivity: 14,
    netDown: 2.2,
    netUp: 0.3,
  },
  stress: {
    cpuLoad: 99,
    cpuTemp: 91,
    cpuPower: 250,
    gpuLoad: 99,
    gpuTemp: 86,
    gpuVram: 94,
    gpuFan: 92,
    gpuPower: 445,
    ram: 88,
    diskUsed: 64,
    diskActivity: 55,
    netDown: 12,
    netUp: 3.5,
  },
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function step(current: number, target: number, chase: number, jitter: number) {
  return current + (target - current) * chase + (Math.random() - 0.5) * jitter;
}

export function seedSample(workload: Workload, t = Date.now()): Sample {
  const g = TARGETS[workload];
  return { t, ...g };
}

export function nextSample(prev: Sample, workload: Workload): Sample {
  const g = TARGETS[workload];
  const cpuLoad = clamp(step(prev.cpuLoad, g.cpuLoad, 0.18, 3.2), 0, 100);
  const gpuLoad = clamp(step(prev.gpuLoad, g.gpuLoad, 0.22, 2.4), 0, 100);
  const cpuTemp = clamp(step(prev.cpuTemp, g.cpuTemp, 0.12, 0.8), 28, 100);
  const gpuTemp = clamp(step(prev.gpuTemp, g.gpuTemp, 0.12, 0.7), 28, 100);
  return {
    t: Date.now(),
    cpuLoad,
    cpuTemp,
    cpuPower: clamp(step(prev.cpuPower, g.cpuPower, 0.16, 6), 8, 280),
    gpuLoad,
    gpuTemp,
    gpuVram: clamp(step(prev.gpuVram, g.gpuVram, 0.1, 1.2), 4, 99),
    gpuFan: clamp(step(prev.gpuFan, g.gpuFan, 0.1, 1.5), 0, 100),
    gpuPower: clamp(step(prev.gpuPower, g.gpuPower, 0.16, 10), 10, 480),
    ram: clamp(step(prev.ram, g.ram, 0.08, 0.6), 12, 99),
    diskUsed: clamp(step(prev.diskUsed, g.diskUsed, 0.02, 0.05), 10, 99),
    diskActivity: clamp(step(prev.diskActivity, g.diskActivity, 0.25, 4), 0, 100),
    netDown: clamp(step(prev.netDown, g.netDown, 0.2, 0.6), 0, 80),
    netUp: clamp(step(prev.netUp, g.netUp, 0.2, 0.15), 0, 40),
  };
}
