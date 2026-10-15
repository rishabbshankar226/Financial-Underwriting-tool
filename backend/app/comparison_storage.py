"""Private CaseStore implementation for immutable batches and original receipts."""

from __future__ import annotations

import base64
import re
import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime
from hashlib import sha256
from uuid import uuid4

from .case_schema import MAX_COMPARISON_BYTES
from .cases import CaseStore, CaseStoreError, _canonical, _decode, require_uuid
from .comparison_contracts import (
    COMPARISON_STORAGE_VERSION,
    ComparisonCreate,
    ComparisonPage,
    ComparisonRecord,
    ComparisonSummary,
    canonical_uuid,
    utc_timestamp,
)
from .json_values import JsonObject, json_array, json_object, json_string
from .scenario_contracts import SCENARIO_SCHEMA_VERSION, SCENARIO_SERIALIZATION_VERSION, PreviewFingerprint
from .scenarios import preview_commercial_scenarios


def _hash(value: object) -> str:
    return sha256(
        _canonical({"serialization_version": COMPARISON_STORAGE_VERSION, "payload": value}).encode()
    ).hexdigest()


def serialize_comparison(record: ComparisonRecord) -> str:
    return _canonical(record.model_dump(mode="json"))


def etag_for_comparison(record: ComparisonRecord) -> str:
    return f'"{COMPARISON_STORAGE_VERSION}:{record.case_id}:{record.comparison_id}:{record.payload_hash}"'


@dataclass(frozen=True)
class ComparisonReceipt:
    record: ComparisonRecord
    etag: str
    status: int = 201
    replayed: bool = False


def _command_data(case_id: str, revision: int, command: ComparisonCreate) -> JsonObject:
    normalized = command.model_dump(mode="json")
    normalized["baseline_run_id"] = require_uuid(command.baseline_run_id, "Baseline run ID")
    return dict(action="retain_comparison", case_id=case_id, revision=revision, command=normalized)


def _fingerprint(preview: JsonObject, command: JsonObject) -> str:
    """Content hash only: never reapply policy or financial arithmetic to stored results."""
    baseline = json_object(preview["baseline"])
    versions = {
        "schema": preview["schema_version"],
        "calculation": preview["calculation_version"],
        "definition": preview["scenario_definition_version"],
        "serialization": preview["serialization_version"],
    }
    content = {
        "baseline_identity": {key: baseline[key] for key in ("case_id", "revision", "run_id")},
        "payload_hash": baseline["payload_hash"],
        "normalized_command": {
            "schema_version": preview["schema_version"],
            "baseline_run_id": command["baseline_run_id"],
            "scenarios": command["scenarios"],
        },
        "policy_snapshot": preview["policy_snapshot"],
        "versions": versions,
    }
    return sha256(_canonical(content).encode()).hexdigest()


