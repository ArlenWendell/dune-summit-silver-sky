#!/usr/bin/env python3
"""
Simple Hardware Monitor
A clean, live terminal dashboard for CPU, RAM, disk, network, GPU, and top processes.

Usage:
    python hw_monitor.py
    python hw_monitor.py --interval 1.0

Requires: psutil, rich
    pip install psutil rich
"""

from __future__ import annotations

import argparse
import platform
import shutil
import subprocess
import sys
import time
from datetime import datetime

try:
    import psutil
except ImportError:
    print("Missing dependency: psutil\n  pip install psutil")
    sys.exit(1)

try:
    from rich.console import Console, Group
    from rich.layout import Layout
    from rich.live import Live
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    from rich.progress_bar import ProgressBar
    from rich import box
except ImportError:
    print("Missing dependency: rich\n  pip install rich")
    sys.exit(1)


console = Console()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def bytes_human(n: float) -> str:
    units = ["B", "KB", "MB", "GB", "TB", "PB"]
    n = float(n)
    for u in units:
        if abs(n) < 1024.0:
            return f"{n:6.1f} {u}"
        n /= 1024.0
    return f"{n:6.1f} EB"


def bar(pct: float, width: int = 18) -> ProgressBar:
    pct = max(0.0, min(100.0, pct))
    if pct < 60:
        style = "green"
    elif pct < 85:
        style = "yellow"
    else:
        style = "red"
    return ProgressBar(total=100, completed=pct, width=width, complete_style=style)


def labeled_bar(label: str, pct: float, width: int = 18) -> Table:
    row = Table.grid()
    row.add_column()
    row.add_column()
    row.add_column()
    row.add_row(
        Text(f"{label}", style="bold dim"),
        Text(f"{pct:5.1f}%  ", style=color_pct(pct)),
        bar(pct, width),
    )
    return row


def color_pct(pct: float) -> str:
    if pct < 60:
        return "green"
    if pct < 85:
        return "yellow"
    return "red"


def first_available(attrs: list[str], default: str = "n/a") -> str:
    for a in attrs:
        if a:
            return str(a)
    return default


# ---------------------------------------------------------------------------
# NVIDIA GPU (optional)
# ---------------------------------------------------------------------------

def nvidia_stats() -> list[dict]:
    """Parse nvidia-smi if present. Returns list of GPU dicts."""
    exe = shutil.which("nvidia-smi")
    if not exe:
        return []
    query = (
        "name,temperature.gpu,utilization.gpu,utilization.memory,"
        "memory.used,memory.total,power.draw,power.limit,fan.speed,clocks.gr"
    )
    try:
        out = subprocess.check_output(
            [
                exe,
                f"--query-gpu={query}",
                "--format=csv,noheader,nounits",
            ],
            stderr=subprocess.DEVNULL,
            timeout=2,
            text=True,
        )
    except Exception:
        return []

    gpus = []
    for line in out.strip().splitlines():
        parts = [p.strip() for p in line.split(",")]
        if len(parts) < 10:
            continue

        def num(s: str) -> float | None:
            try:
                return float(s)
            except ValueError:
                return None

        gpus.append(
            {
                "name": parts[0],
                "temp": num(parts[1]),
                "util": num(parts[2]),
                "mem_util": num(parts[3]),
                "mem_used": num(parts[4]),  # MiB
                "mem_total": num(parts[5]),
                "power": num(parts[6]),
                "power_limit": num(parts[7]),
                "fan": num(parts[8]),
                "clock": num(parts[9]),
            }
        )
    return gpus


# ---------------------------------------------------------------------------
# CPU temperatures (best-effort, platform specific)
# ---------------------------------------------------------------------------

def cpu_temps() -> list[tuple[str, float]]:
    temps: list[tuple[str, float]] = []
    try:
        data = psutil.sensors_temperatures() or {}
    except Exception:
        return temps
    # Prefer package / Tctl / Core
    preferred = []
    others = []
    for chip, entries in data.items():
        for e in entries:
            label = e.label or chip
            if e.current is None:
                continue
            item = (label, float(e.current))
            low = label.lower()
            if any(k in low for k in ("package", "tctl", "tdie", "cpu", "core")):
                preferred.append(item)
            else:
                others.append(item)
    return (preferred or others)[:8]


# ---------------------------------------------------------------------------
# Panels
# ---------------------------------------------------------------------------

