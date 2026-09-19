import type { BrowserFacts } from "@/lib/monitor/types";

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-raised px-3 py-3">
      <p className="text-xs text-subtle">{k}</p>
      <p className="mt-1 truncate text-sm font-medium">{v}</p>
    </div>
  );
}

export function BrowserFactsPanel({ facts }: { facts: BrowserFacts | null }) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <h3 className="text-lg font-medium tracking-tight">This browser</h3>
      <p className="mt-1 text-sm text-muted text-pretty">
        Websites are not allowed to read fan speeds or chip temperatures. These are the few hardware
        facts the page can actually see on this device.
      </p>
      {!facts ? (
        <p className="mt-4 text-sm text-subtle">Reading this device…</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Fact k="System" v={facts.platform} />
          <Fact k="CPU threads" v={facts.cores != null ? String(facts.cores) : "Not reported"} />
          <Fact
            k="Device RAM hint"
            v={facts.deviceMemoryGb != null ? `About ${facts.deviceMemoryGb} GB` : "Not reported"}
          />
          <Fact k="Screen" v={facts.screen} />
          <Fact k="Graphics (browser)" v={facts.gpu ?? "Not reported"} />
          <Fact
            k="Network"
            v={
              facts.connection
                ? `${facts.connection}${facts.downlink != null ? ` · ~${facts.downlink} Mbps` : ""}`
                : "Not reported"
            }
          />
          {facts.batteryPct != null && (
            <Fact
              k="Battery"
              v={`${facts.batteryPct}%${facts.batteryCharging ? " · charging" : ""}`}
            />
          )}
          {facts.heapUsedMb != null && (
            <Fact
              k="Page memory"
              v={`${facts.heapUsedMb} / ${facts.heapLimitMb} MB`}
            />
          )}
        </div>
      )}
    </section>
  );
}
