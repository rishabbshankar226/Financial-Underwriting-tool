"""Before and after medians per task and host: python compare.py [data dir] (default: ./data)."""

import json
import statistics
import sys
from pathlib import Path

root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent / "data")
print("| Host | Task | Screens b/a | Clicks b/a | Keystrokes b/a | Scrolls b/a (runs) | Wait ms b/a |")
print("| --- | --- | --- | --- | --- | --- | --- |")
for host in ["standalone", "streamlit"]:
    for task in ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]:
        row = []
        for label in ["base", "after"]:
            runs = [json.loads(p.read_text()) for p in sorted((root / label / host).glob(f"{task}-run*.json"))]
            if not runs:
                break
            row.append(
                {
                    "screens": len(runs[0]["screens"]),
                    "clicks": statistics.median(r["clicks"] for r in runs),
                    "keys": statistics.median(r["keystrokes"] for r in runs),
                    "scrolls": statistics.median(r["scrolls"] for r in runs),
                    "scroll_runs": [r["scrolls"] for r in runs],
                    "wait": statistics.median(r["waitMs"] for r in runs),
                }
            )
        if len(row) < 2:
            continue
        b, a = row
        print(
            f"| {host} | {task} | {b['screens']} / {a['screens']} | {b['clicks']} / {a['clicks']} "
            f"| {b['keys']} / {a['keys']} | {b['scrolls']} {b['scroll_runs']} / {a['scrolls']} {a['scroll_runs']} "
            f"| {b['wait']:.0f} / {a['wait']:.0f} |"
        )