def header_panel() -> Panel:
    uname = platform.uname()
    boot = datetime.fromtimestamp(psutil.boot_time())
    uptime = datetime.now() - boot
    days = uptime.days
    hours, rem = divmod(int(uptime.total_seconds()) % 86400, 3600)
    mins, _ = divmod(rem, 60)
    up_str = f"{days}d {hours:02d}h {mins:02d}m"

    left = Text()
    left.append("HOST  ", style="bold dim")
    left.append(f"{uname.node}\n")
    left.append("OS    ", style="bold dim")
    left.append(f"{uname.system} {uname.release}\n")
    left.append("CPU   ", style="bold dim")
    left.append(first_available([uname.processor, platform.processor()]))

    right = Text()
    right.append("UPTIME  ", style="bold dim")
    right.append(f"{up_str}\n")
    right.append("BOOT    ", style="bold dim")
    right.append(boot.strftime("%Y-%m-%d %H:%M") + "\n")
    right.append("TIME    ", style="bold dim")
    right.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    grid = Table.grid(expand=True)
    grid.add_column(ratio=3)
    grid.add_column(ratio=2, justify="right")
    grid.add_row(left, right)
    return Panel(grid, title="[bold cyan]SYSTEM[/]", border_style="cyan", box=box.ROUNDED)


def cpu_panel() -> Panel:
    freq = psutil.cpu_freq()
    overall = psutil.cpu_percent(interval=None)
    per = psutil.cpu_percent(interval=None, percpu=True)
    logical = psutil.cpu_count(logical=True) or len(per)
    physical = psutil.cpu_count(logical=False)

    summary = Table.grid(expand=True)
    summary.add_column()
    summary.add_column(justify="right")
    freq_str = f"{freq.current:.0f} MHz" if freq else "n/a"
    if freq and freq.max:
        freq_str += f"  (max {freq.max:.0f})"
    cores_str = f"{physical or '?'}P / {logical}L"
    summary.add_row(
        labeled_bar("LOAD  ", overall),
        Text(f"{cores_str}   {freq_str}", style="dim"),
    )

    # Per-core table in two columns if many cores
    cores = Table(box=None, expand=True, pad_edge=False, show_header=False)
    n = len(per)
    cols = 2 if n > 8 else 1
    for _ in range(cols * 2):
        cores.add_column(overflow="ellipsis")

    rows_needed = (n + cols - 1) // cols
    rows = []
    for r in range(rows_needed):
        cells = []
        for c in range(cols):
            i = r + c * rows_needed
            if i < n:
                p = per[i]
                cells.append(Text(f"C{i:02d}", style="dim"))
                cells.append(labeled_bar("", p, width=12))
            else:
                cells.extend(["", ""])
        rows.append(cells)
    for row in rows:
        cores.add_row(*row)

    temps = cpu_temps()
    temp_line = Text()
    if temps:
        temp_line.append("TEMP  ", style="bold dim")
        for i, (label, t) in enumerate(temps[:4]):
            style = "green" if t < 70 else "yellow" if t < 85 else "red"
            if i:
                temp_line.append("  ")
            temp_line.append(f"{t:.0f}°C", style=style)
            temp_line.append(f" {label}", style="dim")

    body = Group(summary, Text(""), cores, Text(""), temp_line) if temps else Group(summary, Text(""), cores)
    return Panel(body, title="[bold green]CPU[/]", border_style="green", box=box.ROUNDED)


def mem_panel() -> Panel:
    vm = psutil.virtual_memory()
    sw = psutil.swap_memory()

    t = Table.grid(expand=True)
    t.add_column()
    t.add_column(justify="right")

    t.add_row(
        labeled_bar("RAM   ", vm.percent),
        Text(f"{bytes_human(vm.used)} / {bytes_human(vm.total)}", style="dim"),
    )
    extra = []
    if hasattr(vm, "cached"):
        extra.append(f"cache {bytes_human(vm.cached)}")
    if hasattr(vm, "available"):
        extra.append(f"avail {bytes_human(vm.available)}")
    t.add_row(Text("      " + "   ".join(extra), style="dim"), "")

    t.add_row(
        labeled_bar("SWAP  ", sw.percent) if sw.total else Text.assemble(("SWAP  ", "bold dim"), ("none", "dim")),
        Text(f"{bytes_human(sw.used)} / {bytes_human(sw.total)}" if sw.total else "", style="dim"),
    )
    return Panel(t, title="[bold magenta]MEMORY[/]", border_style="magenta", box=box.ROUNDED)


