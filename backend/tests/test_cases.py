"""Durable case guarantees use real files and independently owned connections."""
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
import json
from pathlib import Path
import sqlite3
from threading import Barrier
from uuid import uuid4

import pytest

from app.assessment import assess_commercial
from app.case_contracts import CaseCreate, CaseEdit
from app.cases import CaseStore, CaseStoreError
from app.config import DEFAULT_POLICY


@pytest.fixture
def command():
    payload = json.loads((Path(__file__).resolve().parents[1] / "fixtures/alpine_dated.json").read_text())
    return CaseCreate.model_validate_json(json.dumps({"input": payload, "rationale": "Initial synthetic example"}))


@pytest.fixture
def store(tmp_path):
    return CaseStore(tmp_path / "cases.sqlite3")


def edit(value=4_300_000, path="/years/1/gross_receipts", rationale="Correct supplied amount"):
    return CaseEdit(field_path=path, new_value=value, rationale=rationale)


def counts(path):
    with sqlite3.connect(path) as connection:
        return {table: connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                for table in ("cases", "revisions", "runs", "events", "successful_operations")}


def test_restart_preserves_original_and_edited_snapshots(store, command):
    first = store.create(command, str(uuid4()))
    second = store.edit(first.snapshot.case_id, edit(), first.etag, str(uuid4()))
    restarted = CaseStore(store.path)
    assert restarted.get(first.snapshot.case_id).model_dump() == second.snapshot.model_dump()
    assert restarted.get(first.snapshot.case_id, 1).model_dump() == first.snapshot.model_dump()
    assert first.snapshot.assessment == assess_commercial(command.input).model_dump(mode="json")
    assert second.snapshot.revision == 2 and second.snapshot.parent_revision == 1
    assert second.snapshot.run_id != first.snapshot.run_id
    event = second.snapshot.event
    assert event.before == 4_200_000 and event.after == 4_300_000
    assert event.context.period_start == "2025-01-01"
    assert event.context.period_end == "2025-12-31"
    assert event.context.assessment_as_of == "2026-10-06"
    assert event.actor == "prototype-demo-unverified"
    assert event.rationale == "Correct supplied amount"
    assert counts(store.path) == {"cases": 1, "revisions": 2, "runs": 2, "events": 2, "successful_operations": 2}


def test_lost_response_returns_original_receipt_after_head_and_policy_change(store, command):
    operation = str(uuid4())
    first = store.create(command, operation)
    changed = store.edit(first.snapshot.case_id, edit(), first.etag, str(uuid4()))
    restarted = CaseStore(store.path, policy_provider=lambda: replace(DEFAULT_POLICY, version="later", commercial_min_dscr=4))
    retried = restarted.create(command, operation)
    assert retried.replayed and retried.status == first.status == 201
    assert retried.etag == first.etag
    assert retried.snapshot.model_dump() == first.snapshot.model_dump()
    assert restarted.get(first.snapshot.case_id).revision == changed.snapshot.revision
    edit_operation = str(uuid4())
    original_edit = restarted.edit(first.snapshot.case_id, edit(4_400_000), changed.etag, edit_operation)
    restarted.edit(first.snapshot.case_id, edit(4_500_000), original_edit.etag, str(uuid4()))
    retried_edit = restarted.edit(first.snapshot.case_id, edit(4_400_000), changed.etag, edit_operation)
    assert retried_edit.replayed and retried_edit.etag == original_edit.etag
    assert retried_edit.snapshot.model_dump() == original_edit.snapshot.model_dump()
    assert counts(store.path)["revisions"] == 4


def test_competing_connections_accept_exactly_one_edit(store, command):
    first = store.create(command, str(uuid4()))
    barrier = Barrier(2)
    def compete(value):
        independent = CaseStore(store.path)
        barrier.wait(timeout=5)
        try:
            return independent.edit(first.snapshot.case_id, edit(value), first.etag, str(uuid4()))
        except CaseStoreError as exc:
            return exc
    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(compete, [4_300_000, 4_400_000]))
    accepted = [item for item in results if not isinstance(item, CaseStoreError)]
    rejected = [item for item in results if isinstance(item, CaseStoreError)]
    assert len(accepted) == len(rejected) == 1
    assert rejected[0].status == 412
    assert store.get(first.snapshot.case_id).model_dump() == accepted[0].snapshot.model_dump()
    assert counts(store.path)["revisions"] == 2


