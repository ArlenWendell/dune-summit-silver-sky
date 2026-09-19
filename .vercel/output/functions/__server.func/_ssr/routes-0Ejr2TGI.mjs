import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Play, r as Pause } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-0Ejr2TGI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Fact({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-raised px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 truncate text-sm font-medium",
			children: v
		})]
	});
}
function BrowserFactsPanel({ facts }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-medium tracking-tight",
				children: "This browser"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted text-pretty",
				children: "Websites are not allowed to read fan speeds or chip temperatures. These are the few hardware facts the page can actually see on this device."
			}),
			!facts ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-subtle",
				children: "Reading this device…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "System",
						v: facts.platform
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "CPU threads",
						v: facts.cores != null ? String(facts.cores) : "Not reported"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Device RAM hint",
						v: facts.deviceMemoryGb != null ? `About ${facts.deviceMemoryGb} GB` : "Not reported"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Screen",
						v: facts.screen
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Graphics (browser)",
						v: facts.gpu ?? "Not reported"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Network",
						v: facts.connection ? `${facts.connection}${facts.downlink != null ? ` · ~${facts.downlink} Mbps` : ""}` : "Not reported"
					}),
					facts.batteryPct != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Battery",
						v: `${facts.batteryPct}%${facts.batteryCharging ? " · charging" : ""}`
					}),
					facts.heapUsedMb != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						k: "Page memory",
						v: `${facts.heapUsedMb} / ${facts.heapLimitMb} MB`
					})
				]
			})
		]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Sparkline({ values, health, className }) {
	const w = 240;
	const h = 64;
	const min = Math.min(...values, 0);
	const max = Math.max(...values, 1);
	const span = Math.max(max - min, 1);
	const pts = values.map((v, i) => {
		const x = values.length <= 1 ? 0 : i / (values.length - 1) * w;
		const y = h - (v - min) / span * 58 - 3;
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(" ");
	const stroke = health === "hot" ? "var(--color-hot)" : health === "warm" ? "var(--color-warm)" : "var(--color-ink)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: cn("h-16 w-full overflow-visible", className),
		preserveAspectRatio: "none",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke,
			strokeWidth: "2",
			strokeLinejoin: "round",
			strokeLinecap: "round",
			points: pts,
			vectorEffect: "non-scaling-stroke"
		})
	});
}
function band(value, warm, hot) {
	if (value >= hot) return "hot";
	if (value >= warm) return "warm";
	return "ok";
}
function cpuHealth(s) {
	return band(s.cpuTemp, 80, 90);
}
function gpuHealth(s) {
	return band(s.gpuTemp, 80, 88);
}
function ramHealth(s) {
	return band(s.ram, 85, 93);
}
function diskHealth(s) {
	return band(s.diskUsed, 88, 95);
}
function overallHealth(s) {
	return worse(cpuHealth(s), worse(gpuHealth(s), worse(ramHealth(s), diskHealth(s))));
}
function worse(a, b) {
	const rank = {
		ok: 0,
		warm: 1,
		hot: 2
	};
	return rank[a] >= rank[b] ? a : b;
}
function healthLabel(h) {
	if (h === "hot") return "Critical";
	if (h === "warm") return "Threshold";
	return "Normal";
}
function healthInk(h) {
	if (h === "hot") return "text-hot";
	if (h === "warm") return "text-warm";
	return "text-ink";
}
function overallCopy(s) {
	const h = overallHealth(s);
	if (h === "hot") {
		if (s.cpuTemp >= 90 && s.gpuTemp >= 88) return {
			title: "Processor and graphics are running hot",
			body: "Both chips are past a comfortable range. Check that fans and the radiator are spinning, and that vents are not blocked."
		};
		if (s.cpuTemp >= 90) return {
			title: "The processor is running hot",
			body: "A short spike during a heavy task is normal. If it stays this hot while you are just browsing, cooling needs a look."
		};
		if (s.gpuTemp >= 88) return {
			title: "The graphics card is running hot",
			body: "High load in a game is expected. Heat this high for a long stretch is when you check case airflow."
		};
		if (s.ram >= 93) return {
			title: "Memory is almost full",
			body: "Windows will start swapping to disk and everything will feel sticky. Close heavy apps or add RAM."
		};
		return {
			title: "Storage is nearly full",
			body: "Drives this packed get slow and updates can fail. Free some space on the system disk."
		};
	}
	if (h === "warm") return {
		title: "A few things are warm — still fine",
		body: "Nothing is in the danger zone. This is typical during a game or a heavy export."
	};
	return {
		title: "Everything looks fine",
		body: "Temps are comfortable and nothing is running out of room."
	};
}
var MACHINE = {
	name: "Gaming desktop",
	cpu: "Intel Core i9-13900K",
	cpuDetail: "24 cores · 32 threads",
	gpu: "GeForce RTX 4090",
	gpuDetail: "24 GB GDDR6X",
	ram: "32 GB DDR5",
	storage: "1 TB NVMe SSD"
};
var WORKLOADS = [
	{
		id: "rest",
		label: "Resting",
		hint: "Desktop idle"
	},
	{
		id: "everyday",
		label: "Everyday",
		hint: "Browser and apps"
	},
	{
		id: "gaming",
		label: "Gaming",
		hint: "Full-screen game"
	},
	{
		id: "stress",
		label: "Stress",
		hint: "All cores maxed"
	}
];
var TEMP_STORAGE_KEY = "glance-temp-unit";
function readTempUnit() {
	if (typeof window === "undefined") return "F";
	return window.localStorage.getItem("glance-temp-unit") === "C" ? "C" : "F";
}
function writeTempUnit(unit) {
	window.localStorage.setItem(TEMP_STORAGE_KEY, unit);
}
function fromCelsius(c, unit) {
	return unit === "F" ? c * 1.8 + 32 : c;
}
function formatTemp(c, unit) {
	return `${Math.round(fromCelsius(c, unit))}°${unit}`;
}
function copyFor(unit) {
	return {
		cpu: {
			title: "Processor",
			why: `Load is how busy the chip is. Heat is what actually matters. A game at 40–60% load and under ${formatTemp(80, unit)} is healthy. Constant max heat while the desktop is idle is not.`,
			series: (s) => s.cpuTemp,
			health: cpuHealth
		},
		gpu: {
			title: "Graphics card",
			why: `High load during a game is the whole point of the card. Watch temperature instead. Most big NVIDIA cards are happy around ${formatTemp(65, unit)}–${formatTemp(75, unit)}. Sitting near ${formatTemp(85, unit)} for a long stretch is when you check case airflow.`,
			series: (s) => s.gpuTemp,
			health: gpuHealth
		},
		ram: {
			title: "Memory",
			why: "This is how full your RAM is. When it stays near the top, Windows starts using the disk as fake memory and the PC feels sticky. Closing browsers and games frees it instantly.",
			series: (s) => s.ram,
			health: ramHealth
		},
		disk: {
			title: "Storage",
			why: "This is how full the drive is, not how fast it is. Past about 90% full, Windows updates get flaky and everything hitchy. Activity (the smaller number) is just how hard it is reading and writing right now.",
			series: (s) => s.diskUsed,
			health: diskHealth
		}
	};
}
function Row({ k, v, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-4 border-t border-line py-2.5 first:border-t-0 first:pt-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("font-mono text-sm tabular-nums", tone),
			children: v
		})]
	});
}
function DetailPanel({ id, samples, unit }) {
	const latest = samples[samples.length - 1];
	if (!latest) return null;
	const meta = copyFor(unit)[id];
	const health = meta.health(latest);
	const series = samples.map(meta.series);
	const tone = healthInk(health);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-subtle",
					children: "Last minute"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-medium tracking-tight",
					children: meta.title
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("text-xs font-medium", tone),
					children: id === "cpu" || id === "gpu" ? "Temperature over time" : "Use over time"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-lg bg-display px-3 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
					values: series,
					health,
					className: "h-24"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-sm text-muted text-pretty",
				children: meta.why
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					id === "cpu" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Chip",
							v: MACHINE.cpu
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Layout",
							v: MACHINE.cpuDetail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Load",
							v: `${latest.cpuLoad.toFixed(0)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Temperature",
							v: formatTemp(latest.cpuTemp, unit),
							tone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Power",
							v: `${latest.cpuPower.toFixed(0)} W`
						})
					] }),
					id === "gpu" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Card",
							v: MACHINE.gpu
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Memory size",
							v: MACHINE.gpuDetail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Load",
							v: `${latest.gpuLoad.toFixed(0)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Temperature",
							v: formatTemp(latest.gpuTemp, unit),
							tone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Video memory",
							v: `${latest.gpuVram.toFixed(0)}% used`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Fan",
							v: `${latest.gpuFan.toFixed(0)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Power",
							v: `${latest.gpuPower.toFixed(0)} W`
						})
					] }),
					id === "ram" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Installed",
							v: MACHINE.ram
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "In use",
							v: `${latest.ram.toFixed(0)}%`,
							tone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Headroom",
							v: `${(100 - latest.ram).toFixed(0)}% free`
						})
					] }),
					id === "disk" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Drive",
							v: MACHINE.storage
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Space used",
							v: `${latest.diskUsed.toFixed(0)}%`,
							tone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Activity right now",
							v: `${latest.diskActivity.toFixed(0)}%`
						})
					] })
				]
			})
		]
	});
}
var CX = 50;
var CY = 46;
var R = 36;
function pt(deg) {
	const rad = deg * Math.PI / 180;
	return {
		x: CX + R * Math.cos(rad),
		y: CY + R * Math.sin(rad)
	};
}
var START = pt(135);
var END = pt(45);
var D = `M ${START.x.toFixed(2)} ${START.y.toFixed(2)} A ${R} ${R} 0 1 1 ${END.x.toFixed(2)} ${END.y.toFixed(2)}`;
function Gauge({ value, max = 100, health }) {
	const pct = Math.max(0, Math.min(1, value / max));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 100 78",
		className: "h-[4.5rem] w-[5.5rem] shrink-0",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: D,
			fill: "none",
			stroke: "var(--color-track)",
			strokeWidth: "7",
			strokeLinecap: "round"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: D,
			fill: "none",
			stroke: health === "hot" ? "var(--color-hot)" : health === "warm" ? "var(--color-warm)" : "var(--color-ink)",
			strokeWidth: "7",
			strokeLinecap: "round",
			pathLength: 100,
			strokeDasharray: `${pct * 100} 100`,
			style: { transition: "stroke-dasharray 400ms cubic-bezier(0.22, 1, 0.36, 1), stroke 250ms ease" }
		})]
	});
}
function MetricCard({ id, title, primary, secondary, unit, value, max, health, selected, onSelect }) {
	const tone = healthInk(health);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => onSelect(id),
		"aria-pressed": selected,
		className: cn("w-full rounded-xl bg-surface p-2 text-left shadow-[var(--shadow-border)]", "transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.96]", "hover:shadow-[0_0_0_1px_rgb(255_255_255_/_0.13)]", selected && "shadow-[0_0_0_1px_rgb(213_218_227_/_0.45)]"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-28 items-center gap-1 rounded-lg bg-display px-3 py-3 text-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
				value,
				max,
				health
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-ink/55",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-xs font-medium", tone),
							children: healthLabel(health)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("mt-1 font-mono text-2xl font-medium tabular-nums leading-none tracking-tight", tone),
						children: [primary, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 text-sm font-medium opacity-70",
							children: unit
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 truncate text-xs text-ink/50",
						children: secondary
					})
				]
			})]
		})
	});
}
function StatusBanner({ sample }) {
	const health = overallHealth(sample);
	const copy = overallCopy(sample);
	const chip = health === "hot" ? "bg-hot-dim text-hot" : health === "warm" ? "bg-warm-dim text-warm" : "bg-display text-ink";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-xl px-5 py-4 shadow-[var(--shadow-border)]", "bg-surface"),
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", chip),
				children: health === "hot" ? "Critical" : health === "warm" ? "Threshold" : "All good"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 text-xl font-medium tracking-tight text-balance sm:text-2xl",
				children: copy.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm text-muted text-pretty",
				children: copy.body
			})
		]
	});
}
function gpuName() {
	try {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		if (!gl || !(gl instanceof WebGLRenderingContext)) return null;
		const ext = gl.getExtension("WEBGL_debug_renderer_info");
		if (!ext) return gl.getParameter(gl.RENDERER);
		return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
	} catch {
		return null;
	}
}
function platformLabel() {
	const ua = navigator.userAgent;
	if (/Windows NT/i.test(ua)) return "Windows";
	if (/Mac OS X/i.test(ua)) return "macOS";
	if (/Android/i.test(ua)) return "Android";
	if (/iPhone|iPad/i.test(ua)) return "iOS";
	if (/Linux/i.test(ua)) return "Linux";
	return navigator.platform || "Unknown";
}
async function probeBrowser() {
	const nav = navigator;
	const conn = nav.connection;
	const perf = performance;
	let batteryPct = null;
	let batteryCharging = null;
	try {
		const anyNav = navigator;
		if (anyNav.getBattery) {
			const b = await anyNav.getBattery();
			batteryPct = Math.round(b.level * 100);
			batteryCharging = b.charging;
		}
	} catch {}
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
		heapLimitMb: perf.memory ? Math.round(perf.memory.jsHeapSizeLimit / 1048576) : null
	};
}
var TARGETS = {
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
		netDown: .2,
		netUp: .05
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
		netUp: .4
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
		netUp: .3
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
		netUp: 3.5
	}
};
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function step(current, target, chase, jitter) {
	return current + (target - current) * chase + (Math.random() - .5) * jitter;
}
function seedSample(workload, t = Date.now()) {
	return {
		t,
		...TARGETS[workload]
	};
}
function nextSample(prev, workload) {
	const g = TARGETS[workload];
	const cpuLoad = clamp(step(prev.cpuLoad, g.cpuLoad, .18, 3.2), 0, 100);
	const gpuLoad = clamp(step(prev.gpuLoad, g.gpuLoad, .22, 2.4), 0, 100);
	const cpuTemp = clamp(step(prev.cpuTemp, g.cpuTemp, .12, .8), 28, 100);
	const gpuTemp = clamp(step(prev.gpuTemp, g.gpuTemp, .12, .7), 28, 100);
	return {
		t: Date.now(),
		cpuLoad,
		cpuTemp,
		cpuPower: clamp(step(prev.cpuPower, g.cpuPower, .16, 6), 8, 280),
		gpuLoad,
		gpuTemp,
		gpuVram: clamp(step(prev.gpuVram, g.gpuVram, .1, 1.2), 4, 99),
		gpuFan: clamp(step(prev.gpuFan, g.gpuFan, .1, 1.5), 0, 100),
		gpuPower: clamp(step(prev.gpuPower, g.gpuPower, .16, 10), 10, 480),
		ram: clamp(step(prev.ram, g.ram, .08, .6), 12, 99),
		diskUsed: clamp(step(prev.diskUsed, g.diskUsed, .02, .05), 10, 99),
		diskActivity: clamp(step(prev.diskActivity, g.diskActivity, .25, 4), 0, 100),
		netDown: clamp(step(prev.netDown, g.netDown, .2, .6), 0, 80),
		netUp: clamp(step(prev.netUp, g.netUp, .2, .15), 0, 40)
	};
}
var useMonitor = create((set, get) => ({
	workload: "everyday",
	paused: false,
	selected: "cpu",
	samples: [seedSample("everyday")],
	tempUnit: "F",
	setWorkload: (w) => {
		const { samples } = get();
		const last = samples[samples.length - 1] ?? seedSample(w);
		set({
			workload: w,
			samples: [...samples, {
				...last,
				t: Date.now()
			}].slice(-60)
		});
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
		const next = nextSample(samples[samples.length - 1] ?? seedSample(workload), workload);
		set({ samples: [...samples, next].slice(-60) });
	}
}));
function latestSample(samples) {
	return samples[samples.length - 1] ?? seedSample("everyday");
}
function Dashboard() {
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
	const [facts, setFacts] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, [tick]);
	(0, import_react.useEffect)(() => {
		hydrateTempUnit();
	}, [hydrateTempUnit]);
	(0, import_react.useEffect)(() => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-[0.18em] text-subtle",
							children: "Hardware"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 text-3xl font-medium tracking-tight sm:text-4xl",
							children: "Glance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-md text-sm text-muted text-pretty",
							children: "The few numbers that matter. Not two hundred sensors."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm text-muted sm:text-right",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-fg",
									children: MACHINE.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5",
									children: MACHINE.cpu
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: MACHINE.gpu })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex self-start rounded-full bg-raised p-1 shadow-[var(--shadow-border)] sm:self-end",
							role: "group",
							"aria-label": "Temperature unit",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitChip, {
								label: "°F",
								active: tempUnit === "F",
								onClick: () => setTempUnit("F")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitChip, {
								label: "°C",
								active: tempUnit === "C",
								onClick: () => setTempUnit("C")
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						role: "tablist",
						"aria-label": "Workload",
						children: WORKLOADS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkloadChip, {
							active: workload === w.id,
							label: w.label,
							hint: w.hint,
							onClick: () => setWorkload(w.id)
						}, w.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: togglePaused,
						className: "inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full bg-raised px-4 text-sm font-medium shadow-[var(--shadow-border)] transition-transform duration-150 ease-out active:scale-[0.96]",
						children: [paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }), paused ? "Resume" : "Pause"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "stagger-in mt-6 flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBanner, { sample: s }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
									id: "cpu",
									title: "Processor",
									primary: Math.round(fromCelsius(s.cpuTemp, tempUnit)).toString(),
									unit: `°${tempUnit}`,
									secondary: `${s.cpuLoad.toFixed(0)}% busy · ${s.cpuPower.toFixed(0)} W`,
									value: s.cpuTemp,
									health: cpuHealth(s),
									selected: selected === "cpu",
									onSelect: setSelected
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
									id: "gpu",
									title: "Graphics",
									primary: Math.round(fromCelsius(s.gpuTemp, tempUnit)).toString(),
									unit: `°${tempUnit}`,
									secondary: `${s.gpuLoad.toFixed(0)}% busy · ${s.gpuVram.toFixed(0)}% VRAM`,
									value: s.gpuTemp,
									health: gpuHealth(s),
									selected: selected === "gpu",
									onSelect: setSelected
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
									id: "ram",
									title: "Memory",
									primary: s.ram.toFixed(0),
									unit: "%",
									secondary: `${MACHINE.ram} installed`,
									value: s.ram,
									health: ramHealth(s),
									selected: selected === "ram",
									onSelect: setSelected
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
									id: "disk",
									title: "Storage",
									primary: s.diskUsed.toFixed(0),
									unit: "% full",
									secondary: `${s.diskActivity.toFixed(0)}% activity · ${MACHINE.storage}`,
									value: s.diskUsed,
									health: diskHealth(s),
									selected: selected === "disk",
									onSelect: setSelected
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Network down",
									value: `${s.netDown.toFixed(1)} MB/s`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Network up",
									value: `${s.netUp.toFixed(1)} MB/s`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Board power",
									value: `${totalW.toFixed(0)} W`,
									className: "col-span-2 sm:col-span-1"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailPanel, {
							id: selected,
							samples,
							unit: tempUnit
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserFactsPanel, { facts }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-1 text-xs text-subtle text-pretty",
							children: "Live numbers above are a realistic desktop demo so you can see the layout. A webpage cannot read your real CPU or GPU sensors — use the workload chips to try idle, gaming, and worst-case heat."
						})
					]
				})
			]
		})
	});
}
function UnitChip({ label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-pressed": active,
		className: cn("min-h-9 min-w-11 rounded-full px-3 text-sm font-medium transition-[background,color,transform] duration-150 ease-out active:scale-[0.96]", active ? "bg-accent text-accent-fg" : "text-muted hover:text-fg"),
		children: label
	});
}
function WorkloadChip({ active, label, hint, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		title: hint,
		className: cn("min-h-11 rounded-full px-4 text-sm font-medium transition-[background,color,transform] duration-150 ease-out active:scale-[0.96]", active ? "bg-accent text-accent-fg" : "bg-raised text-muted hover:text-fg"),
		children: label
	});
}
function MiniStat({ label, value, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-mono text-lg tabular-nums",
			children: value
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {});
}
//#endregion
export { Home as component };
