"""Version dispatch and copy upgrades use a store produced by the pre-3B app."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
from threading import Barrier
from uuid import uuid4

import pytest

from app.case_contracts import CaseCreate, CaseEdit
from app.cases import CaseStore, CaseStoreError, serialize_snapshot

FIXTURE = Path(__file__).parent / "fixtures/schema_v1"
TABLES = ("cases", "revisions", "runs", "events", "successful_operations")


@pytest.fixture
def v1(tmp_path):
    path = tmp_path / "v1.sqlite3"
    with sqlite3.connect(path) as connection:
        connection.executescript((FIXTURE / "store.sql").read_text())
    return path


def original_rows(path):
    with sqlite3.connect(path) as connection:
        return {table: connection.execute(f"SELECT * FROM {table} ORDER BY rowid").fetchall() for table in TABLES}


def cli(*args):
    return subprocess.run([sys.executable, "-m", "tools.case_store", *args], capture_output=True, text=True)


def test_frozen_v1_schema_and_receipts_are_from_reviewed_source(v1):
    from app.case_schema import SCHEMAS
    evidence = json.loads((FIXTURE / "provenance.json").read_text())
    assert sha256((FIXTURE / "store.sql").read_bytes()).hexdigest() == evidence["sql_sha256"]
    assert SCHEMAS[1][0] == tuple(evidence["schema_statements"])
    assert SCHEMAS[1][1] == evidence["schema_identity"]
    store = CaseStore(v1)
    assert store.verify() == evidence["summary"]
    with sqlite3.connect(v1) as connection:
        operations = connection.execute("SELECT operation_id,etag,receipt_json FROM successful_operations ORDER BY revision").fetchall()
    for expected, (operation, etag, receipt) in zip(evidence["receipts"], operations, strict=True):
        assert operation == expected["operation_id"] and etag == expected["etag"]
        assert sha256(receipt.encode()).hexdigest() == expected["receipt_sha256"]
        snapshot = store.get(evidence["case_id"], json.loads(receipt)["revision"])
        assert serialize_snapshot(snapshot) == receipt
        assert store.replay(snapshot.case_id, snapshot.revision).status == "matched"


def test_new_stores_are_v2_and_parallel_initializers_agree(tmp_path):
    path, barrier = tmp_path / "new.sqlite3", Barrier(2)
    def initialize(_):
        barrier.wait(timeout=5)
        return CaseStore(path).verify()
    with ThreadPoolExecutor(max_workers=2) as executor:
        a, b = executor.map(initialize, range(2))
    assert a == b == {"schema_version": 2, "cases": 0, "revisions": 0, "runs": 0,
                      "events": 0, "successful_operations": 0, "scenario_comparisons": 0,
                      "scenario_comparison_operations": 0}


def test_opening_v1_does_not_upgrade_and_case_writes_still_work(v1):
    before = v1.read_bytes()
    store = CaseStore(v1)
    assert v1.read_bytes() == before
    evidence = json.loads((FIXTURE / "provenance.json").read_text())
    first, head = store.get(evidence["case_id"], 1), store.get(evidence["case_id"])
    with sqlite3.connect(v1) as connection:
        original = connection.execute("SELECT command_json,operation_id FROM successful_operations WHERE revision=1").fetchone()
    create = CaseCreate.model_validate_json(json.dumps(json.loads(original[0])["command"]))
    assert serialize_snapshot(store.create(create, original[1]).snapshot) == serialize_snapshot(first)
    from app.cases import etag_for
    changed = store.edit(head.case_id, CaseEdit(field_path="/years/1/gross_receipts", new_value=4400000,
                                              rationale="Later synthetic correction"), etag_for(head), str(uuid4()))
    assert changed.snapshot.revision == 4
    assert store.verify()["schema_version"] == 1


def test_copy_upgrade_preserves_source_and_original_rows_receipts(v1, tmp_path):
    from app.case_migrations import upgrade_store
    before, rows = v1.read_bytes(), original_rows(v1)
    destination = tmp_path / "v2.sqlite3"
    result = upgrade_store(CaseStore(v1, initialize=False), destination)
    assert result["source_schema_version"] == 1 and result["schema_version"] == 2
    assert result["scenario_comparisons"] == result["scenario_comparison_operations"] == 0
    assert destination.stat().st_mode & 0o777 == 0o600
    assert v1.read_bytes() == before and original_rows(destination) == rows
    upgraded = CaseStore(destination, initialize=False)
    assert upgraded.verify()["revisions"] == 3
    assert CaseStore(v1, initialize=False).verify()["schema_version"] == 1
    with pytest.raises(CaseStoreError, match="new file"):
        upgrade_store(CaseStore(v1), destination)
    assert original_rows(destination) == rows


def test_upgrade_cli_is_verified_copy_only(v1, tmp_path):
    destination = tmp_path / "cli-v2.sqlite3"
    result = cli("upgrade", "--source", str(v1), "--destination", str(destination))
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout)["source_schema_version"] == 1
    assert json.loads(result.stdout)["schema_version"] == 2
    assert cli("verify", "--source", str(destination)).returncode == 0
    result = cli("upgrade", "--source", str(destination), "--destination", str(tmp_path / "v3.sqlite3"))
    assert result.returncode == 1 and json.loads(result.stderr)["error"] == "upgrade_not_applicable"
    assert not (tmp_path / "v3.sqlite3").exists()


@pytest.mark.parametrize("kind", ["existing", "directory", "dangling_symlink", "source", "alias"])
def test_upgrade_refuses_unsafe_destinations_untouched(v1, tmp_path, kind):
    from app.case_migrations import upgrade_store
    target = tmp_path / "target"
    if kind == "existing":
        target.write_bytes(b"preserve existing bytes")
    elif kind == "directory":
        target.mkdir()
    elif kind == "dangling_symlink":
        target.symlink_to(tmp_path / "missing")
    elif kind == "source":
        target = v1
    else:
        target.symlink_to(v1)
    before = v1.read_bytes()
    with pytest.raises(CaseStoreError):
        upgrade_store(CaseStore(v1), target)
    assert v1.read_bytes() == before
    assert target.exists() or target.is_symlink()
    if kind == "existing":
        assert target.read_bytes() == b"preserve existing bytes"


@pytest.mark.parametrize("version", [0, 3, 99])
def test_unknown_version_refused_without_creating_upgrade_target(v1, tmp_path, version):
    with sqlite3.connect(v1) as connection:
        connection.execute(f"PRAGMA user_version={version}")
    before, target = v1.read_bytes(), tmp_path / "refused.sqlite3"
    result = cli("upgrade", "--source", str(v1), "--destination", str(target))
    assert result.returncode == 1
    assert v1.read_bytes() == before and not target.exists()


def test_v1_backup_and_restore_keep_version_and_receipt_bytes(v1, tmp_path):
    backup, restored = tmp_path / "backup.sqlite3", tmp_path / "restored.sqlite3"
    assert CaseStore(v1).backup(backup)["schema_version"] == 1
    assert CaseStore.restore(backup, restored)["schema_version"] == 1
    assert original_rows(restored) == original_rows(v1)


@pytest.mark.parametrize("stage", ["ddl", "metadata", "guard", "version", "commit", "post_verify"])
def test_upgrade_failure_cleans_only_new_copy_and_keeps_source(v1, tmp_path, monkeypatch, stage):
    from app.case_migrations import upgrade_store
    original_connect, original_verify = CaseStore._connect, CaseStore.verify
    before, target, reached = v1.read_bytes(), tmp_path / "failed.sqlite3", []
    def failing_connect(instance, mode):
        connection = original_connect(instance, mode)
        if instance.path == target and mode == "rw":
            def authorize(action, name, arg, *unused):
                deny = {
                    "ddl": action == sqlite3.SQLITE_CREATE_TABLE and name == "scenario_comparisons",
                    "metadata": action == sqlite3.SQLITE_UPDATE and name == "schema_metadata",
                    "guard": action == sqlite3.SQLITE_CREATE_TRIGGER and name == "schema_metadata_immutable_update",
                    "version": action == sqlite3.SQLITE_PRAGMA and name == "user_version" and arg == "2",
                    "commit": action == sqlite3.SQLITE_TRANSACTION and name == "COMMIT",
                }.get(stage, False)
                if deny:
                    reached.append(stage)
                return sqlite3.SQLITE_DENY if deny else sqlite3.SQLITE_OK
            connection.set_authorizer(authorize)
        return connection
    def failing_verify(instance):
        result = original_verify(instance)
        if stage == "post_verify" and instance.path == target and result["schema_version"] == 2:
            reached.append(stage)
            raise CaseStoreError(503, "storage_integrity", "Injected post-commit verification failure")
        return result
    monkeypatch.setattr(CaseStore, "_connect", failing_connect)
    monkeypatch.setattr(CaseStore, "verify", failing_verify)
    with pytest.raises(CaseStoreError):
        upgrade_store(CaseStore(v1), target)
    assert reached and v1.read_bytes() == before and not target.exists()
    assert not list(tmp_path.glob("failed.sqlite3*"))
    monkeypatch.setattr(CaseStore, "_connect", original_connect)
    monkeypatch.setattr(CaseStore, "verify", original_verify)
    assert upgrade_store(CaseStore(v1), target)["schema_version"] == 2


def test_successful_backup_steps_still_enforce_overall_copy_deadline(v1, tmp_path, monkeypatch):
    from app.case_migrations import upgrade_store
    import app.cases as cases
    before, target = v1.read_bytes(), tmp_path / "timeout.sqlite3"
    clock = iter([0.0, 0.0, 31.0])
    monkeypatch.setattr(cases, "monotonic", lambda: next(clock))
    with pytest.raises(CaseStoreError) as error:
        upgrade_store(CaseStore(v1), target)
    assert error.value.code == "copy_timeout"
    assert v1.read_bytes() == before and not target.exists()


def test_copy_deadline_stops_repeated_successful_restarts_from_concurrent_writes(v1, tmp_path, monkeypatch):
    from app.case_migrations import upgrade_store
    import app.cases as cases
    with sqlite3.connect(v1) as connection:
        connection.execute("PRAGMA page_size=512")
        connection.execute("VACUUM")
        assert connection.execute("PRAGMA page_count").fetchone()[0] > 128
    store = CaseStore(v1)
    evidence = json.loads((FIXTURE / "provenance.json").read_text())
    create = CaseCreate.model_validate_json(json.dumps({"input": store.get(evidence["case_id"], 1).normalized_input,
                                                       "rationale": "Concurrent synthetic writer"}))
    original_connect, statuses = CaseStore._connect, []
    class InterleavedBackup:
        def __init__(self, connection):
            self.connection = connection
        def __getattr__(self, name):
            return getattr(self.connection, name)
        def backup(self, target, *, progress, **options):
            def step(status, remaining, total):
                statuses.append(status)
                if status == sqlite3.SQLITE_OK:
                    store.create(create, str(uuid4()))
                progress(status, remaining, total)
            return self.connection.backup(target, progress=step, **options)
    monkeypatch.setattr(CaseStore, "_connect", lambda instance, mode: InterleavedBackup(original_connect(instance, mode)))
    clock = iter([0., 0., 10., 20., 31.])
    monkeypatch.setattr(cases, "monotonic", lambda: next(clock))
    target = tmp_path / "restarting.sqlite3"
    with pytest.raises(CaseStoreError) as error:
        upgrade_store(store, target)
    assert error.value.code == "copy_timeout" and statuses == [sqlite3.SQLITE_OK] * 3
    assert not target.exists() and store.verify()["schema_version"] == 1
    assert store.verify()["cases"] == 4  # Only the explicitly interleaved source writes.


@pytest.mark.parametrize("missing", ["table", "index", "trigger", "metadata"])
def test_exact_v2_registry_refuses_incomplete_or_changed_schema(tmp_path, missing):
    from app.case_schema import SCHEMAS
    path = tmp_path / "changed.sqlite3"
    CaseStore(path)
    with sqlite3.connect(path) as connection:
        if missing == "table":
            connection.execute("DROP TABLE scenario_comparison_operations")
        elif missing == "index":
            connection.execute("DROP INDEX scenario_comparison_listing")
        elif missing == "trigger":
            connection.execute("DROP TRIGGER scenario_comparisons_immutable_update")
        else:
            guard = connection.execute("SELECT sql FROM sqlite_master WHERE name='schema_metadata_immutable_update'").fetchone()[0]
            connection.execute("DROP TRIGGER schema_metadata_immutable_update")
            connection.execute("UPDATE schema_metadata SET identity=?", (SCHEMAS[1][1],))
            connection.execute(guard)
    before = path.read_bytes()
    with pytest.raises(CaseStoreError) as error:
        CaseStore(path)
    assert error.value.code == "storage_schema" and path.read_bytes() == before
