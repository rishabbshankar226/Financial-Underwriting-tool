import { useEffect, useRef, useState } from "react";
import { caseError } from "./caseApi";
import { guardScenarioCommand, parseShock, scenarioText, shockKeys, type PreviewCommand, type ScenarioPreview, type StoredComparison } from "./scenarioContracts";
import { fetchComparison, previewScenarios } from "./scenarioApi";
import { readComparisonLocator, writeComparisonLocator } from "./scenarioSelection";
import type { useAnalystWorkspace } from "./useAnalystWorkspace";
export type ScenarioDraft = {
    key: string;
    name: string;
    rationale: string;
    preset: string;
    shocks: Record<typeof shockKeys[number], string>;
};
export const presets = {
    revenue: { name: "Revenue downside", values: ["-10", "0", "0", "0"] },
    cogs: { name: "Higher COGS", values: ["0", "10", "0", "0"] },
    opex: { name: "Higher operating expenses", values: ["0", "0", "10", "0"] },
    combined: { name: "Combined downside", values: ["-10", "10", "10", "0"] },
    rate: { name: "Higher proposed rate", values: ["0", "0", "0", "200"] },
} as const;
function row(number: number): ScenarioDraft {
    return { key: crypto.randomUUID(), name: `Scenario ${number}`, rationale: "", preset: "custom",
        shocks: { revenue_change: "0", cogs_change: "0", operating_expense_change: "0", proposed_rate_change_bps: "0" } };
}
type Reviewed = {
    context: string;
    generation: number;
    preview: ScenarioPreview;
    consumed: boolean;
};
type Original = {
    context: string;
    loading: boolean;
    error: string;
    view: StoredComparison | null;
};
export function useScenarioWorkspace(workspace: ReturnType<typeof useAnalystWorkspace>) {
    const { state } = workspace;
    const view = state.status === "ready" ? state.saved?.view ?? null : null;
    const baseline = view?.snapshot;
    const context = `${state.id}:${state.status}:${baseline?.case_id ?? ""}:${baseline?.revision ?? ""}:${baseline?.run_id ?? ""}:${baseline?.payload_hash ?? ""}`;
    const scope = useRef(context);
    scope.current = context;
    const generation = useRef(0), previewRead = useRef<AbortController | null>(null), originalRead = useRef<AbortController | null>(null), originalSequence = useRef(0);
    const [draft, setDraft] = useState({ context, rows: [row(1)] });
    const [reviewed, setReviewed] = useState<Reviewed | null>(null);
    const reviewRef = useRef(reviewed);
    reviewRef.current = reviewed;
    const [busy, setBusy] = useState(false), [error, setError] = useState("");
    const [original, setOriginal] = useState<Original>({ context, loading: false, error: "", view: null });
    const [refreshSerial, setRefreshSerial] = useState(0);
    const seenAck = useRef(0);
    const submittedGeneration = useRef<number | null>(null), pristineGeneration = useRef(0);
    const rows = draft.context === context ? draft.rows : [];
    const currentPreview = reviewed?.context === context ? reviewed : null;
    const currentOriginal = original.context === context ? original : { context, loading: false, error: "", view: null };
    const supported = !!view?.assessment;
    const writeBlocked = !!(workspace.operation || workspace.recoveryError || workspace.conflict || workspace.inFlight);
    const frozen = workspace.inFlight && workspace.operation?.kind === "comparison";
    const fieldsDisabled = frozen || !!currentOriginal.view || currentOriginal.loading;
    function invalidate() {
        generation.current++;
        previewRead.current?.abort();
        previewRead.current = null;
        reviewRef.current = null;
        setReviewed(null);
        setBusy(false);
        setError("");
        workspace.clearComparisonError();
    }
    function change(key: string, update: (value: ScenarioDraft) => ScenarioDraft) {
        if (fieldsDisabled)
            return;
        invalidate();
        setDraft(previous => ({ context, rows: previous.rows.map(value => value.key === key ? update(value) : value) }));
    }
    function add() {
        if (fieldsDisabled || rows.length >= 10)
            return null;
        invalidate();
        const next = row(rows.length + 1);
        setDraft({ context, rows: [...rows, next] });
        return next.key;
    }
    function remove(key: string) {
        if (fieldsDisabled || rows.length <= 1)
            return;
        invalidate();
        setDraft({ context, rows: rows.filter(value => value.key !== key) });
    }
    function preset(key: string, value: string) {
        change(key, current => {
            const chosen = presets[value as keyof typeof presets];
            if (!chosen)
                return { ...current, preset: "custom" };
            return { ...current, preset: value, name: chosen.name,
                shocks: Object.fromEntries(shockKeys.map((k, i) => [k, chosen.values[i]])) as ScenarioDraft["shocks"] };
        });
    }
    async function preview() {
        if (!view || !supported || fieldsDisabled)
            return;
        invalidate();
        const token = generation.current, resource = context;
        const controller = new AbortController();
        previewRead.current = controller;
        try {
            const command = guardScenarioCommand({ schema_version: "commercial-scenario-preview-v1", baseline_run_id: view.snapshot.run_id,
                scenarios: rows.map(value => ({ scenario_key: value.key, name: scenarioText(value.name, 120), rationale: scenarioText(value.rationale, 2000),
                    assumptions: Object.fromEntries(shockKeys.map(k => [k, parseShock(value.shocks[k], k !== "proposed_rate_change_bps")])) })) }) as PreviewCommand;
            setBusy(true);
            const result = await previewScenarios(view, command, controller.signal);
            if (resource !== scope.current || token !== generation.current || controller.signal.aborted)
                return;
            const accepted = { context: resource, generation: token, preview: result, consumed: false };
            reviewRef.current = accepted;
            setReviewed(accepted);
        }
        catch (failure) {
            if (resource === scope.current && token === generation.current && !controller.signal.aborted)
                setError(caseError(failure).message);
        }
        finally {
            if (previewRead.current === controller) {
                previewRead.current = null;
                setBusy(false);
            }
        }
    }
    function retain() {
        const result = reviewRef.current;
        if (!result || result.context !== scope.current || result.generation !== generation.current || result.consumed || writeBlocked)
            return;
        try {
            workspace.retainComparison(result.preview);
            submittedGeneration.current = result.generation;
            const consumed = { ...result, consumed: true };
            reviewRef.current = consumed;
            setReviewed(consumed);
            setError("");
        }
        catch (failure) {
            setError(caseError(failure).message);
        }
    }
    function newDraft() {
        if (frozen)
            return;
        invalidate();
        setDraft({ context, rows: [row(1)] });
        originalRead.current?.abort();
        originalSequence.current++;
        setOriginal({ context, loading: false, error: "", view: null });
        if (baseline)
            writeComparisonLocator(baseline.case_id, null);
    }
    async function open(comparisonId: string) {
        if (!baseline)
            return;
        invalidate();
        originalRead.current?.abort();
        const controller = new AbortController();
        originalRead.current = controller;
        const token = ++originalSequence.current, resource = context;
        setOriginal({ context: resource, loading: true, error: "", view: null });
        try {
            const result = await fetchComparison(baseline.case_id, comparisonId, controller.signal);
            if (resource !== scope.current || token !== originalSequence.current || controller.signal.aborted)
                return;
            setOriginal({ context: resource, loading: false, error: "", view: result });
            writeComparisonLocator(baseline.case_id, comparisonId);
        }
        catch (failure) {
            if (resource === scope.current && token === originalSequence.current && !controller.signal.aborted)
                setOriginal({ context: resource, loading: false, error: caseError(failure).message, view: null });
        }
        finally {
            if (originalRead.current === controller)
                originalRead.current = null;
        }
    }
    useEffect(() => {
        invalidate();
        submittedGeneration.current = null;
        pristineGeneration.current = generation.current;
        setDraft({ context, rows: [row(1)] });
        setOriginal({ context, loading: false, error: "", view: null });
        const hint = baseline && readComparisonLocator(baseline.case_id);
        if (hint)
            void open(hint);
        return () => { generation.current++; previewRead.current?.abort(); originalSequence.current++; originalRead.current?.abort(); };
    }, [context]);
    useEffect(() => {
        const ack = workspace.comparisonAck;
        if (!ack || ack.serial === seenAck.current)
            return;
        seenAck.current = ack.serial;
        if (ack.scope !== state.id || !baseline || ack.view.record.case_id !== baseline.case_id ||
            ack.view.record.baseline_revision !== baseline.revision || ack.view.record.baseline_run_id !== baseline.run_id)
            return;
        if (generation.current !== (submittedGeneration.current ?? pristineGeneration.current)) {
            workspace.deferComparisonAck(ack.serial);
            setRefreshSerial(value => value + 1);
            return;
        }
        originalRead.current?.abort();
        originalSequence.current++;
        setOriginal({ context, loading: false, error: "", view: ack.view });
        writeComparisonLocator(baseline.case_id, ack.view.record.comparison_id);
        setRefreshSerial(value => value + 1);
    }, [workspace.comparisonAck]);
    const saveError = workspace.comparisonError?.scope === state.id ? workspace.comparisonError : null;
    return { context, baseline, view, supported, rows, busy, error: error || saveError?.message || "", errorCode: saveError?.code,
        canSaveBaseline: workspace.canSave, previewConsumed: !!currentPreview?.consumed,
        frozen, fieldsDisabled, writeBlocked, previewResult: currentPreview?.preview ?? null, original: currentOriginal, refreshSerial,
        canRetain: !!currentPreview && !currentPreview.consumed && currentPreview.generation === generation.current && !writeBlocked && !fieldsDisabled,
        change, add, remove, preset, preview, retain, newDraft, open };
}
