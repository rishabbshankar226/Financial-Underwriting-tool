import { apiRequest } from "./api";
import { AnalysisContractError, guardAnalysis, type CommercialAnalysis } from "./analysisContracts";
import { revision, uuid } from "./caseContracts";
import type { DatedRequest, Period } from "./contracts";
import { boundedJson } from "./scenarioApi";

/** What one analysis explains: an unsaved dated draft (stateless route, current policy) or a saved revision
 * (retained policy, after the server verifies its replay). `key` names both the source and the assessment. */
export type AnalysisSubject = {
  key: string;
  fingerprint: string;
  years: Period[];
  source: { kind: "stateless"; input: DatedRequest } | { kind: "saved"; caseId: string; revision: number };
};

export const analysisCopy = {
  unavailable: "Analysis unavailable on this server. The assessment above is unaffected.",
  mismatch: "The analysis did not match this assessment, so it is not shown.",
  unsupported: "This analysis version is not supported by this workspace, so it is not shown.",
  invalid: "The analysis response was incomplete or inconsistent, so it is not shown.",
  unreachable: "The analysis service could not be reached.",
} as const;

/** Why an analysis is not shown: the host lacks the route, the version is unknown, it explains another
 * assessment, or the request failed for another reason. */
export class AnalysisError extends Error {
  constructor(
    message: string,
    readonly kind: "unavailable" | "unsupported" | "mismatch" | "failed",
    readonly status = 0,
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

function serverMessage(body: unknown): { code: string | null; message: string | null } {
  const detail = body && typeof body === "object" && "detail" in body ? (body as { detail: unknown }).detail : null;
  if (detail && typeof detail === "object" && !Array.isArray(detail))
    return {
      code: "code" in detail && typeof detail.code === "string" ? detail.code : null,
      message: "message" in detail && typeof detail.message === "string" ? detail.message : null,
    };
  return { code: null, message: typeof detail === "string" && detail !== "Not Found" ? detail : null };
}

export async function fetchAnalysis(
  subject: AnalysisSubject,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
): Promise<CommercialAnalysis> {
  const { source } = subject;
  if (source.kind === "saved" && !(uuid(source.caseId) && revision(source.revision)))
    throw new AnalysisError(analysisCopy.invalid, "failed");
  const path =
    source.kind === "saved"
      ? `/cases/${encodeURIComponent(source.caseId)}/revisions/${source.revision}/analysis`
      : "/commercial/analysis";
  let response: Response;
  try {
    response = await apiRequest(
      path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: source.kind === "saved" ? "{}" : JSON.stringify(source.input),
        signal,
      },
      transport,
    );
  } catch (error) {
    if (signal.aborted) throw error;
    throw new AnalysisError(analysisCopy.unreachable, "failed");
  }
  let body: unknown;
  try {
    body = await boundedJson(response, "Analysis");
  } catch (error) {
    if (signal.aborted) throw error;
    if (response.status === 404) throw new AnalysisError(analysisCopy.unavailable, "unavailable", 404);
    throw new AnalysisError(`The analysis response could not be read (${response.status}).`, "failed", response.status);
  }
  if (!response.ok) {
    const { code, message } = serverMessage(body);
    // A route this host does not serve answers 404 without a storage error code.
    if (response.status === 404 && !code) throw new AnalysisError(analysisCopy.unavailable, "unavailable", 404);
    throw new AnalysisError(message ?? `The analysis request failed (${response.status}).`, "failed", response.status);
  }
  try {
    return guardAnalysis(body, subject);
  } catch (error) {
    if (error instanceof AnalysisContractError)
      throw new AnalysisError(analysisCopy[error.kind], error.kind === "invalid" ? "failed" : error.kind, response.status);
    throw error;
  }
}
