"""Set the status cell of register rows in ease/REGISTER.md.

Usage: python3 ease/tools/status.py <ID> "<status text>" [<ID> "<status text>" ...]
The status is the row's last cell; it replaces whatever is there.
"""

import pathlib
import sys

path = pathlib.Path(__file__).resolve().parents[1] / "REGISTER.md"
lines = path.read_text(encoding="utf-8").split("\n")
pairs = sys.argv[1:]
if len(pairs) % 2:
    sys.exit("pairs of <ID> <status>")
for row_id, status in zip(pairs[::2], pairs[1::2]):
    for index, line in enumerate(lines):
        if line.startswith(f"| {row_id} |"):
            cells = line.rstrip().rstrip("|").split(" | ")
            cells[-1] = status
            lines[index] = " | ".join(cells) + " |"
            break
    else:
        sys.exit(f"row {row_id} not found")
path.write_text("\n".join(lines), encoding="utf-8")
print("updated", ", ".join(pairs[::2]))
