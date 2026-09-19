import type { BrowserFacts } from "./types";

type NavWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { effectiveType?: string; downlink?: number };
};

type PerfMemory = { usedJSHeapSize: number; jsHeapSizeLimit: number };

function gpuName(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return gl.getParameter(gl.RENDERER) as string;
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
  } catch {
    return null;
  }
}

function platformLabel(): string {
  const ua = navigator.userAgent;
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return navigator.platform || "Unknown";
}

export async function probeBrowser(): Promise<BrowserFacts> {
  const nav = navigator as NavWithHints;
  const conn = nav.connection;
  const perf = performance as Performance & { memory?: PerfMemory };

  let batteryPct: number | null = null;
  let batteryCharging: boolean | null = null;
  try {
    const anyNav = navigator as Navigator & {
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
    };
    if (anyNav.getBattery) {
      const b = await anyNav.getBattery();
      batteryPct = Math.round(b.level * 100);
      batteryCharging = b.charging;
    }
  } catch {
    /* Battery API is optional */
  }

  return {
    cores: navigator.hardwareConcurrency || null,
    deviceMemoryGb: nav.deviceMemory ?? null,
    platform: platformLabel(),
    gpu: gpuName(),
    screen: `${window.screen.width} × ${window.screen.height}`,
    connection: conn?.effectiveType ?? null,
    downlink: conn?.downlink ?? null,
    batteryPct,
    batteryCharging,
    heapUsedMb: perf.memory ? Math.round(perf.memory.usedJSHeapSize / 1048576) : null,
    heapLimitMb: perf.memory ? Math.round(perf.memory.jsHeapSizeLimit / 1048576) : null,
  };
}
