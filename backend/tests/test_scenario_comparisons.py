"""Retention crosses CaseStore and preserves the exact reviewed preview."""
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from dataclasses import replace
import json
from pathlib import Path
import sqlite3
import subprocess
import sys
from threading import Barrier
from uuid import uuid4

import pytest

from app.case_contracts import CaseCreate, CaseEdit
from app.cases import CaseStore, CaseStoreError
from app.config import DEFAULT_POLICY
from app.scenario_contracts import ScenarioPreviewCommand
from app.scenarios import preview_commercial_scenarios


@pytest.fixture
def saved(tmp_path):
    store = CaseStore(tmp_path / "cases.sqlite3")
    create = CaseCreate.model_validate_json(json.dumps({
        "input": json.loads((Path(__file__).resolve().parents[1] / "fixtures/alpine_dated.json").read_text()),
        "rationale": "Synthetic retention baseline"}))
    return store, store.create(create, str(uuid4())), create


def command(baseline, **shocks):
    from app.comparison_contracts import ComparisonCreate
    preview_command = ScenarioPreviewCommand.model_validate_json(json.dumps({
        "schema_version": "commercial-scenario-preview-v1", "baseline_run_id": baseline.run_id,
        "scenarios": [{"scenario_key": "downside", "name": "Revenue down 10%", "rationale": "Other assumptions held fixed",
                       "assumptions": {"revenue_change": -.1, "cogs_change": 0, "operating_expense_change": 0,
                                       "proposed_rate_change_bps": 0, **shocks}}]}))
    preview = preview_commercial_scenarios(baseline, preview_command)
    create = ComparisonCreate.model_validate_json(json.dumps({**preview_command.model_dump(mode="json"),
        "schema_version": "commercial-scenario-comparison-create-v1", "expected_preview_fingerprint": preview.fingerprint.value}))
    return create, preview.model_dump(mode="json")


def counts(path):
    with sqlite3.connect(path) as connection:
        return {table: connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0] for table in
                ("cases", "revisions", "runs", "events", "successful_operations", "scenario_comparisons", "scenario_comparison_operations")}


def retain(store, baseline, create, key=None):
    return store.retain_comparison(baseline.case_id, baseline.revision, create, key or str(uuid4()))


def test_retained_preview_is_original_one_batch_without_case_history_changes(saved):
    store, first, _ = saved
    create, preview = command(first.snapshot)
    before = counts(store.path)
    receipt = retain(store, first.snapshot, create)
    assert receipt.status == 201 and not receipt.replayed
    assert receipt.record.persisted is True and receipt.record.preview == preview
    assert receipt.record.actor == "prototype-demo-unverified"
    assert receipt.record.recording == store.recording
    projected = receipt.record.preview["scenarios"][0]["current_facts"]
    assert projected["ordinary_business_income"]["raw_value"] == 3000
    assert projected["ebitda"]["raw_value"] == 210000
    assert projected["uca_cash_flow"]["raw_value"] == -35000
    assert counts(store.path) == {**before, "scenario_comparisons": 1, "scenario_comparison_operations": 1}
    assert store.get(first.snapshot.case_id).model_dump() == first.snapshot.model_dump()
    assert store.get_comparison(first.snapshot.case_id, receipt.record.comparison_id) == receipt.record
    assert store.verify()["scenario_comparisons"] == 1


