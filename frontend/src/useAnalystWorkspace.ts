import { useEffect, useReducer, useRef, useState } from "react";
import alpine from "../../backend/fixtures/alpine.json";
import datedAlpine from "../../backend/fixtures/alpine_dated.json";
import {
  detectMode,
  guardLegacyInput,
  type DatedRequest,
  type Input,
} from "./contracts";
import { evaluate } from "./api";
import { caseError, fetchCase } from "./caseApi";
import { inputField, sameJson, type StoredCase } from "./caseContracts";
import {
  browserStorage,
  makeCreate,
  makeEdit,
  readLocator,
  writeLocator,
  type Locator,
  type PendingOperation,
  type ComparisonOperation,
  makeComparison,
} from "./caseRecovery";
import {
  applyEdit,
  initialWorkspace,
  transition,
  type Draft,
  type EditableField,
  type EditEvent,
  type Workspace,
} from "./workspace";

import { useSavedWrite, type SavedReceipt } from "./useSavedWrite";
import type { ScenarioPreview, StoredComparison } from "./scenarioContracts";

type Conflict = {
  operation: Extract<PendingOperation, { kind: "edit" }>;
  latest: StoredCase | null;
  error: string;
};
export function useAnalystWorkspace() {
  const [state, dispatch] = useReducer(transition, initialWorkspace);
  const current = useRef(state);
  current.current = state;
  const sequence = useRef(0),
    read = useRef<AbortController | null>(null),
    head = useRef<AbortController | null>(null);
  const conflictRead = useRef<AbortController | null>(null),
    mounted = useRef(false);
  const writes = useSavedWrite();
  const { operation, recoveryError, inFlight, writeError } = writes;
  const [comparisonAck, setComparisonAck] = useState<{
    scope: number | null;
    view: StoredComparison;
    operationId: string;
    serial: number;
  } | null>(null);
  const [comparisonError, setComparisonError] = useState<{
    scope: number;
    message: string;
    code: string;
  } | null>(null);
  const acknowledgment = useRef(0);
  const [notice, setNotice] = useState("");
  const [offer, setOffer] = useState<StoredCase | null>(null);
  const [rejected, setRejected] = useState<PendingOperation | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const conflictRef = useRef(conflict);
  conflictRef.current = conflict;

  function begin(
    filename: string,
    draft: Draft | null,
    action: Workspace["action"] = "evaluate",
  ) {
    const id = ++sequence.current;
    read.current?.abort();
    head.current?.abort();
    read.current = null;
    head.current = null;
    dispatch({ type: "start", id, filename, draft, action });
    return id;
  }
  async function submit(draft: Draft, id = begin(draft.filename, draft)) {
    if (id !== sequence.current) return;
    dispatch({ type: "start", id, filename: draft.filename, draft });
    const controller = new AbortController();
    read.current = controller;
    try {
      const accepted = await evaluate(draft, controller.signal);
      if (id === sequence.current && !controller.signal.aborted)
        dispatch({ type: "success", id, accepted });
    } catch (error) {
      if (id === sequence.current && !controller.signal.aborted)
        dispatch({
          type: "failure",
          id,
          error: `Invalid fixture or unavailable backend: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
  }
  function demo(mode: "dated" | "legacy") {
    writeLocator(browserStorage(), null);
    void submit({
      mode,
      payload:
        mode === "dated"
          ? (datedAlpine as DatedRequest)
          : guardLegacyInput(alpine),
      filename: mode === "dated" ? "alpine_dated.json" : "alpine.json",
      resetHistory: true,
    });
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    writeLocator(browserStorage(), null);
    const id = begin(file.name, null);
    try {
      if (file.size > 1_000_000)
        throw new Error("Use a JSON file no larger than 1,000,000 bytes.");
      const rawJson = await file.text();
      if (id !== sequence.current) return;
      const payload: unknown = JSON.parse(rawJson),
        mode = detectMode(payload);
      await submit(
        {
          mode,
          payload: payload as Input,
          filename: file.name,
          rawJson,
          resetHistory: true,
        },
        id,
      );
    } catch (error) {
      if (id === sequence.current)
        dispatch({
          type: "failure",
          id,
          error: `Invalid fixture: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
  }
  async function openSaved(locator: Locator) {
    const id = begin(`Saved case ${locator.caseId}`, null, "open");
    const controller = new AbortController();
    read.current = controller;
    writeLocator(browserStorage(), locator);
    try {
      const view = await fetchCase(
        locator.caseId,
        locator.revision,
        controller.signal,
      );
      if (id === sequence.current && !controller.signal.aborted)
        dispatch({
          type: "stored-success",
          id,
          view,
          selection: locator.revision === "latest" ? "latest" : "revision",
        });
    } catch (error) {
      if (id === sequence.current && !controller.signal.aborted)
        dispatch({ type: "failure", id, error: caseError(error).message });
    }
  }
  async function confirmHead(view: StoredCase, id: number) {
    const controller = new AbortController();
    head.current = controller;
    try {
      const latest = await fetchCase(
        view.snapshot.case_id,
        "latest",
        controller.signal,
      );
      if (id !== sequence.current || controller.signal.aborted) return;
      if (
        latest.snapshot.revision < view.snapshot.revision ||
        (latest.snapshot.revision === view.snapshot.revision &&
          (latest.etag !== view.etag ||
            latest.snapshot.run_id !== view.snapshot.run_id))
      )
        throw new Error(
          "Latest snapshot disagrees with the acknowledged receipt.",
        );
      dispatch({
        type: "head",
        id,
        caseId: view.snapshot.case_id,
        revision: view.snapshot.revision,
        headRevision: latest.snapshot.revision,
      });
      writeLocator(browserStorage(), {
        caseId: view.snapshot.case_id,
        revision:
          latest.snapshot.revision === view.snapshot.revision
            ? "latest"
            : view.snapshot.revision,
      });
    } catch (error) {
      if (id === sequence.current && !controller.signal.aborted)
        setNotice(
          `Write accepted. Latest could not be confirmed; this original receipt remains read-only. ${caseError(error).message}`,
        );
    }
  }
  async function loadConflict(op: Conflict["operation"]) {
    conflictRead.current?.abort();
    const controller = new AbortController();
    conflictRead.current = controller;
    try {
      const latest = await fetchCase(op.caseId, "latest", controller.signal);
      if (controller.signal.aborted || !mounted.current) return;
      if (
        !latest.assessment ||
        latest.snapshot.revision < op.baseRevision ||
        !sameJson(
          inputField(latest.snapshot.normalized_input, op.review.path).context,
          op.context,
        )
      )
        throw new Error(
          "The latest field's definition/context cannot be reviewed with this proposal.",
        );
      setConflict((v) =>
        v?.operation.id === op.id ? { ...v, latest, error: "" } : v,
      );
    } catch (error) {
      if (!controller.signal.aborted && mounted.current)
        setConflict((v) =>
          v?.operation.id === op.id
            ? { ...v, latest: null, error: caseError(error).message }
            : v,
        );
    }
  }
  async function execute(
    op: PendingOperation,
    id: number,
    resetPeriod: boolean,
    request: Promise<SavedReceipt>,
  ) {
    setNotice("");
    try {
      const receipt = await request;
      if (receipt.kind !== "case")
        throw new Error("Unexpected comparison receipt for case write");
      if (!mounted.current) return;
      setRejected(null);
      setNotice(
        `${receipt.replayed ? "Recovered the original" : "Saved"} revision ${receipt.view.snapshot.revision}.`,
      );
      if (id === sequence.current) {
        dispatch({
          type: "stored-success",
          id,
          view: receipt.view,
          selection: "receipt",
          resetPeriod,
        });
        writeLocator(browserStorage(), {
          caseId: receipt.view.snapshot.case_id,
          revision: receipt.view.snapshot.revision,
        });
        void confirmHead(receipt.view, id);
      } else setOffer(receipt.view);
    } catch (error) {
      if (!mounted.current) return;
      const failure = caseError(error);
      if (failure.certain) {
        if (failure.status === 412 && op.kind === "edit") {
          setConflict({ operation: op, latest: null, error: "" });
          void loadConflict(op);
        } else setRejected(op);
      }
      if (id === sequence.current)
        dispatch({ type: "failure", id, error: failure.message });
    }
  }
  function startWrite(op: PendingOperation, resetPeriod: boolean) {
    if (
      writes.controller.snapshot().inFlight ||
      writes.controller.snapshot().operation ||
      recoveryError ||
      conflictRef.current
    )
      throw new Error(
        "Resolve this tab's existing saved write or proposal first.",
      );
    const request = writes.controller.start(op);
    setRejected(null);
    setOffer(null);
    const id = begin(
      op.kind === "create" ? "Saving dated case" : `Saved case ${op.caseId}`,
      null,
      "write",
    );
    void execute(op, id, resetPeriod, request);
  }
  function save(reason: string) {
    const s = current.current;
    if (s.status !== "ready" || s.accepted?.mode !== "dated" || s.saved)
      throw new Error("Open an accepted unsaved dated input before saving.");
    startWrite(makeCreate(s.accepted.input, reason), true);
  }
  function editable(s = current.current) {
    return (
      s.status === "ready" &&
      !!s.accepted &&
      (!s.saved ||
        (!writes.controller.snapshot().operation &&
          !recoveryError &&
          !conflictRef.current &&
          !!s.saved.view.assessment &&
          s.saved.selection === "latest" &&
          s.saved.headRevision === s.saved.view.snapshot.revision))
    );
  }
  function edit(event: EditEvent, field: EditableField) {
    const s = current.current;
    if (!editable(s) || !s.accepted)
      throw new Error(
        "Open a supported latest revision and resolve pending work before editing.",
      );
    if (s.saved) startWrite(makeEdit(s.saved.view, event, field), false);
    else
      void submit({
        mode: s.accepted.mode,
        payload: applyEdit(s.accepted.input, event),
        filename: s.accepted.filename,
        edit: event,
      });
  }
  function retryWrite() {
    const op = writes.controller.snapshot().operation;
    if (!op || inFlight || (writeError?.status === 409 && !writeError.certain)) return;
    const request = writes.controller.retry();
    if (op.kind === "comparison") {
      void executeComparison(op, sequence.current, request);
      return;
    }
    const id = begin(
      op.kind === "create"
        ? "Recovering saved case"
        : `Saved case ${op.caseId}`,
      null,
      "write",
    );
    void execute(op, id, op.kind === "create", request);
  }
  function discardTracking() {
    writes.controller.discard();
    setNotice("Local recovery tracking discarded. This does not undo a write that might already be saved.");
  }
  async function executeComparison(
    op: ComparisonOperation,
    scope: number,
    request: Promise<SavedReceipt>,
  ) {
    setComparisonError(null);
    setNotice("");
    try {
      const receipt = await request;
      if (!mounted.current) return;
      if (receipt.kind !== "comparison")
        throw new Error("Unexpected case receipt for comparison save");
      setComparisonAck({ scope, view: receipt.view, operationId: op.id, serial: ++acknowledgment.current });
      setNotice(`${receipt.replayed ? "Recovered the original" : "Saved"} comparison ${receipt.view.record.comparison_id}.`);
    } catch (error) {
      if (mounted.current) {
        const failure = caseError(error);
        setComparisonError({ scope, message: failure.message, code: failure.code });
      }
    }
  }
  function retainComparison(preview: ScenarioPreview) {
    const s = current.current, b = preview.baseline;
    if (s.status !== "ready" || !s.saved || conflictRef.current ||
        s.saved.view.snapshot.case_id !== b.case_id ||
        s.saved.view.snapshot.revision !== b.revision ||
        s.saved.view.snapshot.run_id !== b.run_id ||
        s.saved.view.snapshot.payload_hash !== b.payload_hash)
      throw new Error("Review the currently selected original baseline before saving.");
    const op = makeComparison(preview), request = writes.controller.start(op);
    void executeComparison(op, sequence.current, request);
  }
  function adoptConflict(latest: StoredCase) {
    const id = begin(`Saved case ${latest.snapshot.case_id}`, null, "open");
    dispatch({ type: "stored-success", id, view: latest, selection: "latest" });
    writeLocator(browserStorage(), {
      caseId: latest.snapshot.case_id,
      revision: "latest",
    });
    conflictRead.current?.abort();
    setConflict(null);
    conflictRef.current = null;
    writes.controller.clearError();
  }
  function reviewConflict(): {
    field: EditableField;
    proposal: EditEvent;
  } | null {
    const c = conflictRef.current;
    if (!c?.latest) return null;
    const command = JSON.parse(c.operation.body) as {
      new_value: number;
      rationale: string;
    };
    const value = inputField(
      c.latest.snapshot.normalized_input,
      c.operation.review.path,
    ).value;
    adoptConflict(c.latest);
    return {
      field: { ...c.operation.review, value },
      proposal: {
        path: c.operation.review.path,
        prior: value,
        next: command.new_value,
        rationale: command.rationale,
        at: "unverified proposal",
      },
    };
  }
  function cancelConflict() {
    const c = conflictRef.current;
    if (c?.latest) adoptConflict(c.latest);
    else {
      conflictRead.current?.abort();
      setConflict(null);
      conflictRef.current = null;
    }
  }
  useEffect(() => {
    mounted.current = true;
    const pending = writes.controller.snapshot().operation;
    if (pending && pending.kind !== "comparison") {
      const id = begin("Pending saved write", null, "write");
      dispatch({
        type: "failure",
        id,
        error:
          "A saved write needs confirmation. Retry the exact write; no proposal is accepted locally yet.",
      });
    } else {
      const locator = readLocator(browserStorage());
      if (locator) void openSaved(locator);
      else if (pending?.kind === "comparison")
        void openSaved({ caseId: pending.caseId, revision: pending.baselineRevision });
      else demo("dated");
    }
    return () => {
      mounted.current = false;
      sequence.current++;
      read.current?.abort();
      head.current?.abort();
      conflictRead.current?.abort();
    };
  }, []);
  return {
    state,
    submit,
    upload,
    demo,
    save,
    edit,
    openSaved,
    operation,
    comparisonAck,
    comparisonError,
    retainComparison,
    inFlight,
    writeError,
    recoveryError,
    notice,
    offer,
    rejected,
    conflict,
    canEdit: editable(state),
    canSave:
      state.status === "ready" &&
      state.accepted?.mode === "dated" &&
      !state.saved &&
      !operation &&
      !recoveryError &&
      !conflict,
    retryWrite,
    discardTracking,
    reviewConflict,
    cancelConflict,
    refreshConflict: () => {
      if (conflictRef.current) void loadConflict(conflictRef.current.operation);
    },
    dismissRejected: () => setRejected(null),
    dismissOffer: () => setOffer(null),
    dismissComparisonAck: () => setComparisonAck(null),
    clearComparisonError: () => setComparisonError(null),
    deferComparisonAck: (serial: number) => setComparisonAck(value => value?.serial === serial ? { ...value, scope: null } : value),
  };
}