@pytest.mark.parametrize("kind", ["create", "edit"])
def test_simultaneous_identical_operations_create_one_revision(store, command, kind):
    first = store.create(command, str(uuid4())) if kind == "edit" else None
    operation, barrier = str(uuid4()), Barrier(2)
    def submit(_):
        independent = CaseStore(store.path)
        barrier.wait(timeout=5)
        if first:
            return independent.edit(first.snapshot.case_id, edit(), first.etag, operation)
        return independent.create(command, operation)
    with ThreadPoolExecutor(max_workers=2) as executor:
        a, b = list(executor.map(submit, range(2)))
    assert a.snapshot.model_dump() == b.snapshot.model_dump() and a.etag == b.etag
    assert sorted([a.replayed, b.replayed]) == [False, True]
    assert counts(store.path)["revisions"] == (2 if first else 1)


@pytest.mark.parametrize("change", ["value", "rationale", "etag", "case", "action"])
def test_reusing_successful_operation_with_changed_command_conflicts(store, command, change):
    first = store.create(command, str(uuid4()))
    operation = str(uuid4())
    accepted = store.edit(first.snapshot.case_id, edit(), first.etag, operation)
    with pytest.raises(CaseStoreError) as error:
        if change == "action":
            store.create(command, operation)
        else:
            store.edit(str(uuid4()) if change == "case" else first.snapshot.case_id,
                       edit(4_400_000 if change == "value" else 4_300_000,
                            rationale="Changed reason" if change == "rationale" else "Correct supplied amount"),
                       accepted.etag if change == "etag" else first.etag, operation)
    assert error.value.status == 409
    assert counts(store.path)["revisions"] == 2


@pytest.mark.parametrize("path,value", [
    ("/years/1/gross_receipts", 4_200_000), ("/years/0/period_start", 2025),
    ("/years/99/gross_receipts", 1), ("/proposed_loan/term_months", 12.5),
    ("/proposed_loan/annual_rate", 1.1), ("/guarantors/0/ownership_percentage", -1),
])
def test_failed_edit_has_no_records_or_reserved_operation(store, command, path, value):
    first = store.create(command, str(uuid4()))
    operation = str(uuid4())
    before = counts(store.path)
    with pytest.raises((CaseStoreError, ValueError)):
        store.edit(first.snapshot.case_id, edit(value, path), first.etag, operation)
    assert counts(store.path) == before
    assert store.get(first.snapshot.case_id).model_dump() == first.snapshot.model_dump()
    assert store.edit(first.snapshot.case_id, edit(), first.etag, operation).snapshot.revision == 2


@pytest.mark.parametrize("table", ["runs", "revisions", "events", "successful_operations", "cases"])
def test_insert_or_head_failure_rolls_back_every_record(store, command, table, monkeypatch):
    first = store.create(command, str(uuid4()))
    original_connect, reached = store._connect, []
    def failing_connect(mode):
        connection = original_connect(mode)
        if mode == "rw":
            def authorize(action, name, column, database, trigger):
                if name == table and action == (sqlite3.SQLITE_UPDATE if table == "cases" else sqlite3.SQLITE_INSERT):
                    reached.append(table)
                    return sqlite3.SQLITE_DENY
                return sqlite3.SQLITE_OK
            connection.set_authorizer(authorize)
        return connection
    monkeypatch.setattr(store, "_connect", failing_connect)
    before = counts(store.path)
    with pytest.raises(CaseStoreError) as error:
        store.edit(first.snapshot.case_id, edit(), first.etag, str(uuid4()))
    assert reached == [table] and error.value.code == "storage_error"
    assert counts(store.path) == before
    assert store.get(first.snapshot.case_id).model_dump() == first.snapshot.model_dump()


def test_busy_commit_rolls_back_and_allows_same_operation_retry(store, command):
    first = store.create(command, str(uuid4()))
    reader = sqlite3.connect(store.path, autocommit=True)
    reader.execute("BEGIN")
    reader.execute("SELECT * FROM cases").fetchall()  # Shared lock permits BEGIN IMMEDIATE, blocks COMMIT.
    operation = str(uuid4())
    before = counts(store.path)
    try:
        with pytest.raises(CaseStoreError) as error:
            CaseStore(store.path, timeout=0.02).edit(first.snapshot.case_id, edit(), first.etag, operation)
        assert error.value.status == 503 and error.value.code == "storage_busy"
    finally:
        reader.execute("ROLLBACK")
        reader.close()
    assert counts(store.path) == before
    assert store.edit(first.snapshot.case_id, edit(), first.etag, operation).snapshot.revision == 2


