export type Workload = "rest" | "everyday" | "gaming" | "stress";

export type Health = "ok" | "warm" | "hot";

export type MetricId = "cpu" | "gpu" | "ram" | "disk";

export type Sample = {
  t: number;
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

export type Machine = {
  name: string;
  cpu: string;
  cpuDetail: string;
  gpu: string;
  gpuDetail: string;
  ram: string;
  storage: string;
};

export type BrowserFacts = {
  cores: number | null;
  deviceMemoryGb: number | null;
  platform: string;
  gpu: string | null;
  screen: string;
  connection: string | null;
  downlink: number | null;
  batteryPct: number | null;
  batteryCharging: boolean | null;
  heapUsedMb: number | null;
  heapLimitMb: number | null;
};

export const MACHINE: Machine = {
  name: "Gaming desktop",
  cpu: "Intel Core i9-13900K",
  cpuDetail: "24 cores · 32 threads",
  gpu: "GeForce RTX 4090",
  gpuDetail: "24 GB GDDR6X",
  ram: "32 GB DDR5",
  storage: "1 TB NVMe SSD",
};

export const WORKLOADS: { id: Workload; label: string; hint: string }[] = [
  { id: "rest", label: "Resting", hint: "Desktop idle" },
  { id: "everyday", label: "Everyday", hint: "Browser and apps" },
  { id: "gaming", label: "Gaming", hint: "Full-screen game" },
  { id: "stress", label: "Stress", hint: "All cores maxed" },
];
