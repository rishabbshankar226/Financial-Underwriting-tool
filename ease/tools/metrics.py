"""Aggregate the task specs' per-run files into ease/data/metrics-<label>.json and figures-<label>.json.

Usage: python3 ease/tools/metrics.py <label>

Steps, inputs, controls and primary actions must be identical on every run; wait is the median.
Figures must be identical on every run. Hand-judged unexplained terms already in the metrics file are kept.
"""

import json
import pathlib
import statistics
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "data"
COUNTED = ("steps", "inputs", "controls", "primaryActions")


def main(label: str) -> int:
    runs: dict[tuple[str, str], list[dict]] = {}
    for path in sorted((ROOT / "raw" / label).glob("*.json")):
        record = json.loads(path.read_text(encoding="utf-8"))
        runs.setdefault((record["host"], record["task"]), []).append(record)
    if not runs:
        print(f"no runs under {ROOT / 'raw' / label}")
        return 1

    metrics_path = ROOT / f"metrics-{label}.json"
    previous = json.loads(metrics_path.read_text(encoding="utf-8")) if metrics_path.exists() else {}
    metrics: dict[str, dict] = {}
    figures: dict[str, dict] = {}
    problems: list[str] = []
    for (host, task), records in sorted(runs.items()):
        for key in COUNTED:
            values = {record[key] for record in records}
            if len(values) > 1:
                problems.append(f"{host} {task} {key} differs across runs: {sorted(values)}")
        figure_sets = {json.dumps(record["figures"], sort_keys=True) for record in records}
        if len(figure_sets) > 1:
            problems.append(f"{host} {task} figures differ across runs")
        segments: dict[str, list[int]] = {}
        server: dict[str, list[int]] = {}
        for record in records:
            for segment in record["segments"]:
                segments.setdefault(segment["name"], []).append(segment["ms"])
                if segment.get("serverMs") is not None:
                    server.setdefault(segment["name"], []).append(segment["serverMs"])
        first = records[0]
        entry = {
            "steps": first["steps"],
            "inputs": first["inputs"],
            "wait": round(statistics.median(record["wait"] for record in records)),
            "waitRuns": [record["wait"] for record in records],
            "segments": {
                name: {
                    "medianMs": round(statistics.median(values)),
                    **({"serverMedianMs": round(statistics.median(server[name]))} if name in server else {}),
                }
                for name, values in segments.items()
            },
            "controls": first["controls"],
            "primaryActions": first["primaryActions"],
            "runs": len(records),
            "notes": first["notes"],
        }
        kept = previous.get(host, {}).get(task, {}).get("unexplainedTerms")
        entry["unexplainedTerms"] = kept if kept is not None else {"count": None, "judged": True, "terms": []}
        metrics.setdefault(host, {})[task] = entry
        figures.setdefault(host, {})[task] = first["figures"]

    metrics_path.write_text(json.dumps(metrics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (ROOT / f"figures-{label}.json").write_text(json.dumps(figures, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{'host':<11}{'task':<5}{'steps':>6}{'inputs':>7}{'wait':>7}{'ctrls':>6}{'prim':>5}{'runs':>5}")
    for host, tasks in metrics.items():
        for task, entry in tasks.items():
            print(
                f"{host:<11}{task:<5}{entry['steps']:>6}{entry['inputs']:>7}{entry['wait']:>7}"
                f"{entry['controls']!s:>6}{entry['primaryActions']!s:>5}{entry['runs']:>5}"
            )
    for problem in problems:
        print("PROBLEM:", problem)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "base"))
