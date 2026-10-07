"""Local verify/backup/restore/copy-upgrade. Never overwrites a destination."""
import argparse
import json
import sys

from app.cases import CaseStore, CaseStoreError
from app.case_migrations import upgrade_store


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subcommands = parser.add_subparsers(dest="command", required=True)
    for name in ("verify", "backup", "restore", "upgrade"):
        sub = subcommands.add_parser(name)
        sub.add_argument("--source", required=True)
        if name != "verify":
            sub.add_argument("--destination", required=True, help="Fresh path; existing files are refused")
    args = parser.parse_args()
    try:
        if args.command == "restore":
            result = CaseStore.restore(args.source, args.destination)
        else:
            store = CaseStore(args.source, initialize=False)
            if args.command == "upgrade":
                result = upgrade_store(store, args.destination)
            else:
                result = store.verify() if args.command == "verify" else store.backup(args.destination)
    except CaseStoreError as exc:
        print(json.dumps({"error": exc.code, "message": str(exc)}), file=sys.stderr)
        return 1
    print(json.dumps({"operation": args.command, **result}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