def test_busy_begin_is_bounded_and_creates_no_reserved_operation(store, command):
    writer = sqlite3.connect(store.path, autocommit=True)
    writer.execute("BEGIN IMMEDIATE")
    operation = str(uuid4())
    try:
        with pytest.raises(CaseStoreError) as error:
            CaseStore(store.path, timeout=0.02).create(command, operation)
        assert error.value.status == 503 and error.value.code == "storage_busy"
    finally:
        writer.execute("ROLLBACK")
        writer.close()
    assert counts(store.path)["revisions"] == 0
    assert store.create(command, operation).snapshot.revision == 1


def test_creation_failure_rolls_back_case_and_all_history(store, command, monkeypatch):
    original_connect, reached = store._connect, []
    def failing_connect(mode):
        connection = original_connect(mode)
        if mode == "rw":
            def authorize(action, name, *args):
                if action == sqlite3.SQLITE_INSERT and name == "successful_operations":
                    reached.append(name)
                    return sqlite3.SQLITE_DENY
                return sqlite3.SQLITE_OK
            connection.set_authorizer(authorize)
        return connection
    monkeypatch.setattr(store, "_connect", failing_connect)
    with pytest.raises(CaseStoreError) as error:
        store.create(command, str(uuid4()))
    assert error.value.code == "storage_error" and reached
    assert all(count == 0 for count in counts(store.path).values())


def test_assessment_failure_leaves_no_records_or_reserved_key(store, command, monkeypatch):
    def overflow(*args):
        raise OverflowError("calculation overflow")
    operation = str(uuid4())
    monkeypatch.setattr(store, "assessment_operation", overflow)
    with pytest.raises(CaseStoreError) as error:
        store.create(command, operation)
    assert error.value.status == 422
    assert all(count == 0 for count in counts(store.path).values())
    monkeypatch.setattr(store, "assessment_operation", assess_commercial)
    assert not store.create(command, operation).replayed


def test_stored_run_metadata_and_blobs_never_change_with_later_policy(store, command):
    first = store.create(command, str(uuid4()))
    with sqlite3.connect(store.path) as connection:
        before = tuple(connection.execute("SELECT * FROM runs WHERE run_id=?", (first.snapshot.run_id,)).fetchone())
    later = CaseStore(store.path, policy_provider=lambda: replace(DEFAULT_POLICY, version="later-policy", commercial_min_dscr=4))
    second = later.edit(first.snapshot.case_id, edit(), first.etag, str(uuid4()))
    assert second.snapshot.assessment["policy_snapshot"]["version"] == "later-policy"
    assert first.snapshot.assessment["policy_snapshot"]["version"] == DEFAULT_POLICY.version
    with sqlite3.connect(store.path) as connection:
        assert tuple(connection.execute("SELECT * FROM runs WHERE run_id=?", (first.snapshot.run_id,)).fetchone()) == before
    recording = first.snapshot.recording
    import platform
    from importlib.metadata import version
    assert recording.python_version == platform.python_version()
    assert recording.sqlite_version == sqlite3.sqlite_version
    assert recording.packages["pydantic"] == version("pydantic")
    assert len(recording.dependency_baseline_sha256) == 64
    assert recording.source_status == "development_unverified" and recording.source_revision is None


def test_replay_uses_retained_policy_without_writing(store, command):
    first = store.create(command, str(uuid4()))
    later = CaseStore(store.path, policy_provider=lambda: replace(DEFAULT_POLICY, version="future", commercial_min_dscr=4))
    before = counts(store.path)
    assert later.replay(first.snapshot.case_id, 1).status == "matched"
    assert counts(store.path) == before


def test_unsupported_calculation_remains_readable_and_replay_unavailable(tmp_path, command):
    def future(request, policy):
        return assess_commercial(request, policy).model_copy(update={"calculation_version": "unknown-calculation-v9"})
    store = CaseStore(tmp_path / "future.sqlite3", assessment_operation=future)
    first = store.create(command, str(uuid4()))
    reopened = CaseStore(store.path)
    assert reopened.get(first.snapshot.case_id).model_dump() == first.snapshot.model_dump()
    assert reopened.replay(first.snapshot.case_id, 1).status == "replay_unavailable"


@pytest.mark.parametrize("kind,expected", [("financial_noise", "matched"), ("raw_comparison", "mismatch"),
                                          ("threshold", "mismatch"), ("outcome", "mismatch"), ("trace_reference", "mismatch")])
