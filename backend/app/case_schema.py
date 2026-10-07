"""Schema v1 only. Unknown schemas are refused, never silently upgraded."""
from hashlib import sha256
import json
import re

SCHEMA_VERSION = 1
SCHEMA_STATEMENTS = (
    """CREATE TABLE schema_metadata (
        singleton INTEGER PRIMARY KEY CHECK(singleton=1),
        identity TEXT NOT NULL, serialization_version TEXT NOT NULL
    ) STRICT""",
    """CREATE TABLE cases (
        case_id TEXT PRIMARY KEY, created_at TEXT NOT NULL,
        head_revision INTEGER NOT NULL CHECK(head_revision>=1), head_run_id TEXT NOT NULL,
        borrower_name TEXT NOT NULL, recorded_at TEXT NOT NULL,
        FOREIGN KEY(case_id,head_revision,head_run_id) REFERENCES revisions(case_id,revision,run_id)
            DEFERRABLE INITIALLY DEFERRED
    ) STRICT""",
    """CREATE TABLE revisions (
        case_id TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision>=1),
        parent_revision INTEGER, run_id TEXT NOT NULL UNIQUE,
        recorded_at TEXT NOT NULL, input_json TEXT NOT NULL, input_hash TEXT NOT NULL,
        PRIMARY KEY(case_id,revision), UNIQUE(case_id,revision,run_id),
        CHECK((revision=1 AND parent_revision IS NULL) OR
              (revision>1 AND parent_revision IS NOT NULL AND parent_revision=revision-1)),
        FOREIGN KEY(case_id) REFERENCES cases(case_id),
        FOREIGN KEY(case_id,parent_revision) REFERENCES revisions(case_id,revision),
        FOREIGN KEY(case_id,revision,run_id) REFERENCES runs(case_id,revision,run_id)
            DEFERRABLE INITIALLY DEFERRED
    ) STRICT""",
    """CREATE TABLE runs (
        run_id TEXT PRIMARY KEY, case_id TEXT NOT NULL, revision INTEGER NOT NULL,
        assessment_json TEXT NOT NULL, recording_json TEXT NOT NULL, payload_hash TEXT NOT NULL,
        UNIQUE(case_id,revision,run_id), UNIQUE(case_id,revision),
        FOREIGN KEY(case_id,revision,run_id) REFERENCES revisions(case_id,revision,run_id)
            DEFERRABLE INITIALLY DEFERRED
    ) STRICT""",
    """CREATE TABLE events (
        case_id TEXT NOT NULL, revision INTEGER NOT NULL, run_id TEXT NOT NULL,
        event_json TEXT NOT NULL, PRIMARY KEY(case_id,revision),
        FOREIGN KEY(case_id,revision,run_id) REFERENCES revisions(case_id,revision,run_id)
    ) STRICT""",
    """CREATE TABLE successful_operations (
        operation_id TEXT PRIMARY KEY, command_json TEXT NOT NULL, command_hash TEXT NOT NULL,
        case_id TEXT NOT NULL, revision INTEGER NOT NULL, run_id TEXT NOT NULL,
        status INTEGER NOT NULL CHECK(status=201), etag TEXT NOT NULL, receipt_json TEXT NOT NULL,
        UNIQUE(case_id,revision),
        FOREIGN KEY(case_id,revision,run_id) REFERENCES revisions(case_id,revision,run_id)
    ) STRICT""",
    "CREATE INDEX case_listing ON cases(created_at DESC,case_id DESC)",
)
SCHEMA_STATEMENTS += tuple(
    f"CREATE TRIGGER {table}_immutable_{verb.lower()} BEFORE {verb} ON {table} "
    "BEGIN SELECT RAISE(ABORT, 'immutable case history'); END"
    for table in ("schema_metadata", "revisions", "runs", "events", "successful_operations")
    for verb in ("UPDATE", "DELETE")
)
SCHEMA_IDENTITY = sha256(json.dumps(SCHEMA_STATEMENTS, separators=(",", ":")).encode()).hexdigest()


def schema_objects():
    """Expected DDL also detects missing/changed constraints and immutability triggers."""
    result = {}
    for sql in SCHEMA_STATEMENTS:
        kind, name = re.match(r"CREATE (TABLE|INDEX|TRIGGER) (\w+)", sql).groups()
        result[(kind.lower(), name)] = " ".join(sql.split())
    return result
