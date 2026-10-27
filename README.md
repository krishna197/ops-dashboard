# Operations Dashboard

Python reads your Excel and serves a live, shareable dashboard. No internet, no cloud, no AI.

## Run it (2 minutes)
1. Install Python 3.8+ (python.org), tick **"Add to PATH"**.
2. Double-click **start.bat** (the first run installs `openpyxl` automatically).
3. Your browser opens. Send teammates the **Teammates** link shown in the black window.

Update your Excel (`Data.xlsx`) and **save**. Every open dashboard refreshes by itself.

## Folder
| File | Purpose |
|---|---|
| `Data.xlsx` | Your workbook (replace with the real one, keep sheet names) |
| `config.ini` | All settings: title, port, tabs, charts, colours, rules |
| `app.py` | Server + Excel reader |
| `static/` | The web page (HTML / CSS / JS) |
| `make_sample.py` | Makes `Sample_Data.xlsx` with fake numbers (template / demo) |

## Configure (config.ini)
* **Title / port / Excel path**: `[app]` (a shared-drive path works too).
* **Add a tab**: copy a `[group:...]` block, change `title` and `match` (a regex on metric names).
* **Add a chart to a tab**: `chart1 = Title => stacked|grouped => regex, regex => #colour, #colour`.
* **Green/red logic**: `lower_is_better`, `good_score`, `warn_score` in `[rules]`.
* Restart `start.bat` after editing. Run `python app.py --check` to see what was found
  and which metrics are not yet in any tab.

## Demo with fake numbers
`python make_sample.py`, then set `excel_file = Sample_Data.xlsx` in `config.ini`.

## Troubleshooting
* **Teammates can't open the link**: allow Python on **Private networks** in Windows Firewall; same network/VPN needed.
* **Port in use**: change `port` in `config.ini`.
* **pip blocked**: ask IT to install `openpyxl`, or use a PC that can `pip download openpyxl` and copy the wheels.
* **"Can't show data"**: the message tells you which file or sheet is missing.
