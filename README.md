# Glance

A simple hardware monitor. Four numbers, color warnings, no HWInfo-style sensor dump.

Black = normal. Yellow = threshold. Red = critical.

## Run it on Windows (no install)

1. On GitHub, click the green **Code** button, then **Download ZIP**.
2. Unzip the folder to your Desktop.
3. Double-click **Glance.html**.

It opens in Edge or Chrome. That is the whole app.

You can also double-click **Start Glance.bat** — it does the same thing.

If Windows warns that a `.bat` file is unrecognized, choose **More info** → **Run anyway**. **Glance.html** does not need that.

## What you are looking at

The big numbers are a realistic desktop demo of an i9-13900K + RTX 4090 so you can learn the layout. A webpage is not allowed to read your real CPU fans. Use **Resting / Everyday / Gaming / Stress** to see black, yellow, and red. Switch °F / °C in the top right — that choice is remembered.

| | Yellow | Red |
|---|---|---|
| Processor | 176°F / 80°C | 194°F / 90°C |
| Graphics | 176°F / 80°C | 190°F / 88°C |
| Memory | 85% full | 93% |
| Storage | 88% full | 95% |

## Optional: full source

The rest of this folder is the live-preview website source. You do not need it to use Glance. Double-click `Glance.html`.