def test_replay_tolerance_never_hides_decision_or_structure_changes(store, command, kind, expected):
    first = store.create(command, str(uuid4()))
    def changed(request, policy):
        result = assess_commercial(request, policy)
        if kind == "financial_noise":
            result.current_facts.dscr.raw_value += 1e-13
        elif kind == "raw_comparison":
            result.decision.factors[0].raw_value += 1e-13
        elif kind == "threshold":
            result.decision.factors[0].threshold += 1e-13
        elif kind == "outcome":
            result.decision.outcome = "review"
        else:
            result.calculation_trace[0].operands[0].reference = "/years/0/wrong"
        return result
    store.assessment_operation = changed
    replay = store.replay(first.snapshot.case_id, 1)
    assert replay.status == expected
    assert bool(replay.differences) == (expected == "mismatch")


def test_backup_restore_preserves_reads_replay_and_retry_receipts(store, command, tmp_path):
    operation = str(uuid4())
    first = store.create(command, operation)
    second = store.edit(first.snapshot.case_id, edit(), first.etag, str(uuid4()))
    backup, restored = tmp_path / "backup.sqlite3", tmp_path / "restored.sqlite3"
    assert store.backup(backup)["revisions"] == 2
    assert CaseStore.restore(backup, restored)["cases"] == 1
    reopened = CaseStore(restored)
    assert reopened.get(first.snapshot.case_id).model_dump() == second.snapshot.model_dump()
    assert reopened.get(first.snapshot.case_id, 1).model_dump() == first.snapshot.model_dump()
    assert reopened.replay(first.snapshot.case_id, 1).status == "matched"
    assert reopened.create(command, operation).replayed
    assert reopened.create(command, operation).snapshot.model_dump() == first.snapshot.model_dump()
    store.edit(first.snapshot.case_id, edit(4_400_000), second.etag, str(uuid4()))
    assert reopened.get(first.snapshot.case_id).revision == 2


@pytest.mark.parametrize("kind", ["newer", "nonempty_zero", "missing_trigger", "corrupt"])
def test_unknown_or_corrupt_stores_are_refused_without_changes(tmp_path, kind):
    path = tmp_path / "unknown.sqlite3"
    if kind == "corrupt":
        path.write_bytes(b"this is not a database")
    elif kind == "missing_trigger":
        CaseStore(path)
        with sqlite3.connect(path) as connection:
            connection.execute("DROP TRIGGER runs_immutable_update")
    else:
        with sqlite3.connect(path) as connection:
            connection.execute("CREATE TABLE unrelated(value TEXT)")
            if kind == "newer":
                connection.execute("PRAGMA user_version=99")
    before = path.read_bytes()
    with pytest.raises(CaseStoreError):
        CaseStore(path)
    assert path.read_bytes() == before
    restored = tmp_path / "restored.sqlite3"
    with pytest.raises(CaseStoreError):
        CaseStore.restore(path, restored)
    assert path.read_bytes() == before and not restored.exists()


def test_repeated_initialization_does_not_write_and_fresh_destinations_are_required(store, command, tmp_path):
    store.create(command, str(uuid4()))
    before = store.path.read_bytes()
    CaseStore(store.path)
    assert store.path.read_bytes() == before
    existing = tmp_path / "existing.sqlite3"
    existing.write_bytes(b"preserve me")
    with pytest.raises(CaseStoreError) as error:
        store.backup(existing)
    assert error.value.code == "destination_exists" and existing.read_bytes() == b"preserve me"
    with pytest.raises(CaseStoreError):
        CaseStore.restore(store.path, store.path)
    assert store.path.read_bytes() == before


@pytest.mark.parametrize("table", ["revisions", "runs", "events", "successful_operations", "schema_metadata"])
@pytest.mark.parametrize("verb", ["UPDATE", "DELETE"])
def test_database_rejects_direct_history_mutation(store, command, table, verb):
    store.create(command, str(uuid4()))
    column = {"revisions": "input_hash", "runs": "payload_hash", "events": "event_json",
              "successful_operations": "command_hash", "schema_metadata": "identity"}[table]
    with sqlite3.connect(store.path) as connection:
        with pytest.raises(sqlite3.IntegrityError, match="immutable case history"):
            connection.execute(f"UPDATE {table} SET {column}={column}" if verb == "UPDATE" else f"DELETE FROM {table}")
    assert store.verify()["revisions"] == 1


