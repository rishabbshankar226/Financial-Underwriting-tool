"""Assemble ease/REPORT.md from the drafted sections and the generated tables.

Usage: python3 ease/tools/build_report.py "<final run summary>"
"""

import pathlib
import subprocess
import sys

ease = pathlib.Path(__file__).resolve().parents[1]
python = sys.executable


def run(script: str) -> str:
    return subprocess.run([python, str(ease / "tools" / script)], capture_output=True, text=True, check=False).stdout


table = "\n".join(line for line in run("compare.py").splitlines() if line.startswith("|"))
rows = run("report_rows.py").strip()
final = sys.argv[1] if len(sys.argv) > 1 else "{FINAL}"
parts = [
    (ease / "report-head.md").read_text(encoding="utf-8").rstrip(),
    "",
    table,
    (ease / "report-tail.md").read_text(encoding="utf-8").rstrip(),
    "",
    rows.replace("\n### ", "\n### ").strip(),
    (ease / "report-end.md").read_text(encoding="utf-8").replace("{FINAL}", final).rstrip(),
    "",
]
(ease / "REPORT.md").write_text("\n".join(parts), encoding="utf-8")
print("REPORT.md written,", len("\n".join(parts).splitlines()), "lines")
