"""Median per task per host from data/<label>/<host>/T*-run*.json."""
import json, statistics, sys
from pathlib import Path

root = Path(sys.argv[2] if len(sys.argv) > 2 else Path(__file__).resolve().parent / "out" / "data") / sys.argv[1]
for host_dir in sorted(root.iterdir()):
    print(f"## {host_dir.name}")
    print("| Task | Status | Screens | Clicks | Keystrokes | Scrolls | Wait ms (median) |")
    print("| --- | --- | --- | --- | --- | --- | --- |")
    runs: dict[str, list[dict]] = {}
    for f in sorted(host_dir.glob("T*-run*.json")):
        d = json.loads(f.read_text())
        runs.setdefault(d["task"], []).append(d)
    for task, rs in sorted(runs.items()):
        first = rs[0]
        same = all((r["clicks"], r["keystrokes"], r["scrolls"], len(r["screens"])) == (first["clicks"], first["keystrokes"], first["scrolls"], len(first["screens"])) for r in rs)
        wait = statistics.median(r["waitMs"] for r in rs)
        flag = "" if same else " (counts differ across runs!)"
        print(f"| {task} | {first['status'][:60]} | {len(first['screens'])} | {first['clicks']} | {first['keystrokes']} | {first['scrolls']} | {wait:.0f} ({len(rs)} runs){flag} |")
