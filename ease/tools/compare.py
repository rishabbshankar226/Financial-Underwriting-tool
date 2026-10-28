"""Compare base and after: figures value for value, and a before/after metrics table.

Usage: python3 ease/tools/compare.py   (reads ease/data/{figures,metrics}-{base,after}.json)
Exit code 1 when any figure differs or is missing.
"""

import json
import pathlib
import sys

DATA = pathlib.Path(__file__).resolve().parents[1] / "data"


def load(name: str) -> dict:
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def main() -> int:
    base, after = load("figures-base.json"), load("figures-after.json")
    problems = []
    for host, tasks in base.items():
        for task, figures in tasks.items():
            got = after.get(host, {}).get(task, {})
            for key, value in figures.items():
                if got.get(key) != value:
                    problems.append(f"{host} {task} {key}: base {value!r}, after {got.get(key)!r}")
    total = sum(len(f) for t in base.values() for f in t.values())
    print(f"figures compared: {total}; differences: {len(problems)}")
    for line in problems:
        print("DIFF", line)

    mb, ma = load("metrics-base.json"), load("metrics-after.json")
    print("\n| Host | Task | Steps | Inputs | Wait (ms) | Unexplained terms | First-screen controls | Primary actions |")
    print("| --- | --- | --- | --- | --- | --- | --- | --- |")
    for host, tasks in mb.items():
        for task, b in tasks.items():
            a = ma[host][task]
            cell = lambda k: f"{b[k]} → {a[k]}"
            terms = f"{b['unexplainedTerms']['count']} → {a['unexplainedTerms']['count']}"
            print(f"| {host} | {task} | {cell('steps')} | {cell('inputs')} | {cell('wait')} | {terms} | "
                  f"{cell('controls')} | {cell('primaryActions')} |")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
