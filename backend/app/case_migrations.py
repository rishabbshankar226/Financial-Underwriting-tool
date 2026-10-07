"""One explicit, copy-only v1 to v2 upgrade; never alters the source store."""
from pathlib import Path

from .case_schema import COMPARISON_STATEMENTS, SCHEMAS
from .cases import CaseStore, CaseStoreError

COPY_TIMEOUT_SECONDS = 30.0
_CASE_TABLES = ("cases", "revisions", "runs", "events", "successful_operations")


def _original_rows(connection):
    return {table: [tuple(row) for row in connection.execute(f"SELECT * FROM {table} ORDER BY rowid")]
            for table in _CASE_TABLES}


def upgrade_store(source: CaseStore, destination):
    """Upgrade a verified fresh copy. Choosing it for application use is separate."""
    if source.verify()["schema_version"] != 1:
        raise CaseStoreError(409, "upgrade_not_applicable", "Upgrade requires schema v1; use backup for a v2 copy")
    destination = Path(destination).expanduser().absolute()
    # Backup owns exclusive creation and cleanup until this call returns successfully.
    source._backup(destination, copy_timeout=COPY_TIMEOUT_SECONDS)
    try:
        copy = CaseStore(destination, initialize=False)
        with copy._db(write=True) as connection:
            if copy._check_schema(connection) != 1:
                raise CaseStoreError(503, "storage_schema", "Copied source is not schema v1")
            original = _original_rows(connection)
            for statement in COMPARISON_STATEMENTS:
                connection.execute(statement)
            trigger = connection.execute("SELECT sql FROM sqlite_master WHERE name='schema_metadata_immutable_update'").fetchone()[0]
            connection.execute("DROP TRIGGER schema_metadata_immutable_update")
            connection.execute("UPDATE schema_metadata SET identity=? WHERE singleton=1", (SCHEMAS[2][1],))
            connection.execute(trigger)
            connection.execute("PRAGMA user_version=2")
            copy._verify(connection)
            if _original_rows(connection) != original:
                raise CaseStoreError(503, "storage_integrity", "Upgrade changed original case rows")
        result = CaseStore(destination, initialize=False).verify()
        return {"source_schema_version": 1, **result}
    except BaseException:
        destination.unlink(missing_ok=True)
        raise
