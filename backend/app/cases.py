"""Local dated cases: immutable history, atomic writes, and original retry receipts."""
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
from importlib.metadata import version
import base64
import json
import os
from pathlib import Path
import platform
import re
import sqlite3
from time import monotonic
from uuid import UUID, uuid4

from .assessment import assess_commercial
from .assessment_contracts import CommercialAssessmentRequest
from .case_contracts import (
    STORAGE_VERSION, CaseCreate, CaseEdit, CaseEvent, CasePage, CaseSnapshot, CaseSummary,
    EventContext, RecordingMetadata, RevisionPage, RevisionSummary,
)
from .case_replay import replay_snapshot
from .case_schema import SCHEMAS, SCHEMA_IDENTITY, SCHEMA_STATEMENTS, SCHEMA_VERSION, schema_objects
from .config import DEFAULT_POLICY
from .ingestion import parse_structured

ANNUAL_FIELDS = frozenset(("gross_receipts", "cogs", "operating_expense_excl_dna_interest_comp",
                          "officer_compensation", "depreciation", "amortization", "interest_expense",
                          "section_179", "k1_distribution"))
EDIT_FIELDS = {
    "existing_debt": frozenset(("cpltd_annual", "operating_lease_annual")),
    "proposed_loan": frozenset(("amount", "annual_rate", "term_months")),
    "guarantors": frozenset(("ownership_percentage", "wages", "interest_dividend_income",
                            "mortgage_pi_annual", "auto_loan_annual", "credit_card_min_annual")),
    "working_capital": frozenset(("ar_increase", "inventory_increase", "ap_increase", "cash_taxes_paid")),
}


class CaseStoreError(Exception):
    def __init__(self, status, code, message):
        super().__init__(message)
        self.status, self.code = status, code


def _canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)


def _hash(value):
    return sha256(_canonical({"serialization_version": STORAGE_VERSION, "payload": value}).encode()).hexdigest()


def _decode(value):
    try:
        return parse_structured(value, "json")
    except (ValueError, TypeError, OverflowError, RecursionError) as exc:
        raise CaseStoreError(503, "storage_integrity", "Stored JSON failed content verification") from exc


def require_uuid(value, name="case ID"):
    try:
        return str(UUID(value))
    except (ValueError, TypeError, AttributeError) as exc:
        raise CaseStoreError(400, "invalid_identifier", f"{name} must be a UUID") from exc


def require_etag(value):
    if value is None:
        raise CaseStoreError(428, "precondition_required", "One strong If-Match ETag is required")
    if not isinstance(value, str) or not re.fullmatch(r'"[!#-~\x80-\xff]+"', value):
        raise CaseStoreError(400, "invalid_precondition", "If-Match must contain one quoted strong ETag")
    return value


def etag_for(snapshot):
    return f'"{STORAGE_VERSION}:{snapshot.case_id}:{snapshot.revision}:{snapshot.payload_hash}"'


def serialize_snapshot(snapshot):
    """One representation for first response, reads, and the original receipt."""
    return _canonical(snapshot.model_dump(mode="json"))


@dataclass(frozen=True)
class WriteReceipt:
    snapshot: CaseSnapshot
    etag: str
    status: int = 201
    replayed: bool = False


def recording_metadata():
    baseline = Path(__file__).resolve().parents[1] / "constraints-py312.txt"
    source = os.environ.get("SPREADLINE_BUILD_REVISION", "")
    source = source.lower() if re.fullmatch(r"[0-9a-fA-F]{40}", source) else None
    return RecordingMetadata(
        python_version=platform.python_version(), sqlite_version=sqlite3.sqlite_version,
        packages={name: version(name) for name in ("fastapi", "pydantic", "starlette", "uvicorn")},
        dependency_baseline_sha256=sha256(baseline.read_bytes()).hexdigest(),
        source_revision=source, source_status="build_reported" if source else "development_unverified",
    )


def _storage_error(exc):
    code = getattr(exc, "sqlite_errorcode", None)
    if code is not None and code & 255 in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED):
        return CaseStoreError(503, "storage_busy", "Storage is busy; retry the identical operation")
    return CaseStoreError(503, "storage_error", "Case storage failed; no write was accepted")


