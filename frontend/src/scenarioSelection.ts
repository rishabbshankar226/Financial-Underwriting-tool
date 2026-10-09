import { apiBase } from "./api";
import { browserStorage } from "./caseRecovery";
import { uuid } from "./caseContracts";
export const COMPARISON_LOCATOR_KEY = "spreadline.comparison-selection.v1";
// A hint for a fresh original GET, never a cached result or a write instruction.
export function readComparisonLocator(caseId: string): string | null {
    try {
        const raw = browserStorage()?.getItem(COMPARISON_LOCATOR_KEY);
        if (!raw || raw.length > 500)
            return null;
        const value = JSON.parse(raw);
        if (Object.keys(value).length !== 4 || value.version !== "comparison-selection-v1" ||
            value.apiBase !== apiBase || value.caseId !== caseId || !uuid(value.comparisonId))
            return null;
        return value.comparisonId;
    }
    catch {
        return null;
    }
}
export function writeComparisonLocator(caseId: string, comparisonId: string | null) {
    try {
        const storage = browserStorage();
        if (comparisonId === null)
            storage?.removeItem(COMPARISON_LOCATOR_KEY);
        else if (uuid(caseId) && uuid(comparisonId))
            storage?.setItem(COMPARISON_LOCATOR_KEY, JSON.stringify({ version: "comparison-selection-v1", apiBase, caseId, comparisonId }));
    }
    catch { /* Original reads still work when optional selection hints are unavailable. */ }
}