def test_lost_response_after_restart_new_head_policy_and_unsupported_definitions_never_calculates(saved, monkeypatch):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    accepted = retain(store, first.snapshot, create, key)
    store.edit(first.snapshot.case_id, CaseEdit(field_path="/years/1/gross_receipts", new_value=4300000,
                                              rationale="Later supplied correction"), first.etag, str(uuid4()))
    def unavailable(*args, **kwargs):
        raise AssertionError("Original response must not calculate")
    reopened = CaseStore(store.path, assessment_operation=unavailable,
                         policy_provider=lambda: replace(DEFAULT_POLICY, version="later", commercial_min_dscr=4))
    import app.scenarios as scenarios
    monkeypatch.setattr(scenarios, "CALCULATION_VERSION", "unsupported-current-definition")
    retried = retain(reopened, first.snapshot, create, key)
    assert retried.replayed and retried.record == accepted.record and retried.etag == accepted.etag
    assert reopened.get_comparison(first.snapshot.case_id, accepted.record.comparison_id) == accepted.record
    assert reopened.verify()["scenario_comparisons"] == 1


@pytest.mark.parametrize("change", ["case", "revision", "run", "shock", "name", "rationale", "fingerprint", "action"])
def test_successful_global_key_conflicts_with_changed_command(saved, change):
    from app.comparison_contracts import ComparisonCreate
    store, first, case_create = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    retain(store, first.snapshot, create, key)
    changed = create.model_dump(mode="json")
    if change in ("name", "rationale"):
        changed["scenarios"][0][change] = "Changed review text"
    elif change == "shock":
        changed["scenarios"][0]["assumptions"]["cogs_change"] = .1
    elif change == "run":
        changed["baseline_run_id"] = str(uuid4())
    elif change == "fingerprint":
        changed["expected_preview_fingerprint"] = "0" * 64
    changed = ComparisonCreate.model_validate_json(json.dumps(changed))
    with pytest.raises(CaseStoreError) as error:
        if change == "action":
            store.create(case_create, key)
        else:
            store.retain_comparison(str(uuid4()) if change == "case" else first.snapshot.case_id,
                                    2 if change == "revision" else 1, changed, key)
    assert error.value.code == "operation_conflict" and error.value.status == 409
    assert counts(store.path)["scenario_comparisons"] == 1


def test_case_key_conflicts_before_preview_and_failed_fingerprint_reserves_nothing(saved):
    store, first, case_create = saved
    create, _ = command(first.snapshot)
    case_key = str(uuid4())
    store.create(case_create, case_key)
    with pytest.raises(CaseStoreError) as error:
        retain(store, first.snapshot, create, case_key)
    assert error.value.code == "operation_conflict"
    key = str(uuid4())
    with pytest.raises(CaseStoreError) as error:
        retain(store, first.snapshot, create.model_copy(update={"expected_preview_fingerprint": "0" * 64}), key)
    assert error.value.code == "preview_changed"
    assert counts(store.path)["scenario_comparisons"] == counts(store.path)["scenario_comparison_operations"] == 0
    assert not retain(store, first.snapshot, create, key).replayed


def test_historical_baseline_remains_eligible_and_new_keys_create_new_comparisons(saved):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    store.edit(first.snapshot.case_id, CaseEdit(field_path="/years/1/gross_receipts", new_value=4300000,
                                              rationale="Later supplied correction"), first.etag, str(uuid4()))
    a, b = retain(store, first.snapshot, create), retain(store, first.snapshot, create)
    assert a.record.comparison_id != b.record.comparison_id
    assert a.record.baseline_revision == b.record.baseline_revision == 1
    assert a.record.preview == b.record.preview
    assert store.get(first.snapshot.case_id).revision == 2


@pytest.mark.parametrize("changed", [False, True])
def test_competing_connections_have_one_acceptance_and_exact_retry_or_conflict(saved, changed):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    other, _ = command(first.snapshot, cogs_change=.1)
    barrier, key = Barrier(2), str(uuid4())
    def submit(number):
        independent = CaseStore(store.path, initialize=False)
        barrier.wait(timeout=5)
        try:
            return retain(independent, first.snapshot, other if changed and number else create, key)
        except CaseStoreError as exc:
            return exc
    with ThreadPoolExecutor(max_workers=2) as executor:
        a, b = executor.map(submit, range(2))
    if changed:
        errors = [item for item in (a, b) if isinstance(item, CaseStoreError)]
        assert len(errors) == 1 and errors[0].code == "operation_conflict"
    else:
        assert a.record == b.record and sorted([a.replayed, b.replayed]) == [False, True]
    assert counts(store.path)["scenario_comparisons"] == counts(store.path)["scenario_comparison_operations"] == 1


