"""Print register rows grouped by final status, for ease/REPORT.md.

Usage: python3 ease/tools/report_rows.py   Reads ease/REGISTER.md; prints markdown tables.
"""

import pathlib
import re

text = (pathlib.Path(__file__).resolve().parents[1] / "REGISTER.md").read_text(encoding="utf-8")
rows = []
for line in text.split("\n"):
    match = re.match(r"\| ([NLDEG]-\d+) \|", line)
    if not match:
        continue
    cells = [cell.strip() for cell in line.strip().strip("|").split(" | ")]
    rows.append({"id": cells[0], "screen": cells[2], "status": cells[-1]})

for title, test in (
    ("Fixed", lambda s: s.startswith("FIXED")),
    ("Queued", lambda s: s.startswith("QUEUED")),
    ("Refuted", lambda s: s.startswith("REFUTED")),
    ("Accepted", lambda s: s.startswith("ACCEPTED")),
    ("Other", lambda s: not re.match(r"(FIXED|QUEUED|REFUTED|ACCEPTED)", s)),
):
    chosen = [row for row in rows if test(row["status"])]
    if not chosen:
        continue
    print(f"\n### {title} ({len(chosen)})\n\n| ID | Screen | Outcome, commit and test |\n| --- | --- | --- |")
    for row in chosen:
        print(f"| {row['id']} | {row['screen']} | {row['status']} |")
