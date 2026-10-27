"""N-7 spec updates: a fresh dated case now opens on Overview, so specs that use Spread right after an
evaluation select it explicitly. Each insertion goes before the named line, with that line's indentation.
landing.spec.ts asserts the new default before continuing its keyboard sequence from Spread.
Run once from the worktree root: python3 ease/tools/n7_specs.py
"""

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2] / "frontend" / "tests"
SPREAD = 'await openView(page, "spread");'
INSERT_BEFORE = {
    "analysis.spec.ts": [354, 432],
    "assessment.spec.ts": [12, 59, 178, 356],
    "institutional-quality.spec.ts": [26, 43, 299, 341],
    "institutional-workspace.spec.ts": [79],
    "interface.spec.ts": [12],
    "saved-workspace.spec.ts": [309, 464, 681, 769],
    "trace-accessibility.spec.ts": [12],
}

for name, numbers in INSERT_BEFORE.items():
    path = ROOT / name
    lines = path.read_text(encoding="utf-8").split("\n")
    for number in sorted(numbers, reverse=True):
        target = lines[number - 1]
        indent = re.match(r"\s*", target).group(0)
        lines.insert(number - 1, indent + SPREAD)
    text = "\n".join(lines)
    if not re.search(r"\bopenView\b[^\n]*\n?[^\n]*from \"\./testCredentials\"|import \{[^}]*\bopenView\b", text):
        text, count = re.subn(r'import \{([^}]*)\} from "\./testCredentials";',
                              lambda m: 'import {' + m.group(1).rstrip() + ', openView } from "./testCredentials";',
                              text, count=1)
        if count != 1:
            raise SystemExit(f"{name}: no testCredentials import to extend")
    path.write_text(text, encoding="utf-8")
    print(f"{name}: {len(numbers)} insertion(s)")

landing = ROOT / "landing.spec.ts"
text = landing.read_text(encoding="utf-8")
old = (
    '  const spread = tablist.getByRole("tab", { name: "Spread", exact: true });\n'
    '  await expect(spread).toHaveAttribute("aria-selected", "true");\n'
    '  await expect(spread).toHaveAttribute("tabindex", "0");\n'
    "  await expect(tablist.locator('[role=\"tab\"][tabindex=\"-1\"]')).toHaveCount(workspaceTabLabels.length - 1);\n"
)
new = (
    '  const spread = tablist.getByRole("tab", { name: "Spread", exact: true });\n'
    "  // A fresh dated case opens on Overview (ease N-7); the roving sequence below starts from Spread.\n"
    '  const opened = tablist.getByRole("tab", { name: "Overview", exact: true });\n'
    '  await expect(opened).toHaveAttribute("aria-selected", "true");\n'
    '  await expect(opened).toHaveAttribute("tabindex", "0");\n'
    "  await expect(tablist.locator('[role=\"tab\"][tabindex=\"-1\"]')).toHaveCount(workspaceTabLabels.length - 1);\n"
    '  await openView(page, "spread");\n'
    '  await expect(spread).toHaveAttribute("aria-selected", "true");\n'
    '  await expect(spread).toHaveAttribute("tabindex", "0");\n'
    "  await expect(tablist.locator('[role=\"tab\"][tabindex=\"-1\"]')).toHaveCount(workspaceTabLabels.length - 1);\n"
)
if old not in text:
    raise SystemExit("landing.spec.ts: default-tab block not found")
landing.write_text(text.replace(old, new), encoding="utf-8")
print("landing.spec.ts: default tab is Overview, then Spread")