def test_listing_pages_are_bounded_stable_and_case_scoped(store, command):
    created = [store.create(command, str(uuid4())) for _ in range(3)]
    first = store.list_cases(limit=2)
    assert [row.case_id for row in first.items] == [row.snapshot.case_id for row in reversed(created[1:])]
    extra = store.create(command, str(uuid4()))
    second = store.list_cases(limit=2, after=first.next_cursor)
    assert [row.case_id for row in second.items] == [created[0].snapshot.case_id]
    assert second.next_cursor is None
    assert "assessment" not in first.items[0].model_dump()
    case = created[0]
    a = store.edit(case.snapshot.case_id, edit(), case.etag, str(uuid4()))
    b = store.edit(case.snapshot.case_id, edit(4_400_000), a.etag, str(uuid4()))
    page = store.list_revisions(case.snapshot.case_id, limit=2)
    assert [row.revision for row in page.items] == [3, 2]
    assert [row.revision for row in store.list_revisions(case.snapshot.case_id, after=page.next_cursor).items] == [1]
    with pytest.raises(CaseStoreError) as error:
        store.list_revisions(extra.snapshot.case_id, after=page.next_cursor)
    assert error.value.status == 400


@pytest.mark.parametrize("value", [True, "100", 0, 101, -1, 1.5])
def test_invalid_page_sizes_are_rejected(store, value):
    with pytest.raises(CaseStoreError) as error:
        store.list_cases(limit=value)
    assert error.value.status == 400


def mutate_history_for_corruption_test(path, table, statement, values=()):
    # Simulate an offline corrupted file; put the exact guard back afterward.
    with sqlite3.connect(path) as connection:
        name = table + "_immutable_" + ("delete" if statement.startswith("DELETE") else "update")
        sql = connection.execute("SELECT sql FROM sqlite_master WHERE name=?", (name,)).fetchone()[0]
        connection.execute("DROP TRIGGER " + name)
        connection.execute(statement, values)
        connection.execute(sql)


def test_revision_cursor_outside_sqlite_integer_range_is_400(store, command):
    import base64
    first = store.create(command, str(uuid4()))
    cursor = base64.urlsafe_b64encode(json.dumps({"kind": "revisions", "version": 1,
                                                "case_id": first.snapshot.case_id, "revision": 10**40}).encode()).decode().rstrip("=")
    with pytest.raises(CaseStoreError) as error:
        store.list_revisions(first.snapshot.case_id, after=cursor)
    assert error.value.status == 400


@pytest.mark.parametrize("corruption", ["invalid_json", "nonobject"])
def test_corrupt_operation_is_integrity_error_instead_of_retry_conflict(store, command, corruption):
    from app.cases import _hash
    operation = str(uuid4())
    store.create(command, operation)
    text = "{bad" if corruption == "invalid_json" else "[]"
    if corruption == "invalid_json":
        sql, values = "UPDATE successful_operations SET command_json=?", (text,)
    else:
        sql, values = "UPDATE successful_operations SET command_json=?,command_hash=?", (text, _hash([]))
    mutate_history_for_corruption_test(store.path, "successful_operations", sql, values)
    with pytest.raises(CaseStoreError) as error:
        store.create(command, operation)
    assert error.value.status == 503 and error.value.code == "storage_integrity"


def test_missing_event_is_corrupt_history_and_backup_refuses_it(store, command, tmp_path):
    first = store.create(command, str(uuid4()))
    mutate_history_for_corruption_test(store.path, "events", "DELETE FROM events")
    before = store.path.read_bytes()
    with pytest.raises(CaseStoreError) as error:
        store.get(first.snapshot.case_id)
    assert error.value.status == 503 and error.value.code == "storage_integrity"
    destination = tmp_path / "refused.sqlite3"
    with pytest.raises(CaseStoreError):
        store.backup(destination)
    assert not destination.exists() and store.path.read_bytes() == before


def test_changed_payload_hash_is_detected_and_source_is_preserved(store, command, tmp_path):
    first = store.create(command, str(uuid4()))
    mutate_history_for_corruption_test(store.path, "runs", "UPDATE runs SET payload_hash=?", ("0" * 64,))
    before = store.path.read_bytes()
    with pytest.raises(CaseStoreError) as error:
        store.get(first.snapshot.case_id)
    assert error.value.code == "storage_integrity"
    with pytest.raises(CaseStoreError):
        CaseStore.restore(store.path, tmp_path / "restore.sqlite3")
    assert store.path.read_bytes() == before and not (tmp_path / "restore.sqlite3").exists()