@pytest.mark.parametrize("table", ["scenario_comparisons", "scenario_comparison_operations"])
def test_insert_failure_rolls_back_batch_and_key_then_allows_retry(saved, table, monkeypatch):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    before, key, original = counts(store.path), str(uuid4()), store._connect
    def failing(mode):
        connection = original(mode)
        if mode == "rw":
            connection.set_authorizer(lambda action, name, *args:
                                     sqlite3.SQLITE_DENY if action == sqlite3.SQLITE_INSERT and name == table else sqlite3.SQLITE_OK)
        return connection
    monkeypatch.setattr(store, "_connect", failing)
    with pytest.raises(CaseStoreError) as error:
        retain(store, first.snapshot, create, key)
    assert error.value.code == "storage_error" and counts(store.path) == before
    monkeypatch.setattr(store, "_connect", original)
    assert not retain(store, first.snapshot, create, key).replayed


def test_busy_commit_rolls_back_comparison_and_key(saved):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    reader = sqlite3.connect(store.path, autocommit=True)
    reader.execute("BEGIN")
    reader.execute("SELECT * FROM cases").fetchall()
    before, key = counts(store.path), str(uuid4())
    try:
        with pytest.raises(CaseStoreError) as error:
            retain(CaseStore(store.path, timeout=.02), first.snapshot, create, key)
        assert error.value.code == "storage_busy"
    finally:
        reader.execute("ROLLBACK")
        reader.close()
    assert counts(store.path) == before
    assert not retain(store, first.snapshot, create, key).replayed


def test_v1_comparison_operations_require_explicit_upgrade(tmp_path):
    fixture = Path(__file__).parent / "fixtures/schema_v1"
    path = tmp_path / "v1.sqlite3"
    with sqlite3.connect(path) as connection:
        connection.executescript((fixture / "store.sql").read_text())
    store = CaseStore(path)
    case_id = json.loads((fixture / "provenance.json").read_text())["case_id"]
    baseline = store.get(case_id, 1)
    create, _ = command(baseline)
    before = path.read_bytes()
    with pytest.raises(CaseStoreError) as error:
        retain(store, baseline, create)
    assert error.value.status == 409 and error.value.code == "storage_upgrade_required"
    assert store.list_comparisons(case_id).items == []
    with pytest.raises(CaseStoreError) as error:
        store.get_comparison(case_id, str(uuid4()))
    assert error.value.status == 404 and path.read_bytes() == before


def test_uuid_forms_normalize_before_retry_hashing(saved):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    original = retain(store, first.snapshot, create, key)
    retry = store.retain_comparison(first.snapshot.case_id.upper(), 1,
                                    create.model_copy(update={"baseline_run_id": first.snapshot.run_id.upper()}), key.upper())
    assert retry.replayed and retry.record == original.record and retry.etag == original.etag


@pytest.mark.parametrize("change", ["wrong_run", "changed_name", "invalid_later"])
def test_new_invalid_batch_never_reserves_key(saved, change):
    from app.comparison_contracts import ComparisonCreate
    store, first, _ = saved
    create, _ = command(first.snapshot)
    data = create.model_dump(mode="json")
    if change == "wrong_run":
        data["baseline_run_id"] = str(uuid4())
    elif change == "changed_name":
        data["scenarios"][0]["name"] = "Changed reviewed name"
    else:
        data["scenarios"].append({**deepcopy(data["scenarios"][0]), "scenario_key": "overflow"})
        data["scenarios"][1]["assumptions"]["revenue_change"] = 1e308
    bad = ComparisonCreate.model_validate_json(json.dumps(data))
    key, before = str(uuid4()), counts(store.path)
    with pytest.raises(CaseStoreError) as error:
        retain(store, first.snapshot, bad, key)
    assert error.value.code == {"wrong_run": "baseline_run_mismatch", "changed_name": "preview_changed", "invalid_later": "scenario_invalid"}[change]
    assert counts(store.path) == before
    assert not retain(store, first.snapshot, create, key).replayed


