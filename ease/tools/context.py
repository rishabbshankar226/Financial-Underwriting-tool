"""Print a few lines of context before each spec line, to place a fix precisely.

Usage: python3 ease/tools/context.py <file>:<line> [...]   (paths relative to frontend/tests/)
"""

import pathlib
import sys

root = pathlib.Path(__file__).resolve().parents[2] / "frontend" / "tests"
for spot in sys.argv[1:]:
    name, line = spot.rsplit(":", 1)
    lines = (root / name).read_text(encoding="utf-8").split("\n")
    end = int(line)
    print(f"== {spot}")
    for number in range(max(1, end - 6), end + 1):
        print(f"{number:5} {lines[number - 1][:150]}")