def disk_panel() -> Panel:
    table = Table(box=None, expand=True, pad_edge=False)
    table.add_column("Mount", style="bold", no_wrap=True)
    table.add_column("Used", justify="right")
    table.add_column("", ratio=2)
    table.add_column("Free", justify="right", style="dim")
    table.add_column("FS", style="dim")

    seen = set()
    for p in psutil.disk_partitions(all=False):
        if p.mountpoint in seen:
            continue
        # Skip obvious virtual / restricted
        if p.fstype.lower() in {"squashfs", "overlay", "tmpfs", "devtmpfs", "proc", "sysfs"}:
            continue
        try:
            u = psutil.disk_usage(p.mountpoint)
        except (PermissionError, OSError):
            continue
        seen.add(p.mountpoint)
        mount = p.mountpoint
        if len(mount) > 18:
            mount = "…" + mount[-17:]
        table.add_row(
            mount,
            f"{u.percent:5.1f}%",
            bar(u.percent, width=14),
            bytes_human(u.free),
            p.fstype or "",
        )
        if table.row_count >= 6:
            break

    io = psutil.disk_io_counters()
    footer = Text()
    if io:
        footer.append("IO    ", style="bold dim")
        footer.append(f"R {bytes_human(io.read_bytes)}   W {bytes_human(io.write_bytes)}", style="dim")

    return Panel(Group(table, Text(""), footer), title="[bold yellow]DISK[/]", border_style="yellow", box=box.ROUNDED)


_prev_net = None
_prev_net_t = None


def net_panel() -> Panel:
    global _prev_net, _prev_net_t
    now = time.time()
    io = psutil.net_io_counters()
    sent_r = recv_r = 0.0
    if _prev_net and _prev_net_t:
        dt = max(now - _prev_net_t, 0.001)
        sent_r = (io.bytes_sent - _prev_net.bytes_sent) / dt
        recv_r = (io.bytes_recv - _prev_net.bytes_recv) / dt
    _prev_net = io
    _prev_net_t = now

    t = Table.grid(expand=True)
    t.add_column()
    t.add_column(justify="right")
    t.add_row(
        Text.assemble(("DOWN  ", "bold dim"), (f"{bytes_human(recv_r)}/s", "cyan")),
        Text(f"total {bytes_human(io.bytes_recv)}", style="dim"),
    )
    t.add_row(
        Text.assemble(("UP    ", "bold dim"), (f"{bytes_human(sent_r)}/s", "cyan")),
        Text(f"total {bytes_human(io.bytes_sent)}", style="dim"),
    )

    # Active interfaces with addresses
    ifaces = []
    try:
        addrs = psutil.net_if_addrs()
        stats = psutil.net_if_stats()
        for name, snics in addrs.items():
            st = stats.get(name)
            if st and not st.isup:
                continue
            ipv4 = next((s.address for s in snics if getattr(s, "family", None) and s.family == 2), None)
            if ipv4 and not ipv4.startswith("127."):
                ifaces.append(f"{name} {ipv4}")
    except Exception:
        pass
    extra = Text("  ".join(ifaces[:3]), style="dim")
    return Panel(Group(t, extra), title="[bold blue]NETWORK[/]", border_style="blue", box=box.ROUNDED)


def gpu_panel() -> Panel | None:
    gpus = nvidia_stats()
    if not gpus:
        return None

    parts = []
    for i, g in enumerate(gpus):
        name = g["name"]
        util = g["util"] or 0
        mem_u = g["mem_used"] or 0
        mem_t = g["mem_total"] or 1
        mem_pct = (mem_u / mem_t) * 100 if mem_t else 0

        grid = Table.grid(expand=True)
        grid.add_column()
        grid.add_column(justify="right")
        grid.add_row(Text(name, style="bold"), Text(f"GPU {i}", style="dim"))
        grid.add_row(labeled_bar("UTIL  ", util), Text(""))
        grid.add_row(
            labeled_bar("VRAM  ", mem_pct),
            Text(f"{mem_u:.0f} / {mem_t:.0f} MiB", style="dim"),
        )

        extras = []
        if g["temp"] is not None:
            style = "green" if g["temp"] < 70 else "yellow" if g["temp"] < 85 else "red"
            extras.append(Text.assemble(("TEMP ", "bold dim"), (f"{g['temp']:.0f}°C", style)))
        if g["power"] is not None:
            lim = f"/{g['power_limit']:.0f}W" if g["power_limit"] else "W"
            extras.append(Text.assemble(("PWR  ", "bold dim"), (f"{g['power']:.0f}{lim}", "dim")))
        if g["fan"] is not None:
            extras.append(Text.assemble(("FAN  ", "bold dim"), (f"{g['fan']:.0f}%", "dim")))
        if g["clock"] is not None:
            extras.append(Text.assemble(("CLK  ", "bold dim"), (f"{g['clock']:.0f} MHz", "dim")))
        extra_row = Table.grid(expand=True)
        for _ in extras:
            extra_row.add_column()
        if extras:
            extra_row.add_row(*extras)
            grid.add_row(extra_row, "")
        parts.append(grid)
        if i < len(gpus) - 1:
            parts.append(Text(""))

    return Panel(Group(*parts), title="[bold bright_green]GPU[/]", border_style="bright_green", box=box.ROUNDED)


