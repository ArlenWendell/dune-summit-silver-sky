import type { Health, Sample } from "./types";

export function band(value: number, warm: number, hot: number): Health {
  if (value >= hot) return "hot";
  if (value >= warm) return "warm";
  return "ok";
}

export function cpuHealth(s: Sample): Health {
  return band(s.cpuTemp, 80, 90);
}

export function gpuHealth(s: Sample): Health {
  // High load while gaming is fine — heat is the real signal.
  return band(s.gpuTemp, 80, 88);
}

export function ramHealth(s: Sample): Health {
  return band(s.ram, 85, 93);
}

export function diskHealth(s: Sample): Health {
  return band(s.diskUsed, 88, 95);
}

export function overallHealth(s: Sample): Health {
  return worse(cpuHealth(s), worse(gpuHealth(s), worse(ramHealth(s), diskHealth(s))));
}

export function worse(a: Health, b: Health): Health {
  const rank = { ok: 0, warm: 1, hot: 2 };
  return rank[a] >= rank[b] ? a : b;
}

export function healthLabel(h: Health): string {
  if (h === "hot") return "Critical";
  if (h === "warm") return "Threshold";
  return "Normal";
}

export function healthInk(h: Health): string {
  if (h === "hot") return "text-hot";
  if (h === "warm") return "text-warm";
  return "text-ink";
}

export function overallCopy(s: Sample): { title: string; body: string } {
  const h = overallHealth(s);
  if (h === "hot") {
    if (s.cpuTemp >= 90 && s.gpuTemp >= 88) {
      return {
        title: "Processor and graphics are running hot",
        body: "Both chips are past a comfortable range. Check that fans and the radiator are spinning, and that vents are not blocked.",
      };
    }
    if (s.cpuTemp >= 90) {
      return {
        title: "The processor is running hot",
        body: "A short spike during a heavy task is normal. If it stays this hot while you are just browsing, cooling needs a look.",
      };
    }
    if (s.gpuTemp >= 88) {
      return {
        title: "The graphics card is running hot",
        body: "High load in a game is expected. Heat this high for a long stretch is when you check case airflow.",
      };
    }
    if (s.ram >= 93) {
      return {
        title: "Memory is almost full",
        body: "Windows will start swapping to disk and everything will feel sticky. Close heavy apps or add RAM.",
      };
    }
    return {
      title: "Storage is nearly full",
      body: "Drives this packed get slow and updates can fail. Free some space on the system disk.",
    };
  }
  if (h === "warm") {
    return {
      title: "A few things are warm — still fine",
      body: "Nothing is in the danger zone. This is typical during a game or a heavy export.",
    };
  }
  return {
    title: "Everything looks fine",
    body: "Temps are comfortable and nothing is running out of room.",
  };
}
