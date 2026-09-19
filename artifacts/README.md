# Simple Hardware Monitor

A live terminal dashboard for CPU, RAM, disk, network, NVIDIA GPU, temperatures, and top processes. Built to be easy to read at a glance.

## Run

```bash
pip install psutil rich
python hw_monitor.py
```

Optional slower/faster refresh:

```bash
python hw_monitor.py --interval 2
```

Quit with `q` is not wired (terminal raw mode varies); use **Ctrl+C**.

## What it shows

| Panel | Data |
|---|---|
| SYSTEM | Hostname, OS, CPU model, uptime, boot time |
| CPU | Overall + per-core bars, frequency, physical/logical counts, package/core temps when the OS exposes them |
| MEMORY | RAM used/avail/cache, swap |
| GPU | NVIDIA via `nvidia-smi`: util, VRAM, temp, power, fan, clocks (hidden-friendly if no NVIDIA) |
| DISK | Mount usage bars + lifetime read/write |
| NETWORK | Live down/up rates, totals, active IPv4 interfaces |
| TOP PROCESSES | Highest CPU processes with PID / CPU% / MEM% |

Colors: green &lt; 60%, yellow 60–85%, red &gt; 85%.

## Notes for Windows

- Works on Windows 10/11 with the same command.
- GPU panel needs NVIDIA drivers (`nvidia-smi` on PATH — it ships with GeForce/Studio drivers).
- CPU temps on Windows often need a driver/library (LibreHardwareMonitor, OpenHardwareMonitor). `psutil` may still show them on some machines.
- Run the terminal maximized or in Windows Terminal for the cleanest layout (24-core CPUs like an i9-13900K use a two-column core grid).

## Notes for Linux

- Temps come from `psutil.sensors_temperatures()` (`/sys/class/thermal` / lm-sensors).
- Install `lm-sensors` and run `sensors-detect` if cores show no temperature.

No extra services, no browser, no install beyond two Python packages.
