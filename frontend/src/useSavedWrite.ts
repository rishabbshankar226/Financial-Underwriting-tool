import { useEffect, useState, useSyncExternalStore } from "react";
import { CaseApiError, caseError, writeCase } from "./caseApi";
import { browserStorage, clearRecovery, discardRecovery, guardPendingWrite, readRecovery, saveRecovery, type PendingWrite } from "./caseRecovery";
import { sameJson, type StoredCase } from "./caseContracts";
import { writeComparison } from "./scenarioApi";
import type { StoredComparison } from "./scenarioContracts";
export type SavedReceipt = {
    kind: "case";
    view: StoredCase;
    replayed: boolean;
} | {
    kind: "comparison";
    view: StoredComparison;
    replayed: boolean;
};
type WriteState = {
    operation: PendingWrite | null;
    recoveryError: string;
    writeError: CaseApiError | null;
    inFlight: boolean;
};
export class SavedWriteController {
    private state: WriteState;
    private listeners = new Set<() => void>();
    private request: AbortController | null = null;
    constructor(private storage: Storage | null, private transport: typeof fetch = fetch) {
        const initial = readRecovery(storage);
        this.state = { operation: initial.operation, recoveryError: initial.error, writeError: null, inFlight: false };
    }
    snapshot = () => this.state;
    subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
    private update(change: Partial<WriteState>) { this.state = { ...this.state, ...change }; for (const listener of this.listeners)
        listener(); }
    start(operation: PendingWrite): Promise<SavedReceipt> {
        if (this.state.operation || this.state.inFlight || this.state.recoveryError)
            throw new Error("Resolve this tab's existing saved write first.");
        return this.submit(operation);
    }
    retry(): Promise<SavedReceipt> {
        const op = this.state.operation;
        if (!op || this.state.inFlight || (this.state.writeError?.status === 409 && !this.state.writeError.certain))
            throw new Error("Review this pending operation before retrying.");
        return this.submit(op);
    }
    private submit(value: PendingWrite): Promise<SavedReceipt> {
        const op = guardPendingWrite(value);
        if (this.state.operation && !sameJson(this.state.operation, op))
            throw new Error("The pending operation cannot be replaced.");
        try {
            saveRecovery(this.storage, op);
        }
        catch (error) {
            const recovery = readRecovery(this.storage);
            this.update({ operation: recovery.operation, recoveryError: recovery.error });
            throw error;
        }
        const controller = new AbortController();
        this.request = controller;
        this.update({ operation: op, inFlight: true, writeError: null });
        return this.deliver(op, controller);
    }
    private clear(op: PendingWrite) {
        try {
            clearRecovery(this.storage, op.id);
            this.update({ operation: null, recoveryError: "" });
        }
        catch {
            this.update({ recoveryError: "The response was received, but this tab could not clear its recovery tracking. Retrying the same operation is safe." });
        }
    }
    private async deliver(op: PendingWrite, controller: AbortController): Promise<SavedReceipt> {
        try {
            const receipt: SavedReceipt = op.kind === "comparison" ? { kind: "comparison", ...await writeComparison(op, controller.signal, this.transport) } : { kind: "case", ...await writeCase(op, controller.signal, this.transport) };
            if (controller.signal.aborted)
                throw new CaseApiError("The view closed before acknowledgment. Keep the original operation for exact retry.");
            this.clear(op);
            return receipt;
        }
        catch (error) {
            const failure = caseError(error);
            this.update({ writeError: failure });
            if (failure.certain)
                this.clear(op);
            throw failure;
        }
        finally {
            if (this.request === controller) {
                this.request = null;
                this.update({ inFlight: false });
            }
        }
    }
    discard() { if (this.request)
        throw new Error("Wait for the current response before discarding tracking."); discardRecovery(this.storage); this.update({ operation: null, recoveryError: "", writeError: null }); }
    clearError() { this.update({ writeError: null }); }
    abort() { this.request?.abort(); }
}
export function useSavedWrite() {
    const [controller] = useState(() => new SavedWriteController(browserStorage()));
    const state = useSyncExternalStore(controller.subscribe, controller.snapshot);
    useEffect(() => () => controller.abort(), [controller]);
    return { ...state, controller };
}