def proc_panel(n: int = 8) -> Panel:
    procs = []
    for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent", "username"]):
        try:
            info = p.info
            procs.append(info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    procs.sort(key=lambda x: (x.get("cpu_percent") or 0), reverse=True)

    table = Table(box=None, expand=True, pad_edge=False)
    table.add_column("PID", justify="right", style="dim", width=7)
    table.add_column("CPU%", justify="right", width=7)
    table.add_column("MEM%", justify="right", width=7)
    table.add_column("Name", overflow="ellipsis")

    for info in procs[:n]:
        cpu = info.get("cpu_percent") or 0
        mem = info.get("memory_percent") or 0
        name = (info.get("name") or "?")[:40]
        table.add_row(
            str(info.get("pid") or ""),
            Text(f"{cpu:5.1f}", style=color_pct(cpu)),
            Text(f"{mem:5.1f}", style=color_pct(mem)),
            name,
        )
    return Panel(table, title="[bold white]TOP PROCESSES[/]  [dim]by CPU[/]", border_style="white", box=box.ROUNDED)


def footer_panel() -> Panel:
    t = Text.from_markup(
        "[dim]q / Ctrl+C to quit    ·    refresh live    ·    "
        "GPU via nvidia-smi when available    ·    temps via OS sensors[/]"
    )
    t.justify = "center"
    return Panel(t, box=box.SIMPLE, style="dim")


# ---------------------------------------------------------------------------
# Layout
# ---------------------------------------------------------------------------

def build_layout() -> Layout:
    layout = Layout()
    layout.split_column(
        Layout(name="header", size=7),
        Layout(name="main", ratio=3),
        Layout(name="bottom", size=12),
        Layout(name="footer", size=3),
    )
    layout["main"].split_row(
        Layout(name="left", ratio=3),
        Layout(name="right", ratio=2),
    )
    layout["left"].split_column(
        Layout(name="cpu", ratio=3),
        Layout(name="mem", size=8),
    )
    layout["right"].split_column(
        Layout(name="gpu", ratio=2),
        Layout(name="net", size=8),
    )
    layout["bottom"].split_row(
        Layout(name="disk", ratio=3),
        Layout(name="proc", ratio=2),
    )
    return layout


def render(layout: Layout) -> None:
    layout["header"].update(header_panel())
    layout["cpu"].update(cpu_panel())
    layout["mem"].update(mem_panel())
    gpu = gpu_panel()
    layout["gpu"].update(gpu if gpu else Panel(Text("No NVIDIA GPU detected\n(install drivers + nvidia-smi)", style="dim", justify="center"), title="[bold]GPU[/]", border_style="dim", box=box.ROUNDED))
    layout["net"].update(net_panel())
    layout["disk"].update(disk_panel())
    layout["proc"].update(proc_panel())
    layout["footer"].update(footer_panel())


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Simple live hardware monitor")
    parser.add_argument("--interval", type=float, default=1.0, help="Refresh seconds (default 1.0)")
    args = parser.parse_args()

    # Prime cpu_percent so first frame isn't zeros
    psutil.cpu_percent(interval=None, percpu=True)
    for p in psutil.process_iter(["cpu_percent"]):
        try:
            _ = p.cpu_percent(interval=None)
        except Exception:
            pass

    layout = build_layout()
    render(layout)

    try:
        with Live(layout, console=console, refresh_per_second=max(1, int(1 / args.interval)), screen=True):
            while True:
                time.sleep(args.interval)
                render(layout)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