@pytest.mark.parametrize("multibyte", [False, True])
def test_record_byte_cap_accepts_exact_limit_rejects_one_byte_over_and_keeps_key_free(saved, multibyte):
    from app.case_schema import MAX_COMPARISON_BYTES
    from app.comparison_storage import serialize_comparison
    from app.cases import _canonical
    store, first, _ = saved
    create, _ = command(first.snapshot)
    reference = retain(store, first.snapshot, create)
    metadata = store.recording.model_copy(update={"packages": {**store.recording.packages, "synthetic_padding": ""}})
    overhead = len(_canonical(metadata.model_dump(mode="json")).encode()) - len(_canonical(store.recording.model_dump(mode="json")).encode())
    padding_bytes = MAX_COMPARISON_BYTES - len(serialize_comparison(reference.record).encode()) - overhead
    padding = "€" * (padding_bytes // 3) + "x" * (padding_bytes % 3) if multibyte else "x" * padding_bytes
    metadata.packages["synthetic_padding"] = padding + "x"
    store.recording = metadata
    before, key = counts(store.path), str(uuid4())
    with pytest.raises(CaseStoreError) as error:
        retain(store, first.snapshot, create, key)
    assert error.value.code == "comparison_payload_limit" and counts(store.path) == before
    metadata.packages["synthetic_padding"] = padding
    accepted = retain(store, first.snapshot, create, key)
    assert len(serialize_comparison(accepted.record).encode()) == MAX_COMPARISON_BYTES
    assert not accepted.replayed
    assert store.get_comparison(first.snapshot.case_id, accepted.record.comparison_id) == accepted.record


@pytest.mark.parametrize("table", ["scenario_comparisons", "scenario_comparison_operations"])
@pytest.mark.parametrize("verb", ["UPDATE", "DELETE"])
def test_direct_history_mutation_is_rejected(saved, table, verb):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    retain(store, first.snapshot, create)
    with sqlite3.connect(store.path) as connection:
        with pytest.raises(sqlite3.IntegrityError, match="immutable scenario comparison"):
            connection.execute(f"UPDATE {table} SET comparison_id=comparison_id" if verb == "UPDATE" else f"DELETE FROM {table}")
    assert store.verify()["scenario_comparisons"] == 1


@pytest.mark.parametrize("direction", ["case_to_comparison", "comparison_to_case"])
def test_sql_guards_enforce_global_operation_namespace(saved, direction):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    retain(store, first.snapshot, create)
    with sqlite3.connect(store.path) as connection:
        source, target = ("successful_operations", "scenario_comparison_operations") if direction == "case_to_comparison" else ("scenario_comparison_operations", "successful_operations")
        key = connection.execute(f"SELECT operation_id FROM {source}").fetchone()[0]
        row = list(connection.execute(f"SELECT * FROM {target}").fetchone())
        row[0] = key
        with pytest.raises(sqlite3.IntegrityError, match="operation ID already used"):
            connection.execute(f"INSERT INTO {target} VALUES({','.join('?' for _ in row)})", row)


@pytest.mark.parametrize("field,value", [("case_id", str(uuid4())), ("baseline_revision", 2), ("baseline_run_id", str(uuid4()))])
def test_sql_foreign_key_rejects_wrong_baseline_tuple(saved, field, value):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    retain(store, first.snapshot, create)
    with sqlite3.connect(store.path) as connection:
        connection.execute("PRAGMA foreign_keys=ON")
        row = dict(zip([col[1] for col in connection.execute("PRAGMA table_info(scenario_comparisons)")],
                       connection.execute("SELECT * FROM scenario_comparisons").fetchone()))
        row.update(comparison_id=str(uuid4()), **{field: value})
        with pytest.raises(sqlite3.IntegrityError, match="FOREIGN KEY"):
            connection.execute("INSERT INTO scenario_comparisons VALUES(?,?,?,?,?,?,?,?)", tuple(row.values()))


def test_pagination_is_bounded_with_tied_times_and_case_scoped_cursor(saved, monkeypatch):
    from datetime import datetime, timezone
    import app.comparison_storage as storage
    store, first, case_create = saved
    create, _ = command(first.snapshot)
    class FixedClock:
        @staticmethod
        def now(*unused):
            return datetime(2026, 10, 7, 10, 0, 0, tzinfo=timezone.utc)
    monkeypatch.setattr(storage, "datetime", FixedClock)
    accepted = [retain(store, first.snapshot, create) for _ in range(4)]
    expected = sorted((r.record.comparison_id for r in accepted), reverse=True)
    page = store.list_comparisons(first.snapshot.case_id, limit=2)
    assert [item.comparison_id for item in page.items] == expected[:2]
    assert page.items[0].scenario_count == 1
    assert page.items[0].scenarios[0].name == create.scenarios[0].name
    assert "preview" not in page.items[0].model_dump() and "recording" not in page.items[0].model_dump()
    page2 = store.list_comparisons(first.snapshot.case_id, limit=2, after=page.next_cursor)
    assert [item.comparison_id for item in page2.items] == expected[2:]
    assert page2.next_cursor is None
    other = store.create(case_create, str(uuid4())).snapshot
    with pytest.raises(CaseStoreError) as error:
        store.list_comparisons(other.case_id, after=page.next_cursor)
    assert error.value.code == "invalid_cursor"
    with pytest.raises(CaseStoreError) as error:
        store.get_comparison(other.case_id, accepted[0].record.comparison_id)
    assert error.value.status == 404


@pytest.mark.parametrize("value", [True, "25", 0, 101, -1, 1.5])
def test_comparison_page_limit_rejects_invalid_values(saved, value):
    store, first, _ = saved
    with pytest.raises(CaseStoreError) as error:
        store.list_comparisons(first.snapshot.case_id, limit=value)
    assert error.value.code == "invalid_limit"


@pytest.mark.parametrize("cursor", ["", "!", "A" * 513, "e30", "bm90LWpzb24"])
def test_comparison_cursor_rejects_invalid_values(saved, cursor):
    store, first, _ = saved
    with pytest.raises(CaseStoreError) as error:
        store.list_comparisons(first.snapshot.case_id, after=cursor)
    assert error.value.code == "invalid_cursor"


def test_v2_backup_restore_preserves_both_kinds_of_original_receipts(saved, tmp_path):
    store, first, case_create = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    accepted = retain(store, first.snapshot, create, key)
    with sqlite3.connect(store.path) as connection:
        case_key = connection.execute("SELECT operation_id FROM successful_operations").fetchone()[0]
    backup, restored = tmp_path / "backup.sqlite3", tmp_path / "restored.sqlite3"
    assert store.backup(backup)["scenario_comparisons"] == 1
    assert CaseStore.restore(backup, restored)["schema_version"] == 2
    reopened = CaseStore(restored, assessment_operation=lambda *args: (_ for _ in ()).throw(AssertionError("must not calculate")))
    assert retain(reopened, first.snapshot, create, key).record == accepted.record
    assert reopened.create(case_create, case_key).snapshot == first.snapshot
    assert reopened.get_comparison(first.snapshot.case_id, accepted.record.comparison_id) == accepted.record


def mutate(path, table, statement, parameters=()):
    """Simulate offline corruption, then restore the exact immutability guard."""
    with sqlite3.connect(path) as connection:
        guard = table + "_immutable_" + ("delete" if statement.startswith("DELETE") else "update")
        sql = connection.execute("SELECT sql FROM sqlite_master WHERE name=?", (guard,)).fetchone()[0]
        connection.execute("DROP TRIGGER " + guard)
        connection.execute(statement, parameters)
        connection.execute(sql)


def content_hash(payload):
    from hashlib import sha256
    return sha256(json.dumps({"serialization_version": "scenario-comparison-json-v1", "payload": payload},
                             sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode()).hexdigest()


@pytest.mark.parametrize("corruption", ["record_json", "record_hash", "canonical", "storage_version", "baseline", "fingerprint", "assumption_type", "baseline_type",
                                       "command_json", "command_hash", "command_link", "etag", "missing_operation"])
def test_read_retry_verify_and_backup_detect_broken_content_without_repair(saved, tmp_path, corruption):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    accepted = retain(store, first.snapshot, create, key)
    raw = accepted.record.model_dump(mode="json")
    from app.cases import _canonical
    if corruption.startswith("command"):
        with sqlite3.connect(store.path) as connection:
            op = connection.execute("SELECT command_json FROM scenario_comparison_operations").fetchone()[0]
        data = json.loads(op)
        if corruption == "command_link":
            data["command"]["scenarios"][0]["rationale"] = "Changed offline explanation"
        mutate(store.path, "scenario_comparison_operations", "UPDATE scenario_comparison_operations SET command_json=?,command_hash=?",
               ("{bad" if corruption == "command_json" else _canonical(data),
                "0" * 64 if corruption == "command_hash" else content_hash(data)))
    elif corruption == "etag":
        mutate(store.path, "scenario_comparison_operations", "UPDATE scenario_comparison_operations SET etag=?", ('"wrong"',))
    elif corruption == "missing_operation":
        mutate(store.path, "scenario_comparison_operations", "DELETE FROM scenario_comparison_operations")
    else:
        if corruption == "storage_version":
            raw["storage_serialization_version"] = "unknown-json-v9"
        elif corruption == "baseline":
            raw["preview"]["baseline"]["assessment"]["policy_snapshot"]["commercial_min_dscr"] = 99
        elif corruption == "fingerprint":
            raw["preview"]["fingerprint"]["value"] = "0" * 64
        elif corruption == "assumption_type":
            raw["preview"]["scenarios"][0]["assumptions"]["cogs_change"] = False
        elif corruption == "baseline_type":
            raw["preview"]["baseline"]["assessment"]["normalized_input"]["years"][0]["section_179"] = False
        if corruption in ("storage_version", "baseline", "fingerprint", "assumption_type", "baseline_type"):
            raw["payload_hash"] = content_hash({k: v for k, v in raw.items() if k != "payload_hash"})
            etag = f'"scenario-comparison-json-v1:{raw["case_id"]}:{raw["comparison_id"]}:{raw["payload_hash"]}"'
            mutate(store.path, "scenario_comparison_operations", "UPDATE scenario_comparison_operations SET etag=?", (etag,))
        text = "{bad" if corruption == "record_json" else _canonical(raw)
        if corruption == "canonical":
            text += " "
        mutate(store.path, "scenario_comparisons", "UPDATE scenario_comparisons SET record_json=?,payload_hash=?",
               (text, "0" * 64 if corruption == "record_hash" else raw["payload_hash"]))
    before = store.path.read_bytes()
    for operation in (lambda: store.get_comparison(first.snapshot.case_id, accepted.record.comparison_id),
                      lambda: retain(store, first.snapshot, create, key), store.verify,
                      lambda: store.backup(tmp_path / "refused.sqlite3")):
        with pytest.raises(CaseStoreError) as error:
            operation()
        assert error.value.status == 503 and error.value.code == "storage_integrity"
    assert store.path.read_bytes() == before and not (tmp_path / "refused.sqlite3").exists()


def test_unsupported_retained_scenario_definition_remains_readable_and_retryable(saved):
    """A consistent future-definition record uses the same known storage envelope."""
    from hashlib import sha256
    from app.comparison_contracts import ComparisonCreate
    from app.cases import _canonical
    store, first, _ = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    accepted = retain(store, first.snapshot, create, key)
    raw = accepted.record.model_dump(mode="json")
    preview = raw["preview"]
    preview["scenario_definition_version"] = "unsupported-scenario-definition-v9"
    preview["calculation_version"] = "unsupported-projection-v9"
    baseline = preview["baseline"]
    content = {"baseline_identity": {k: baseline[k] for k in ("case_id", "revision", "run_id")},
               "payload_hash": baseline["payload_hash"], "normalized_command": create.preview_command().model_dump(mode="json"),
               "policy_snapshot": preview["policy_snapshot"], "versions": {
                   "schema": preview["schema_version"], "calculation": preview["calculation_version"],
                   "definition": preview["scenario_definition_version"], "serialization": preview["serialization_version"]}}
    fingerprint = sha256(_canonical(content).encode()).hexdigest()
    preview["fingerprint"]["value"] = fingerprint
    raw["payload_hash"] = content_hash({k: v for k, v in raw.items() if k != "payload_hash"})
    etag = f'"scenario-comparison-json-v1:{first.snapshot.case_id}:{raw["comparison_id"]}:{raw["payload_hash"]}"'
    create = ComparisonCreate.model_validate_json(_canonical({**create.model_dump(mode="json"), "expected_preview_fingerprint": fingerprint}))
    data = dict(action="retain_comparison", case_id=first.snapshot.case_id, revision=1, command=create.model_dump(mode="json"))
    mutate(store.path, "scenario_comparisons", "UPDATE scenario_comparisons SET record_json=?,payload_hash=?,preview_fingerprint=?",
           (_canonical(raw), raw["payload_hash"], fingerprint))
    mutate(store.path, "scenario_comparison_operations", "UPDATE scenario_comparison_operations SET command_json=?,command_hash=?,etag=?",
           (_canonical(data), content_hash(data), etag))
    def unavailable(*args):
        raise AssertionError("Must not recalculate an original comparison")
    reopened = CaseStore(store.path, assessment_operation=unavailable)
    assert reopened.get_comparison(first.snapshot.case_id, raw["comparison_id"]).model_dump(mode="json") == raw
    assert retain(reopened, first.snapshot, create, key).record.model_dump(mode="json") == raw
    assert reopened.verify()["scenario_comparisons"] == 1


def test_global_key_conflicts_across_case_edits_in_both_directions(saved):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    retain(store, first.snapshot, create, key)
    edit = CaseEdit(field_path="/years/1/gross_receipts", new_value=4300000, rationale="Synthetic correction")
    with pytest.raises(CaseStoreError) as error:
        store.edit(first.snapshot.case_id, edit, first.etag, key)
    assert error.value.code == "operation_conflict"
    edit_key = str(uuid4())
    store.edit(first.snapshot.case_id, edit, first.etag, edit_key)
    with pytest.raises(CaseStoreError) as error:
        retain(store, first.snapshot, create, edit_key)
    assert error.value.code == "operation_conflict"


def test_case_and_comparison_writers_compete_for_one_global_key(saved):
    store, first, case_create = saved
    create, _ = command(first.snapshot)
    key, barrier = str(uuid4()), Barrier(2)
    def write(kind):
        independent = CaseStore(store.path, initialize=False)
        barrier.wait(timeout=5)
        try:
            return independent.create(case_create, key) if kind == "case" else retain(independent, first.snapshot, create, key)
        except CaseStoreError as exc:
            return exc
    with ThreadPoolExecutor(max_workers=2) as executor:
        result = list(executor.map(write, ["case", "comparison"]))
    errors = [item for item in result if isinstance(item, CaseStoreError)]
    assert len(errors) == 1 and errors[0].code == "operation_conflict"
    assert counts(store.path)["successful_operations"] + counts(store.path)["scenario_comparison_operations"] == 2
    store.verify()


def test_database_byte_limit_rejects_direct_oversized_record(saved):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    retain(store, first.snapshot, create)
    with sqlite3.connect(store.path) as connection:
        row = list(connection.execute("SELECT * FROM scenario_comparisons").fetchone())
        row[0], row[-1] = str(uuid4()), "€" * 5_592_406  # 16,777,218 bytes.
        with pytest.raises(sqlite3.IntegrityError, match="CHECK"):
            connection.execute("INSERT INTO scenario_comparisons VALUES(?,?,?,?,?,?,?,?)", row)
    assert store.verify()["scenario_comparisons"] == 1


def test_fresh_process_recovers_original_without_financial_calculation(saved):
    from app.comparison_storage import serialize_comparison
    store, first, _ = saved
    create, _ = command(first.snapshot)
    key = str(uuid4())
    accepted = retain(store, first.snapshot, create, key)
    script = """
import json, sys
from app.cases import CaseStore
from app.comparison_contracts import ComparisonCreate
from app.comparison_storage import serialize_comparison
def unavailable(*args):
    raise AssertionError('Original response cannot calculate')
store = CaseStore(sys.argv[1], initialize=False, assessment_operation=unavailable)
command = ComparisonCreate.model_validate_json(sys.argv[3])
receipt = store.retain_comparison(sys.argv[2], 1, command, sys.argv[4])
assert receipt.replayed
assert store.get_comparison(sys.argv[2], receipt.record.comparison_id) == receipt.record
print(json.dumps({'body': serialize_comparison(receipt.record), 'etag': receipt.etag}))
"""
    result = subprocess.run([sys.executable, "-c", script, str(store.path), first.snapshot.case_id,
                             create.model_dump_json(), key], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout) == {"body": serialize_comparison(accepted.record), "etag": accepted.etag}


def test_new_insertions_do_not_shift_older_comparison_pages(saved):
    store, first, _ = saved
    create, _ = command(first.snapshot)
    original = [retain(store, first.snapshot, create) for _ in range(3)]
    page = store.list_comparisons(first.snapshot.case_id, limit=2)
    retain(store, first.snapshot, create)
    older = store.list_comparisons(first.snapshot.case_id, limit=2, after=page.next_cursor)
    assert [item.comparison_id for item in older.items] == [original[0].record.comparison_id]
    assert older.next_cursor is None


def test_ten_scenarios_retain_one_batch_and_replay_baseline_once(saved):
    from app.comparison_contracts import ComparisonCreate
    from app.assessment import assess_commercial
    store, first, _ = saved
    create, _ = command(first.snapshot)
    preview_command = create.preview_command().model_dump(mode="json")
    preview_command["scenarios"] = [{**preview_command["scenarios"][0], "scenario_key": f"scenario-{i}"} for i in range(10)]
    expected = preview_commercial_scenarios(first.snapshot, ScenarioPreviewCommand.model_validate_json(json.dumps(preview_command)))
    create = ComparisonCreate.model_validate_json(json.dumps({**preview_command, "schema_version": "commercial-scenario-comparison-create-v1",
                                                             "expected_preview_fingerprint": expected.fingerprint.value}))
    calls = []
    def assess(request, policy):
        calls.append(policy)
        return assess_commercial(request, policy)
    store.assessment_operation = assess
    accepted = retain(store, first.snapshot, create)
    assert accepted.record.preview == expected.model_dump(mode="json")
    assert len(calls) == 1
    assert counts(store.path) == {"cases": 1, "revisions": 1, "runs": 1, "events": 1, "successful_operations": 1,
                                 "scenario_comparisons": 1, "scenario_comparison_operations": 1}
