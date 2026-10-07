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
import { caseError, fetchCase, writeCase } from "./caseApi";
import { inputField, sameJson, type StoredCase } from "./caseContracts";
import {
  browserStorage,
  clearRecovery,
  discardRecovery,
  makeCreate,
  makeEdit,
  readLocator,
  readRecovery,
  saveRecovery,
  writeLocator,
  type Locator,
  type PendingOperation,
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
  const writer = useRef<AbortController | null>(null),
    conflictRead = useRef<AbortController | null>(null),
    mounted = useRef(false);
  const [initialRecovery] = useState(() => readRecovery(browserStorage()));
  const [operation, setOperation] = useState(initialRecovery.operation);
  const operationRef = useRef(operation);
  const [recoveryError, setRecoveryError] = useState(initialRecovery.error);
  const [inFlight, setInFlight] = useState(false);
  const [writeError, setWriteError] = useState<ReturnType<
    typeof caseError
  > | null>(null);
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
  function clearOperation(op: PendingOperation): boolean {
    try {
      clearRecovery(browserStorage(), op.id);
      operationRef.current = null;
      setOperation(null);
      setRecoveryError("");
      return true;
    } catch {
      setRecoveryError(
        "The write response was received, but this tab could not clear its recovery tracking. Retrying the same operation is safe.",
      );
      return false;
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
  ) {
    const controller = new AbortController();
    writer.current = controller;
    setInFlight(true);
    setWriteError(null);
    setNotice("");
    try {
      const receipt = await writeCase(op, controller.signal);
      if (!mounted.current) return;
      clearOperation(op);
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
      setWriteError(failure);
      if (failure.certain) {
        clearOperation(op);
        if (failure.status === 412 && op.kind === "edit") {
          setConflict({ operation: op, latest: null, error: "" });
          void loadConflict(op);
        } else setRejected(op);
      }
      if (id === sequence.current)
        dispatch({ type: "failure", id, error: failure.message });
    } finally {
      if (writer.current === controller) writer.current = null;
      if (mounted.current) setInFlight(false);
    }
  }
  function startWrite(op: PendingOperation, resetPeriod: boolean) {
    if (
      writer.current ||
      operationRef.current ||
      recoveryError ||
      conflictRef.current
    )
      throw new Error(
        "Resolve this tab's existing saved write or proposal first.",
      );
    saveRecovery(browserStorage(), op);
    operationRef.current = op;
    setOperation(op);
    setRejected(null);
    setOffer(null);
    const id = begin(
      op.kind === "create" ? "Saving dated case" : `Saved case ${op.caseId}`,
      null,
      "write",
    );
    void execute(op, id, resetPeriod);
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
        (!operationRef.current &&
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
    const op = operationRef.current;
    if (!op || writer.current || writeError?.status === 409) return;
    saveRecovery(browserStorage(), op);
    const id = begin(
      op.kind === "create"
        ? "Recovering saved case"
        : `Saved case ${op.caseId}`,
      null,
      "write",
    );
    void execute(op, id, op.kind === "create");
  }
  function discardTracking() {
    if (writer.current)
      throw new Error(
        "Wait for the current response before discarding tracking.",
      );
    discardRecovery(browserStorage());
    operationRef.current = null;
    setOperation(null);
    setRecoveryError("");
    setWriteError(null);
    setNotice(
      "Local recovery tracking discarded. This does not undo a write that might already be saved.",
    );
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
    setWriteError(null);
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
    const pending = operationRef.current;
    if (pending) {
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
      else demo("dated");
    }
    return () => {
      mounted.current = false;
      sequence.current++;
      read.current?.abort();
      head.current?.abort();
      writer.current?.abort();
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
  };
}