class CaseStore:
    """Each operation owns its connection; no connection crosses a worker thread."""
    def __init__(self, path, *, timeout=2.0, assessment_operation=assess_commercial,
                 policy_provider=lambda: DEFAULT_POLICY, recording=None, initialize=True):
        if str(path) == ":memory:":
            raise ValueError("Durable cases require an explicit file path")
        self.path = Path(path).expanduser().resolve()
        self.timeout = timeout
        self.assessment_operation = assessment_operation
        self.policy_provider = policy_provider
        self.recording = recording or recording_metadata()
        if initialize:
            self._initialize()
        else:
            with self._db():
                pass

    def _connect(self, mode):
        connection = sqlite3.connect(self.path.as_uri() + "?mode=" + mode, uri=True,
                                     timeout=self.timeout, autocommit=True)
        try:
            connection.row_factory = sqlite3.Row
            connection.execute("PRAGMA foreign_keys=ON")
            if connection.execute("PRAGMA foreign_keys").fetchone()[0] != 1:
                raise CaseStoreError(503, "storage_schema", "Foreign-key enforcement is unavailable")
            return connection
        except BaseException:
            connection.close()
            raise

    @staticmethod
    def _check_schema(connection):
        version_number = connection.execute("PRAGMA user_version").fetchone()[0]
        if version_number not in SCHEMAS:
            raise CaseStoreError(503, "storage_schema", "Unsupported case database schema; file was not changed")
        actual = {(row["type"], row["name"]): " ".join(row["sql"].split())
                  for row in connection.execute("SELECT type,name,sql FROM sqlite_master WHERE name NOT GLOB 'sqlite_*'")}
        if actual != schema_objects(version_number):
            raise CaseStoreError(503, "storage_schema", "Case schema identity does not match; file was not changed")
        rows = connection.execute("SELECT identity,serialization_version FROM schema_metadata").fetchall()
        if len(rows) != 1 or tuple(rows[0]) != (SCHEMAS[version_number][1], STORAGE_VERSION):
            raise CaseStoreError(503, "storage_schema", "Case schema metadata does not match; file was not changed")
        return version_number

    @staticmethod
    def _rollback(connection):
        if connection.in_transaction:
            connection.execute("ROLLBACK")

    @contextmanager
    def _db(self, write=False):
        connection = None
        try:
            connection = self._connect("rw" if write else "ro")
            connection.execute("BEGIN IMMEDIATE" if write else "BEGIN")
            self._check_schema(connection)
            yield connection
            connection.execute("COMMIT")
        except BaseException as exc:
            if connection is not None:
                self._rollback(connection)
            if isinstance(exc, (sqlite3.Error, OSError)):
                raise _storage_error(exc) from exc
            raise
        finally:
            if connection is not None:
                connection.close()

    def _initialize(self):
        connection = None
        try:
            connection = self._connect("rwc")
            connection.execute("BEGIN")
            version_number = connection.execute("PRAGMA user_version").fetchone()[0]
            if version_number != 0:
                self._check_schema(connection)
                connection.execute("COMMIT")
                return
            if connection.execute("SELECT 1 FROM sqlite_master LIMIT 1").fetchone():
                raise CaseStoreError(503, "storage_schema", "Nonempty version-zero database is not a new case store")
            connection.execute("COMMIT")
            connection.execute("BEGIN IMMEDIATE")
            # Another initializer may have committed while this connection waited.
            if connection.execute("PRAGMA user_version").fetchone()[0] in SCHEMAS:
                self._check_schema(connection)
            else:
                if (connection.execute("PRAGMA user_version").fetchone()[0] != 0
                        or connection.execute("SELECT 1 FROM sqlite_master LIMIT 1").fetchone()):
                    raise CaseStoreError(503, "storage_schema", "Database changed during initialization")
                for statement in SCHEMA_STATEMENTS:
                    connection.execute(statement)
                connection.execute("INSERT INTO schema_metadata VALUES(1,?,?)", (SCHEMA_IDENTITY, STORAGE_VERSION))
                connection.execute(f"PRAGMA user_version={SCHEMA_VERSION}")
            connection.execute("COMMIT")
        except BaseException as exc:
            if connection is not None:
                self._rollback(connection)
            if isinstance(exc, (sqlite3.Error, OSError)):
                raise _storage_error(exc) from exc
            raise
        finally:
            if connection is not None:
                connection.close()

    @staticmethod
    def _snapshot(connection, case_id, revision=None):
        selected_head = revision is None
        if revision is None:
            head = connection.execute("SELECT head_revision FROM cases WHERE case_id=?", (case_id,)).fetchone()
            if head is None:
                raise CaseStoreError(404, "case_not_found", "Case not found")
            revision = head[0]
        row = connection.execute("""SELECT v.*, r.assessment_json,r.recording_json,r.payload_hash,e.event_json
            FROM revisions v JOIN runs r ON r.run_id=v.run_id
            JOIN events e ON e.case_id=v.case_id AND e.revision=v.revision
            WHERE v.case_id=? AND v.revision=?""", (case_id, revision)).fetchone()
        if row is None:
            if selected_head or connection.execute("SELECT 1 FROM revisions WHERE case_id=? AND revision=?", (case_id, revision)).fetchone():
                raise CaseStoreError(503, "storage_integrity", "Stored revision is missing its run or event")
            raise CaseStoreError(404, "revision_not_found", "Revision not found")
        try:
            data = dict(storage_serialization_version=STORAGE_VERSION, case_id=row["case_id"],
                        revision=row["revision"], parent_revision=row["parent_revision"], run_id=row["run_id"],
                        recorded_at=row["recorded_at"], normalized_input=_decode(row["input_json"]),
                        input_hash=row["input_hash"], assessment=_decode(row["assessment_json"]),
                        event=_decode(row["event_json"]), recording=_decode(row["recording_json"]))
            event = data["event"]
            if (_hash(data) != row["payload_hash"] or _hash(data["normalized_input"]) != data["input_hash"]
                    or data["assessment"]["normalized_input"] != data["normalized_input"]
                    or any(event[key] != data[key] for key in ("case_id", "revision", "run_id", "recorded_at"))):
                raise ValueError("Stored snapshot hash/link mismatch")
            return CaseSnapshot.model_validate_json(_canonical({**data, "payload_hash": row["payload_hash"]}))
        except (ValueError, KeyError, TypeError, OverflowError, RecursionError) as exc:
            raise CaseStoreError(503, "storage_integrity", "Stored snapshot failed content verification") from exc

    def get(self, case_id, revision=None):
        case_id = require_uuid(case_id)
        if revision is not None and (type(revision) is not int or revision < 1):
            raise CaseStoreError(400, "invalid_revision", "Revision must be a positive integer")
        with self._db() as connection:
            return self._snapshot(connection, case_id, revision)

    @staticmethod
    def _retry(connection, operation_id, command_hash, *, comparison_write=False):
        if (not comparison_write and connection.execute("PRAGMA user_version").fetchone()[0] == 2
                and connection.execute("SELECT 1 FROM scenario_comparison_operations WHERE operation_id=?", (operation_id,)).fetchone()):
            from .comparison_storage import original_operation
            original_operation(connection, operation_id)
            raise CaseStoreError(409, "operation_conflict", "Successful operation ID belongs to a comparison write")
        row = connection.execute("SELECT * FROM successful_operations WHERE operation_id=?", (operation_id,)).fetchone()
        if row is None:
            return None
        recorded_command = _decode(row["command_json"])
        if (not isinstance(recorded_command, dict) or recorded_command.get("action") not in ("create", "edit")
                or not isinstance(recorded_command.get("command"), dict)
                or _hash(recorded_command) != row["command_hash"]):
            raise CaseStoreError(503, "storage_integrity", "Stored operation command failed verification")
        if comparison_write or row["command_hash"] != command_hash:
            raise CaseStoreError(409, "operation_conflict", "Successful operation ID was reused with a different command")
        snapshot = CaseStore._snapshot(connection, row["case_id"], row["revision"])
        if (row["receipt_json"] != serialize_snapshot(snapshot) or row["etag"] != etag_for(snapshot)
                or row["run_id"] != snapshot.run_id or row["status"] != 201):
            raise CaseStoreError(503, "storage_integrity", "Stored operation receipt failed verification")
        return WriteReceipt(snapshot, row["etag"], row["status"], replayed=True)

    def _accepted(self, request, *, case_id, revision, parent_revision, event_fields):
        try:
            assessment = self.assessment_operation(request, self.policy_provider()).model_dump(mode="json")
        except (ValueError, OverflowError, RecursionError) as exc:
            raise CaseStoreError(422, "assessment_invalid", "Input cannot produce a finite accepted assessment") from exc
        run_id, timestamp = str(uuid4()), datetime.now(timezone.utc).isoformat(timespec="microseconds")
        event = CaseEvent(case_id=case_id, revision=revision, run_id=run_id, recorded_at=timestamp,
                          actor="prototype-demo-unverified", **event_fields)
        data = dict(storage_serialization_version=STORAGE_VERSION, case_id=case_id, revision=revision,
                    parent_revision=parent_revision, run_id=run_id, recorded_at=timestamp,
                    normalized_input=request.model_dump(mode="json"), assessment=assessment,
                    event=event.model_dump(mode="json"), recording=self.recording.model_dump(mode="json"))
        data["input_hash"] = _hash(data["normalized_input"])
        return CaseSnapshot(**data, payload_hash=_hash(data))

    @staticmethod
    def _insert(connection, snapshot, operation_id, command):
        connection.execute("INSERT INTO runs VALUES(?,?,?,?,?,?)",
                           (snapshot.run_id, snapshot.case_id, snapshot.revision, _canonical(snapshot.assessment),
                            _canonical(snapshot.recording.model_dump(mode="json")), snapshot.payload_hash))
        connection.execute("INSERT INTO revisions VALUES(?,?,?,?,?,?,?)",
                           (snapshot.case_id, snapshot.revision, snapshot.parent_revision, snapshot.run_id,
                            snapshot.recorded_at, _canonical(snapshot.normalized_input), snapshot.input_hash))
        connection.execute("INSERT INTO events VALUES(?,?,?,?)",
                           (snapshot.case_id, snapshot.revision, snapshot.run_id, _canonical(snapshot.event.model_dump(mode="json"))))
        connection.execute("INSERT INTO successful_operations VALUES(?,?,?,?,?,?,?,?,?)",
                           (operation_id, _canonical(command), _hash(command), snapshot.case_id, snapshot.revision,
                            snapshot.run_id, 201, etag_for(snapshot), serialize_snapshot(snapshot)))

    def create(self, command: CaseCreate, operation_id):
        operation_id = require_uuid(operation_id, "Idempotency-Key")
        command_data = {"action": "create", "command": command.model_dump(mode="json")}
        with self._db(write=True) as connection:
            retried = self._retry(connection, operation_id, _hash(command_data))
            if retried:
                return retried
            case_id = str(uuid4())
            snapshot = self._accepted(command.input, case_id=case_id, revision=1, parent_revision=None,
                                      event_fields=dict(kind="creation", field_path=None, before=None, after=None,
                                                        rationale=command.rationale,
                                                        context=EventContext(basis="case_creation", assessment_as_of=command.input.assessment_as_of.isoformat())))
            connection.execute("INSERT INTO cases VALUES(?,?,?,?,?,?)",
                               (case_id, snapshot.recorded_at, 1, snapshot.run_id,
                                snapshot.normalized_input["borrower_name"], snapshot.recorded_at))
            self._insert(connection, snapshot, operation_id, command_data)
            return WriteReceipt(snapshot, etag_for(snapshot))

    @staticmethod
    def _apply_edit(base, command):
        data = _decode(_canonical(base.normalized_input))
        parts = command.field_path.split("/")[1:]
        context = dict(basis="current_assumptions", assessment_as_of=data["assessment_as_of"])
        unit = "USD dollars"
        if (not command.field_path.startswith("/") or len(parts) not in (2, 3)
                or any(not part for part in parts)):
            raise CaseStoreError(422, "invalid_edit_path", "Unsupported numeric input path")
        group, field = parts[0], parts[-1]
        if group in ("years", "guarantors") and len(parts) == 3:
            allowed = ANNUAL_FIELDS if group == "years" else EDIT_FIELDS[group]
            if not re.fullmatch(r"0|[1-9][0-9]{0,8}", parts[1]) or field not in allowed:
                raise CaseStoreError(422, "invalid_edit_path", "Unsupported numeric input path")
            index = int(parts[1])
            if index >= len(data[group]):
                raise CaseStoreError(422, "invalid_edit_path", "Input index does not exist in the base revision")
            target = data[group][index]
            if group == "years":
                context.update(basis="annual_financials", period_start=target["period_start"], period_end=target["period_end"])
            else:
                context.update(guarantor_index=index, guarantor_name=target["name"])
        elif group in ("existing_debt", "proposed_loan", "working_capital") and len(parts) == 2 and field in EDIT_FIELDS[group]:
            target = data[group]
            if group == "working_capital":
                context.update(basis="working_capital", period_start=target["period_start"], period_end=target["period_end"])
        else:
            raise CaseStoreError(422, "invalid_edit_path", "Unsupported numeric input path")
        if field in ("annual_rate", "ownership_percentage"):
            unit = "decimal fraction"
        elif field == "term_months":
            unit = "months"
        before = target[field]
        if before == command.new_value:
            raise CaseStoreError(422, "unchanged_edit", "Edit must change the selected input")
        target[field] = command.new_value
        try:
            request = CommercialAssessmentRequest.model_validate_json(_canonical(data))
        except (ValueError, OverflowError, RecursionError) as exc:
            raise CaseStoreError(422, "invalid_edit_value", "Edit violates the dated assessment contract") from exc
        # Use the normalized value actually accepted by the complete request.
        normalized = request.model_dump(mode="json")
        after = normalized[group][int(parts[1])][field] if len(parts) == 3 else normalized[group][field]
        return request, dict(kind="edit", field_path=command.field_path, before=before, after=after,
                             rationale=command.rationale, context=EventContext(**context, unit=unit))

    def edit(self, case_id, command: CaseEdit, expected_etag, operation_id):
        case_id = require_uuid(case_id)
        expected_etag = require_etag(expected_etag)
        operation_id = require_uuid(operation_id, "Idempotency-Key")
        normalized_command = command.model_dump(mode="json")
        if command.field_path != "/proposed_loan/term_months":
            normalized_command["new_value"] = float(command.new_value)
        command_data = dict(action="edit", case_id=case_id, expected_etag=expected_etag, command=normalized_command)
        with self._db(write=True) as connection:
            retried = self._retry(connection, operation_id, _hash(command_data))
            if retried:
                return retried
            base = self._snapshot(connection, case_id)
            if expected_etag != etag_for(base):
                raise CaseStoreError(412, "stale_revision", "Case changed; read the current revision before editing")
            request, event_fields = self._apply_edit(base, command)
            snapshot = self._accepted(request, case_id=case_id, revision=base.revision + 1,
                                      parent_revision=base.revision, event_fields=event_fields)
            self._insert(connection, snapshot, operation_id, command_data)
            changed = connection.execute("""UPDATE cases SET head_revision=?,head_run_id=?,recorded_at=?
                WHERE case_id=? AND head_revision=?""", (snapshot.revision, snapshot.run_id, snapshot.recorded_at, case_id, base.revision))
            if changed.rowcount != 1:
                raise CaseStoreError(412, "stale_revision", "Case changed before commit")
            return WriteReceipt(snapshot, etag_for(snapshot))

    @staticmethod
    def _page_limit(limit):
        if type(limit) is not int or not 1 <= limit <= 100:
            raise CaseStoreError(400, "invalid_limit", "Page limit must be an integer from 1 to 100")

    @staticmethod
    def _cursor(data):
        return base64.urlsafe_b64encode(_canonical(data).encode()).decode().rstrip("=")

    @staticmethod
    def _read_cursor(cursor, kind, case_id=None):
        try:
            if not isinstance(cursor, str) or not 1 <= len(cursor) <= 512 or not re.fullmatch(r"[A-Za-z0-9_-]+", cursor):
                raise ValueError()
            data = _decode(base64.b64decode(cursor + "=" * (-len(cursor) % 4), altchars=b"-_", validate=True).decode())
            expected = {"kind", "version", "created_at", "case_id"} if kind == "cases" else {"kind", "version", "case_id", "revision"}
            if data.keys() != expected or data["kind"] != kind or type(data["version"]) is not int or data["version"] != 1:
                raise ValueError()
            require_uuid(data["case_id"])
            if kind == "cases":
                stamp = datetime.fromisoformat(data["created_at"])
                if stamp.tzinfo is None:
                    raise ValueError()
            elif (data["case_id"] != case_id or type(data["revision"]) is not int or not 1 <= data["revision"] <= 2**63 - 1):
                raise ValueError()
            return data
        except (ValueError, TypeError, KeyError, AttributeError, CaseStoreError, RecursionError) as exc:
            raise CaseStoreError(400, "invalid_cursor", "Invalid cursor for this listing") from exc

    def list_cases(self, limit=25, after=None):
        self._page_limit(limit)
        cursor = self._read_cursor(after, "cases") if after is not None else None
        with self._db() as connection:
            where, parameters = ("WHERE (created_at,case_id)<(?,?)", [cursor["created_at"], cursor["case_id"]]) if cursor else ("", [])
            rows = connection.execute(f"""SELECT case_id,borrower_name,created_at,head_revision AS revision,
                head_run_id AS run_id,recorded_at FROM cases {where}
                ORDER BY created_at DESC,case_id DESC LIMIT ?""", [*parameters, limit + 1]).fetchall()
            items = [CaseSummary(**dict(row)) for row in rows[:limit]]
            next_cursor = self._cursor(dict(kind="cases", version=1, created_at=items[-1].created_at, case_id=items[-1].case_id)) if len(rows) > limit else None
            return CasePage(items=items, next_cursor=next_cursor)

    def list_revisions(self, case_id, limit=25, after=None):
        case_id = require_uuid(case_id)
        self._page_limit(limit)
        cursor = self._read_cursor(after, "revisions", case_id) if after is not None else None
        with self._db() as connection:
            if connection.execute("SELECT 1 FROM cases WHERE case_id=?", (case_id,)).fetchone() is None:
                raise CaseStoreError(404, "case_not_found", "Case not found")
            bound = cursor["revision"] if cursor else 2**63 - 1
            rows = connection.execute("SELECT revision FROM revisions WHERE case_id=? AND revision<? ORDER BY revision DESC LIMIT ?",
                                      (case_id, bound, limit + 1)).fetchall()
            items = []
            for row in rows[:limit]:
                snapshot = self._snapshot(connection, case_id, row["revision"])
                items.append(RevisionSummary(case_id=case_id, revision=snapshot.revision, parent_revision=snapshot.parent_revision,
                                             run_id=snapshot.run_id, recorded_at=snapshot.recorded_at, rationale=snapshot.event.rationale))
            next_cursor = self._cursor(dict(kind="revisions", version=1, case_id=case_id, revision=items[-1].revision)) if len(rows) > limit else None
            return RevisionPage(items=items, next_cursor=next_cursor)

    def replay(self, case_id, revision):
        return replay_snapshot(self.get(case_id, revision), self.assessment_operation)

    def retain_comparison(self, case_id, revision, command, operation_id):
        from .comparison_storage import retain
        case_id = require_uuid(case_id)
        if type(revision) is not int or not 1 <= revision <= 2**63 - 1:
            raise CaseStoreError(400, "invalid_revision", "Revision must be a supported positive integer")
        operation_id = require_uuid(operation_id, "Idempotency-Key")
        with self._db(write=True) as connection:
            return retain(self, connection, case_id, revision, command, operation_id)

    def get_comparison(self, case_id, comparison_id):
        from .comparison_storage import get
        case_id = require_uuid(case_id)
        comparison_id = require_uuid(comparison_id, "Comparison ID")
        with self._db() as connection:
            return get(connection, case_id, comparison_id)

    def list_comparisons(self, case_id, limit=25, after=None):
        from .comparison_storage import list_page
        case_id = require_uuid(case_id)
        self._page_limit(limit)
        with self._db() as connection:
            return list_page(self, connection, case_id, limit, after)

    def verify(self):
        with self._db() as connection:
            return self._verify(connection)

    def _verify(self, connection):
        if (connection.execute("PRAGMA integrity_check").fetchall()[0][0] != "ok"
                or connection.execute("PRAGMA foreign_key_check").fetchone() is not None):
            raise CaseStoreError(503, "storage_integrity", "Database integrity/foreign-key check failed")
        cases = connection.execute("SELECT * FROM cases").fetchall()
        revisions = connection.execute("SELECT case_id,revision FROM revisions ORDER BY case_id,revision").fetchall()
        totals = {table: connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                  for table in ("revisions", "runs", "events", "successful_operations")}
        if len(set(totals.values())) != 1:
            raise CaseStoreError(503, "storage_integrity", "Each revision must have one run, event, and receipt")
        for row in revisions:
            snapshot = self._snapshot(connection, row["case_id"], row["revision"])
            op = connection.execute("SELECT * FROM successful_operations WHERE case_id=? AND revision=?", tuple(row)).fetchone()
            if op is None:
                raise CaseStoreError(503, "storage_integrity", "Missing successful operation")
            require_uuid(op["operation_id"], "Stored operation ID")
            self._retry(connection, op["operation_id"], op["command_hash"])
            command = _decode(op["command_json"])
            if snapshot.revision == 1:
                valid = (command == {"action": "create", "command":
                         {"input": snapshot.normalized_input, "rationale": snapshot.event.rationale}}
                         and snapshot.event.kind == "creation" and snapshot.event.field_path is None
                         and snapshot.event.before is None and snapshot.event.after is None)
            else:
                parent = self._snapshot(connection, snapshot.case_id, snapshot.parent_revision)
                try:
                    request, event = self._apply_edit(parent, CaseEdit.model_validate_json(_canonical(command["command"])))
                    expected = {"action": "edit", "case_id": snapshot.case_id, "expected_etag": etag_for(parent), "command": command["command"]}
                    actual_event = snapshot.event.model_dump(mode="json")
                    valid = (command == expected and request.model_dump(mode="json") == snapshot.normalized_input
                             and all(actual_event[key] == (value.model_dump(mode="json") if isinstance(value, EventContext) else value)
                                     for key, value in event.items()))
                except (ValueError, KeyError, TypeError, CaseStoreError):
                    valid = False
            if not valid:
                raise CaseStoreError(503, "storage_integrity", "Stored command/event does not explain its revision")
        for case in cases:
            head = self._snapshot(connection, case["case_id"])
            count = connection.execute("SELECT count(*) FROM revisions WHERE case_id=?", (case["case_id"],)).fetchone()[0]
            first = self._snapshot(connection, case["case_id"], 1)
            if (count != head.revision or case["head_run_id"] != head.run_id
                    or case["borrower_name"] != head.normalized_input["borrower_name"]
                    or case["recorded_at"] != head.recorded_at or case["created_at"] != first.recorded_at):
                raise CaseStoreError(503, "storage_integrity", "Case head or revision sequence failed verification")
        version_number = self._check_schema(connection)
        if version_number == 2:
            from .comparison_storage import verify
            totals.update(verify(connection))
        return {"schema_version": version_number, "cases": len(cases), **totals}


    def backup(self, destination):
        return self._backup(destination)

    def _backup(self, destination, *, copy_timeout=None):
        """Copy a committed snapshot into a fresh file, verify it, preserve source."""
        self.verify()
        # O_EXCL must see an existing leaf symlink, including a dangling one.
        destination = Path(destination).expanduser().absolute()
        created = False
        source = target = None
        try:
            descriptor = os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            created = True
            os.close(descriptor)
            source = self._connect("ro")
            target = sqlite3.connect(destination, autocommit=True, timeout=self.timeout)
            deadline = monotonic() + self.timeout
            copy_deadline = monotonic() + copy_timeout if copy_timeout is not None else None
            def progress(status, remaining, total):
                if copy_deadline is not None and monotonic() > copy_deadline:
                    raise CaseStoreError(503, "copy_timeout", "Database copy exceeded its deadline; retry to a fresh destination")
                if status in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED) and monotonic() > deadline:
                    raise CaseStoreError(503, "storage_busy", "Backup is busy; retry to a fresh destination")
            source.backup(target, pages=128, progress=progress, sleep=0.05)
            target.close()
            target = None
            result = CaseStore(destination, initialize=False).verify()
            return result
        except BaseException as exc:
            if target is not None:
                target.close()
                target = None
            if created:
                destination.unlink(missing_ok=True)
            if isinstance(exc, FileExistsError):
                raise CaseStoreError(400, "destination_exists", "Destination must be a new file") from exc
            if isinstance(exc, (OSError, sqlite3.Error)):
                raise _storage_error(exc) from exc
            raise
        finally:
            if source is not None:
                source.close()
            if target is not None:
                target.close()

    @classmethod
    def restore(cls, source, destination):
        return cls(source, initialize=False).backup(destination)