def test_failed_copy_verification_removes_only_new_destination(store, command, tmp_path, monkeypatch):
    store.create(command, str(uuid4()))
    before = store.path.read_bytes()
    original = CaseStore.verify
    destination = tmp_path / "failed.sqlite3"
    def fail_copy_verification(instance):
        if instance.path == destination:
            raise CaseStoreError(503, "storage_integrity", "Injected target verification failure")
        return original(instance)
    monkeypatch.setattr(CaseStore, "verify", fail_copy_verification)
    with pytest.raises(CaseStoreError):
        store.backup(destination)
    assert not destination.exists() and store.path.read_bytes() == before


def test_local_cli_verify_backup_restore_and_failure_exit_status(store, command, tmp_path):
    import subprocess
    import sys
    store.create(command, str(uuid4()))
    root = Path(__file__).resolve().parents[1]
    def run(*args):
        return subprocess.run([sys.executable, "-m", "tools.case_store", *args], cwd=root, capture_output=True, text=True)
    verified = run("verify", "--source", str(store.path))
    assert verified.returncode == 0 and json.loads(verified.stdout)["revisions"] == 1
    backup = tmp_path / "cli-backup.sqlite3"
    assert run("backup", "--source", str(store.path), "--destination", str(backup)).returncode == 0
    restored = tmp_path / "cli-restored.sqlite3"
    assert run("restore", "--source", str(backup), "--destination", str(restored)).returncode == 0
    failed = run("restore", "--source", str(backup), "--destination", str(restored))
    assert failed.returncode == 1 and json.loads(failed.stderr)["error"] == "destination_exists"
    missing = tmp_path / "absent.sqlite3"
    assert run("verify", "--source", str(missing)).returncode == 1
    assert not missing.exists()


@pytest.mark.parametrize("path,value,basis,unit", [
    ("/years/0/interest_expense", 59_000, "annual_financials", "USD dollars"),
    ("/existing_debt/cpltd_annual", 60_000, "current_assumptions", "USD dollars"),
    ("/existing_debt/operating_lease_annual", 25_000, "current_assumptions", "USD dollars"),
    ("/proposed_loan/amount", 550_000, "current_assumptions", "USD dollars"),
    ("/proposed_loan/annual_rate", 0.11, "current_assumptions", "decimal fraction"),
    ("/proposed_loan/term_months", 132, "current_assumptions", "months"),
    ("/guarantors/0/ownership_percentage", 0.95, "current_assumptions", "decimal fraction"),
    ("/guarantors/0/wages", 70_000, "current_assumptions", "USD dollars"),
    ("/working_capital/ar_increase", 150_000, "working_capital", "USD dollars"),
])
def test_edit_context_and_api_units_are_derived_from_base(store, command, path, value, basis, unit):
    first = store.create(command, str(uuid4()))
    second = store.edit(first.snapshot.case_id, edit(value, path), first.etag, str(uuid4()))
    event = second.snapshot.event
    assert event.context.basis == basis and event.context.unit == unit and event.after == value
    if basis == "annual_financials":
        assert event.context.period_start == "2024-01-01"
    elif basis == "working_capital":
        assert event.context.period_start == "2025-01-01"
    else:
        assert event.context.period_start is None
    if path.startswith("/guarantors/"):
        assert event.context.guarantor_index == 0 and event.context.guarantor_name == "Dana Alpine"
    assert store.verify()["revisions"] == 2


def test_independent_initializers_share_one_complete_schema(tmp_path):
    path, barrier = tmp_path / "initialized.sqlite3", Barrier(2)
    def initialize(_):
        barrier.wait(timeout=5)
        return CaseStore(path).verify()
    with ThreadPoolExecutor(max_workers=2) as executor:
        a, b = list(executor.map(initialize, range(2)))
    assert a == b and a["cases"] == a["revisions"] == 0


def test_unexpected_schema_object_with_internal_looking_name_is_refused(store):
    with sqlite3.connect(store.path) as connection:
        connection.execute("CREATE TABLE sqlitex_unexpected(value TEXT)")
    before = store.path.read_bytes()
    with pytest.raises(CaseStoreError) as error:
        CaseStore(store.path)
    assert error.value.code == "storage_schema" and store.path.read_bytes() == before


def test_backup_rejects_existing_dangling_symlink(store, command, tmp_path):
    store.create(command, str(uuid4()))
    destination, target = tmp_path / "existing-link.sqlite3", tmp_path / "missing-target.sqlite3"
    destination.symlink_to(target)
    with pytest.raises(CaseStoreError) as error:
        store.backup(destination)
    assert error.value.code == "destination_exists" and destination.is_symlink() and not target.exists()
