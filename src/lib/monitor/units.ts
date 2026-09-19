export type TempUnit = "C" | "F";

export const TEMP_STORAGE_KEY = "glance-temp-unit";

export function readTempUnit(): TempUnit {
  if (typeof window === "undefined") return "F";
  return window.localStorage.getItem(TEMP_STORAGE_KEY) === "C" ? "C" : "F";
}

export function writeTempUnit(unit: TempUnit) {
  window.localStorage.setItem(TEMP_STORAGE_KEY, unit);
}

export function fromCelsius(c: number, unit: TempUnit): number {
  return unit === "F" ? c * 1.8 + 32 : c;
}

export function formatTemp(c: number, unit: TempUnit): string {
  return `${Math.round(fromCelsius(c, unit))}°${unit}`;
}
