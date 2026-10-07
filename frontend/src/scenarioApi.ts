import { apiBase } from "./api";
import { CaseApiError } from "./caseApi";
import { requireCase, sameJson, uuid, revision, type StoredCase } from "./caseContracts";
import { guardPendingWrite, type ComparisonOperation } from "./caseRecovery";
import { guardComparison, guardComparisonPage, guardPreview, guardScenarioCommand, previewCommand, type ComparisonCommand, type PreviewCommand } from "./scenarioContracts";
export const MAX_RESPONSE = 16777216;
const definiteComparison409 = new Set(["preview_changed", "storage_upgrade_required", "baseline_run_mismatch", "baseline_unsupported", "baseline_replay_mismatch", "baseline_replay_unavailable"]);
function casePath(caseId: string) { requireCase(uuid(caseId), "comparison case locator"); return `/cases/${encodeURIComponent(caseId)}`; }
function baselinePath(caseId: string, number: number) { requireCase(revision(number), "comparison revision locator"); return `${casePath(caseId)}/revisions/${number}`; }
async function boundedJson(response: Response) {
    const reader = response.body?.getReader();
    if (!reader)
        throw new Error("Missing response body");
    const chunks: Uint8Array[] = [], decoder = new TextDecoder("utf-8", { fatal: true });
    let bytes = 0;
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            bytes += value.byteLength;
            if (bytes > MAX_RESPONSE)
                throw new Error("Comparison response exceeds 16 MiB");
            chunks.push(value);
        }
    }
    catch (error) {
        await reader.cancel().catch(() => { });
        throw error;
    }
    finally {
        reader.releaseLock();
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return JSON.parse(decoder.decode(body)) as unknown;
}
async function json(path: string, init: RequestInit, transport: typeof fetch) {
    let response: Response;
    try {
        response = await transport(`${apiBase}${path}`, init);
    }
    catch {
        throw new CaseApiError("The comparison response was lost or unavailable. Keep and retry the exact pending save if one exists.");
    }
    let body: unknown;
    try {
        body = await boundedJson(response);
    }
    catch (error) {
        throw new CaseApiError(`Comparison response could not be read: ${error instanceof Error ? error.message : String(error)}.`, response.status);
    }
    if (!response.ok) {
        const detail = body && typeof body === "object" && "detail" in body ? (body as {
            detail: unknown;
        }).detail : null;
        let code = "request_failed", message = `Comparison request failed (${response.status}).`, valid = false;
        if (detail && typeof detail === "object" && !Array.isArray(detail) && "code" in detail && typeof detail.code === "string" && "message" in detail && typeof detail.message === "string") {
            code = detail.code;
            message = detail.message;
            valid = true;
        }
        else if (Array.isArray(detail)) {
            message = detail.map(v => v && typeof v === "object" && "msg" in v ? String(v.msg) : "Invalid scenario input").join("; ");
            valid = true;
        }
        const certain = valid && ([400, 404, 413, 422].includes(response.status) || (response.status === 409 && definiteComparison409.has(code)));
        throw new CaseApiError(message, response.status, code, certain, response.headers.get("Retry-After"));
    }
    return { response, body };
}
function commandBody(command: unknown) { const c = guardScenarioCommand(command), body = JSON.stringify(c); requireCase(new TextEncoder().encode(body).length <= 1000000, "scenario request byte limit"); return body; }
export async function previewScenarios(view: StoredCase, command: PreviewCommand, signal: AbortSignal, transport: typeof fetch = fetch) {
    requireCase(command.schema_version === "commercial-scenario-preview-v1", "preview command version");
    const { response, body } = await json(`${baselinePath(view.snapshot.case_id, view.snapshot.revision)}/scenarios/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: commandBody(command), signal }, transport);
    requireCase(response.status === 200, "preview status");
    return guardPreview(body, view, command);
}
export async function writeComparison(operation: ComparisonOperation, signal: AbortSignal, transport: typeof fetch = fetch) {
    const op = guardPendingWrite(operation);
    requireCase(op.kind === "comparison", "comparison operation kind");
    const { response, body } = await json(`${baselinePath(op.caseId, op.baselineRevision)}/scenario-comparisons`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": op.id }, body: op.body, signal }, transport);
    try {
        requireCase(response.status === 201 && ["true", "false"].includes(response.headers.get("Idempotency-Replayed") ?? ""), "retained receipt status/replay");
        const view = guardComparison(body, response.headers.get("ETag")), r = view.record, p = r.preview, command = guardScenarioCommand(JSON.parse(op.body)) as ComparisonCommand;
        requireCase(r.case_id === op.caseId && r.baseline_revision === op.baselineRevision && r.baseline_run_id === op.baselineRunId && sameJson(previewCommand(p).scenarios, command.scenarios), "original receipt command/baseline");
        const baseline = p.baseline as {
            payload_hash: string;
        }, fp = p.fingerprint as {
            value: string;
        };
        requireCase(baseline.payload_hash === op.baselinePayloadHash && fp.value === command.expected_preview_fingerprint && response.headers.get("Location") === `${casePath(r.case_id)}/scenario-comparisons/${r.comparison_id}`, "original receipt fingerprint/location");
        return { view, replayed: response.headers.get("Idempotency-Replayed") === "true" };
    }
    catch (error) {
        throw new CaseApiError(`The comparison may be saved, but its receipt could not be verified: ${error instanceof Error ? error.message : String(error)}`, response.status);
    }
}
export async function fetchComparison(caseId: string, comparisonId: string, signal: AbortSignal, transport: typeof fetch = fetch) {
    requireCase(uuid(comparisonId), "comparison locator");
    const { response, body } = await json(`${casePath(caseId)}/scenario-comparisons/${encodeURIComponent(comparisonId)}`, { signal }, transport);
    requireCase(response.status === 200, "original comparison status");
    const result = guardComparison(body, response.headers.get("ETag"));
    requireCase(result.record.case_id === caseId && result.record.comparison_id === comparisonId, "requested original comparison");
    return result;
}
export async function fetchComparisons(caseId: string, after: string | null, signal: AbortSignal, transport: typeof fetch = fetch) {
    requireCase(after === null || /^[A-Za-z0-9_-]{1,512}$/.test(after), "comparison cursor");
    const query = new URLSearchParams({ limit: "25", ...(after ? { after } : {}) });
    const { response, body } = await json(`${casePath(caseId)}/scenario-comparisons?${query}`, { signal }, transport);
    requireCase(response.status === 200, "comparison page status");
    return guardComparisonPage(body, caseId);
}