def _read_record(connection: sqlite3.Connection, row: sqlite3.Row) -> tuple[ComparisonRecord, sqlite3.Row]:
    """Validate envelope, command and duplicated evidence without definition dispatch."""
    try:
        raw = _decode(row["record_json"])
        record = ComparisonRecord.model_validate_json(_canonical(raw))
        if (
            serialize_comparison(record) != row["record_json"]
            or len(row["record_json"].encode()) > MAX_COMPARISON_BYTES
            or _hash(record.model_dump(mode="json", exclude={"payload_hash"})) != record.payload_hash
            or any(
                row[key] != getattr(record, key)
                for key in (
                    "case_id",
                    "comparison_id",
                    "baseline_revision",
                    "baseline_run_id",
                    "recorded_at",
                    "payload_hash",
                )
            )
        ):
            raise ValueError("Record hash or index link mismatch")
        op = connection.execute(
            "SELECT * FROM scenario_comparison_operations WHERE comparison_id=?", (record.comparison_id,)
        ).fetchone()
        if op is None:
            raise ValueError("Missing comparison operation")
        canonical_uuid(op["operation_id"])
        command_data = _decode(op["command_json"])
        raw_command = json_object(command_data["command"])
        command = ComparisonCreate.model_validate_json(_canonical(raw_command))
        expected_command = {
            "action": "retain_comparison",
            "case_id": record.case_id,
            "revision": record.baseline_revision,
            "command": raw_command,
        }
        if (
            _canonical(command_data) != _canonical(expected_command)
            or _canonical(command_data) != op["command_json"]
            or _hash(command_data) != op["command_hash"]
            or op["status"] != 201
            or op["etag"] != etag_for_comparison(record)
            or command.baseline_run_id != record.baseline_run_id
            or connection.execute(
                "SELECT 1 FROM successful_operations WHERE operation_id=?", (op["operation_id"],)
            ).fetchone()
        ):
            raise ValueError("Operation hash or link mismatch")
        snapshot = CaseStore._snapshot(connection, record.case_id, record.baseline_revision)
        preview, baseline = record.preview, json_object(record.preview["baseline"])
        fingerprint = PreviewFingerprint.model_validate_json(_canonical(preview["fingerprint"]))
        expected_baseline = {
            "case_id": snapshot.case_id,
            "revision": snapshot.revision,
            "run_id": snapshot.run_id,
            "input_hash": snapshot.input_hash,
            "payload_hash": snapshot.payload_hash,
            "assessment": snapshot.assessment,
        }
        if (
            (preview["schema_version"], preview["serialization_version"])
            not in (
                (SCENARIO_SCHEMA_VERSION, SCENARIO_SERIALIZATION_VERSION),
                ("commercial-scenario-preview-v1", "scenario-preview-json-v1"),
            )
            or preview["persisted"] is not False
            or any(
                not isinstance(preview[key], str) or not preview[key]
                for key in ("calculation_version", "scenario_definition_version")
            )
            or snapshot.run_id != record.baseline_run_id
            or _canonical(baseline) != _canonical(expected_baseline)
            or _canonical(preview["policy_snapshot"]) != _canonical(snapshot.assessment["policy_snapshot"])
            or _canonical(preview["selected_period"]) != _canonical(snapshot.assessment["selected_period"])
            or preview["assumptions_as_of"] != snapshot.assessment["assumptions_as_of"]
            or _canonical(preview["units"]) != _canonical(snapshot.normalized_input["units"])
            or len(json_array(preview["scenarios"])) != len(command.scenarios)
            or any(
                _canonical(
                    {
                        key: json_object(result)[key]
                        for key in ("scenario_key", "name", "rationale", "assumptions")
                    }
                )
                != _canonical(scenario)
                for result, scenario in zip(
                    json_array(preview["scenarios"]), json_array(raw_command["scenarios"]), strict=True
                )
            )
            or fingerprint.value != row["preview_fingerprint"]
            or fingerprint.value != command.expected_preview_fingerprint
            or fingerprint.value != _fingerprint(preview, raw_command)
        ):
            raise ValueError("Preview content link mismatch")
        return record, op
    except (
        ValueError,
        TypeError,
        KeyError,
        AttributeError,
        OverflowError,
        RecursionError,
        CaseStoreError,
    ) as exc:
        raise CaseStoreError(
            503, "storage_integrity", "Stored comparison failed content verification"
        ) from exc


def original_operation(
    connection: sqlite3.Connection, operation_id: str
) -> tuple[ComparisonRecord, sqlite3.Row]:
    row = connection.execute(
        "SELECT c.* FROM scenario_comparison_operations o JOIN scenario_comparisons c "
        "ON c.comparison_id=o.comparison_id WHERE o.operation_id=?",
        (operation_id,),
    ).fetchone()
    if row is None:
        raise CaseStoreError(503, "storage_integrity", "Stored comparison operation is missing its record")
    return _read_record(connection, row)


