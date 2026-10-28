"""Merge the hand-judged unexplained terms into ease/data/metrics-<label>.json.

Usage: python3 ease/tools/terms.py <label>
Rule: distinct acronyms and system words on the task's path screens with no definition within one hover or focus,
listed by hand from the screenshots in ease/shots/<label>/. Edit TERMS when a fix explains a term.
"""

import json
import pathlib
import sys

COMMON = {
    "T2": ["Business DSCR", "Global DSCR", "FCCR", "UCA cash flow", "EBITDA", "K-1 history", "Cushion", "Approval breakeven",
           "(FCCR) suffix on capacity lines", "Principal headroom", "pro forma", "nominal annual rate", "fully amortizing",
           "illustrative score"],
    "T3": ["Annual CPLTD", "AR increase", "AP increase", "used by the backend", "INPUT REVIEW",
           "USD decimal, up to 34 significant figures", "nonblank rationale", "SAVE ACCEPTED INPUT",
           "accepted input / returned stored result", "Latest when fetched", "Run (id)", "Check replay",
           "Configured credential identity", "fact ids (current.debt_service ...)"],
    "T4": ["five-sheet Spreadline template", "values-only .xlsx", "five-second import limit", "processed in page memory",
           "Sheet!Cell references", "UCA cash flow", "K-1 history", "illustrative score"],
    "T5": ["Literal borrower-name search, ASCII case-insensitive", "Archived definition", "Latest when fetched",
           "Case / Run UUIDs", "Recorded ISO timestamp"],
}
TERMS = {
    "standalone": {
        **COMMON,
        "T1": ["operator token", "401 response", "ASCII bearer characters", "API origin", "pending write tracking",
               "exact retry tracking", "Active operator identity unavailable", "Page memory only",
               "Commercial Decision vs Commercial Assessment", "SBA", "legacy assessment request", "Dated assessment",
               "UCA cash flow", "K-1 history", "illustrative score", "prototype-2026-10-03 (policy version)"],
        "T6": ["DTI", "Ability-to-repay", "analyst attestations", "weighted-rule score", "NAICS code", "SOP version",
               "Affiliate treatment", "eligibility_status: incomplete", "configured floor", "Size screen",
               "Recorded workbook SHA-256"],
    },
    "streamlit": {
        **COMMON,
        "T1": ["Testing host connected", "Active operator identity unavailable", "Page memory only, retry tracking",
               "Commercial Decision vs Commercial Assessment", "SBA", "legacy assessment request", "Dated assessment",
               "UCA cash flow", "K-1 history", "illustrative score", "prototype-2026-10-03 (policy version)"],
    },
}
AFTER = {
    "standalone": {
        "T1": ["Operator identity not provided", "retry tracking", "Commercial Decision vs Commercial Assessment", "SBA",
               "legacy assessment request", "Dated assessment", "K-1 history", "prototype-2026-10-03 (policy version)"],
        "T2": ["K-1 history", "Cushion", "Approval breakeven", "(FCCR) suffix on capacity lines", "Principal headroom",
               "pro forma", "nominal annual rate", "fully amortizing"],
        "T3": ["Annual CPLTD", "AR increase", "AP increase", "used by the backend", "Replay this revision (read-only)",
               "Configured credential identity"],
        "T4": ["values-only .xlsx", "Sheet!Cell references", "K-1 history"],
        "T5": ["Literal borrower-name search, ASCII case-insensitive", "Archived definition", "Recorded ISO timestamp"],
        "T6": TERMS["standalone"]["T6"],
    },
    "streamlit": {
        "T1": ["Testing host connected", "Operator identity not provided", "retry tracking",
               "Commercial Decision vs Commercial Assessment", "legacy assessment request", "Dated assessment", "K-1 history",
               "prototype-2026-10-03 (policy version)"],
    },
}
for _task in ("T2", "T3", "T4", "T5"):
    AFTER["streamlit"][_task] = AFTER["standalone"][_task]

RULE = "distinct acronyms and system words on the task's path screens with no definition within one hover or focus"


def main(label: str) -> None:
    path = pathlib.Path(__file__).resolve().parents[1] / "data" / f"metrics-{label}.json"
    metrics = json.loads(path.read_text(encoding="utf-8"))
    for host, tasks in metrics.items():
        for task, entry in tasks.items():
            terms = (AFTER if label == "after" else TERMS)[host][task]
            entry["unexplainedTerms"] = {"count": len(terms), "judged": True, "terms": terms, "rule": RULE}
        print(host, {task: entry["unexplainedTerms"]["count"] for task, entry in tasks.items()})
    path.write_text(json.dumps(metrics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "base")