def retain(
    store: CaseStore,
    connection: sqlite3.Connection,
    case_id: str,
    revision: int,
    command: ComparisonCreate,
    operation_id: str,
) -> ComparisonReceipt:
    data = _command_data(case_id, revision, command)
    command_hash = _hash(data)
    # Existing case writes own the same global UUID namespace, even on schema v1.
    CaseStore._retry(connection, operation_id, command_hash, comparison_write=True)
    version = store._check_schema(connection)
    if version != 2:
        raise CaseStoreError(
            409,
            "storage_upgrade_required",
            "Retaining comparisons requires an explicit schema v2 copy upgrade",
        )
    if connection.execute(
        "SELECT 1 FROM scenario_comparison_operations WHERE operation_id=?", (operation_id,)
    ).fetchone():
        record, op = original_operation(connection, operation_id)
        if (
            op["command_hash"] != command_hash
            and _command_data(
                record.case_id,
                record.baseline_revision,
                ComparisonCreate.model_validate_json(
                    _canonical(json_object(_decode(op["command_json"])["command"]))
                ),
            )
            != data
        ):
            raise CaseStoreError(
                409, "operation_conflict", "Successful operation ID was reused with a different command"
            )
        return ComparisonReceipt(record, op["etag"], replayed=True)
    if (
        connection.execute(
            "SELECT 1 FROM scenario_comparisons c WHERE NOT EXISTS "
            "(SELECT 1 FROM scenario_comparison_operations o WHERE o.comparison_id=c.comparison_id) LIMIT 1"
        ).fetchone()
        or connection.execute(
            "SELECT 1 FROM scenario_comparison_operations o WHERE NOT EXISTS "
            "(SELECT 1 FROM scenario_comparisons c WHERE c.comparison_id=o.comparison_id) LIMIT 1"
        ).fetchone()
    ):
        raise CaseStoreError(
            503, "storage_integrity", "Stored comparison history is missing a record or operation"
        )
    normalized = ComparisonCreate.model_validate_json(_canonical(data["command"]))
    snapshot = store._snapshot(connection, case_id, revision)
    preview = preview_commercial_scenarios(
        snapshot, normalized.preview_command(), assessment_operation=store.assessment_operation
    )
    if preview.fingerprint.value != normalized.expected_preview_fingerprint:
        raise CaseStoreError(
            409, "preview_changed", "The command no longer matches the reviewed preview fingerprint"
        )
    payload = dict(
        schema_version="commercial-scenario-comparison-v2",
        storage_serialization_version=COMPARISON_STORAGE_VERSION,
        persisted=True,
        comparison_id=str(uuid4()),
        case_id=case_id,
        baseline_revision=revision,
        baseline_run_id=snapshot.run_id,
        recorded_at=datetime.now(UTC).isoformat(timespec="microseconds"),
        actor=store.actor,
        recording=store.recording.model_dump(mode="json"),
        preview=preview.model_dump(mode="json"),
    )
    record = ComparisonRecord.model_validate({**payload, "payload_hash": _hash(payload)})
    text = serialize_comparison(record)
    if len(text.encode()) > MAX_COMPARISON_BYTES:
        raise CaseStoreError(
            422, "comparison_payload_limit", "Retained comparison exceeds 16,777,216 UTF-8 bytes"
        )
    etag = etag_for_comparison(record)
    connection.execute(
        "INSERT INTO scenario_comparisons VALUES(?,?,?,?,?,?,?,?)",
        (
            record.comparison_id,
            case_id,
            revision,
            snapshot.run_id,
            record.recorded_at,
            preview.fingerprint.value,
            record.payload_hash,
            text,
        ),
    )
    connection.execute(
        "INSERT INTO scenario_comparison_operations VALUES(?,?,?,?,?,?)",
        (operation_id, record.comparison_id, _canonical(data), command_hash, 201, etag),
    )
    return ComparisonReceipt(record, etag)


def get(connection: sqlite3.Connection, case_id: str, comparison_id: str) -> ComparisonRecord:
    if connection.execute("PRAGMA user_version").fetchone()[0] == 2:
        row = connection.execute(
            "SELECT * FROM scenario_comparisons WHERE case_id=? AND comparison_id=?", (case_id, comparison_id)
        ).fetchone()
        if row is not None:
            return _read_record(connection, row)[0]
    raise CaseStoreError(404, "comparison_not_found", "Comparison not found")


def _cursor(store: CaseStore, cursor: str, case_id: str) -> JsonObject:
    try:
        if (
            not isinstance(cursor, str)
            or not 1 <= len(cursor) <= 512
            or not re.fullmatch(r"[A-Za-z0-9_-]+", cursor)
        ):
            raise ValueError()
        data = _decode(
            base64.b64decode(cursor + "=" * (-len(cursor) % 4), altchars=b"-_", validate=True).decode()
        )
        if (
            data.keys() != {"kind", "version", "case_id", "recorded_at", "comparison_id"}
            or data["kind"] != "scenario_comparisons"
            or type(data["version"]) is not int
            or data["version"] != 1
            or data["case_id"] != case_id
            or store._cursor(data) != cursor
        ):
            raise ValueError()
        canonical_uuid(json_string(data["comparison_id"]))
        utc_timestamp(json_string(data["recorded_at"]))
        return data
    except (ValueError, KeyError, TypeError, AttributeError, RecursionError, CaseStoreError) as exc:
        raise CaseStoreError(400, "invalid_cursor", "Invalid cursor for this comparison listing") from exc


def list_page(
    store: CaseStore, connection: sqlite3.Connection, case_id: str, limit: int, after: str | None
) -> ComparisonPage:
    cursor = _cursor(store, after, case_id) if after is not None else None
    if connection.execute("SELECT 1 FROM cases WHERE case_id=?", (case_id,)).fetchone() is None:
        raise CaseStoreError(404, "case_not_found", "Case not found")
    if connection.execute("PRAGMA user_version").fetchone()[0] == 1:
        return ComparisonPage(items=[], next_cursor=None)
    where, bounds = (
        ("AND (c.recorded_at,c.comparison_id)<(?,?)", [cursor["recorded_at"], cursor["comparison_id"]])
        if cursor
        else ("", [])
    )
    # Extract bounded summaries inside SQLite; do not load full financial/trace blobs.
    rows = connection.execute(
        f"""SELECT c.comparison_id,c.case_id,c.baseline_revision,c.baseline_run_id,
        c.recorded_at,c.preview_fingerprint,c.payload_hash,o.status,o.etag,
        json_extract(c.record_json,'$.schema_version') AS schema_version,
        json_extract(c.record_json,'$.storage_serialization_version') AS storage_serialization_version,
        json_extract(c.record_json,'$.preview.schema_version') AS preview_schema_version,
        json_extract(c.record_json,'$.preview.serialization_version') AS preview_serialization_version,
        json_extract(c.record_json,'$.preview.scenario_definition_version') AS scenario_definition_version,
        json_extract(c.record_json,'$.preview.calculation_version') AS calculation_version,
        json_extract(c.record_json,'$.preview.policy_snapshot.version') AS policy_version,
        json_array_length(c.record_json,'$.preview.scenarios') AS scenario_count,
        (SELECT json_group_array(json_object('scenario_key',json_extract(value,'$.scenario_key'),
                                            'name',json_extract(value,'$.name')))
         FROM json_each(c.record_json,'$.preview.scenarios')) AS scenarios
        FROM scenario_comparisons c LEFT JOIN scenario_comparison_operations o ON o.comparison_id=c.comparison_id
        WHERE c.case_id=? {where} ORDER BY c.recorded_at DESC,c.comparison_id DESC LIMIT ?""",
        [case_id, *bounds, limit + 1],
    ).fetchall()
    items = []
    try:
        for row in rows[:limit]:
            data = dict(row)
            status, etag, payload_hash = (data.pop(key) for key in ("status", "etag", "payload_hash"))
            if (
                status != 201
                or etag != f'"{COMPARISON_STORAGE_VERSION}:{case_id}:{row["comparison_id"]}:{payload_hash}"'
            ):
                raise ValueError("Missing or invalid listing receipt")
            # The shared strict decoder requires an object root.
            data["scenarios"] = _decode('{"items":' + data["scenarios"] + "}")["items"]
            item = ComparisonSummary.model_validate_json(_canonical(data))
            if (
                item.scenario_count != len(item.scenarios)
                or len({s.scenario_key for s in item.scenarios}) != item.scenario_count
            ):
                raise ValueError("Invalid listing scenarios")
            items.append(item)
    except (ValueError, TypeError, KeyError, RecursionError, CaseStoreError) as exc:
        raise CaseStoreError(
            503, "storage_integrity", "Stored comparison summary failed verification"
        ) from exc
    next_cursor = (
        store._cursor(
            dict(
                kind="scenario_comparisons",
                version=1,
                case_id=case_id,
                recorded_at=items[-1].recorded_at,
                comparison_id=items[-1].comparison_id,
            )
        )
        if len(rows) > limit
        else None
    )
    return ComparisonPage(items=items, next_cursor=next_cursor)


def verify(connection: sqlite3.Connection) -> dict[str, int]:
    totals = {
        table: connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
        for table in ("scenario_comparisons", "scenario_comparison_operations")
    }
    if len(set(totals.values())) != 1:
        raise CaseStoreError(503, "storage_integrity", "Each comparison must have one operation receipt")
    for row in connection.execute("SELECT * FROM scenario_comparisons"):
        _read_record(connection, row)
    return totals
