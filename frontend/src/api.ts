import {
  guardAssessment,
  guardDecision,
  guardLegacyInput,
  type Accepted,
} from "./contracts";
import { pointerFromLoc } from "./fieldCatalog";
import type { Draft } from "./workspace";
import { dispatchRequest } from "./transport";
export { apiBase } from "./transport";
export const apiRequest = (path: string, init: RequestInit, transport: typeof fetch = fetch): Promise<Response> =>
  dispatchRequest(path, init, transport);

/** One `field-errors-v1` item: where the server found a problem and its plain message (never the value). */
export type FieldError = { pointer: string; code: string; message: string; limit: string | null };

/** A failed evaluation. `status` is 0 when no response arrived; a rejection carries the server's field errors. */
export class EvaluationError extends Error {
  constructor(
    message: string,
    readonly kind: "rejected" | "unavailable" | "unreadable",
    readonly status = 0,
    readonly fieldErrors: FieldError[] = [],
    readonly detail: string | null = null,
  ) {
    super(message);
    this.name = "EvaluationError";
  }
}

function fieldErrorsFrom(body: unknown, detail: unknown): FieldError[] {
  const envelope = body && typeof body === "object" && "errors" in body ? (body as { errors: unknown }).errors : null;
  if (envelope && typeof envelope === "object" && (envelope as { version?: unknown }).version === "field-errors-v1") {
    const items = (envelope as { items?: unknown }).items;
    if (Array.isArray(items))
      return items.flatMap((item) =>
        item && typeof item === "object" && typeof item.pointer === "string" && typeof item.message === "string"
          ? [{
              pointer: item.pointer,
              code: typeof item.code === "string" ? item.code : "invalid_value",
              message: item.message,
              limit: typeof item.limit === "string" ? item.limit : null,
            }]
          : [],
      );
  }
  // Hosts without the envelope still report validation locations.
  return Array.isArray(detail)
    ? detail.flatMap((item) =>
        item && typeof item === "object" && "loc" in item
          ? [{ pointer: pointerFromLoc(item.loc), code: "invalid_value", message: String(item.msg ?? "Invalid input"), limit: null }]
          : [],
      )
    : [];
}

export async function evaluate(
  draft: Draft,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
): Promise<Accepted> {
  let response: Response;
  try {
    response = await apiRequest(
      `/commercial/${draft.mode === "dated" ? "assessment" : "decision"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: draft.rawJson ?? JSON.stringify(draft.payload),
        signal,
      },
      transport,
    );
  } catch (error) {
    throw new EvaluationError(error instanceof Error ? error.message : String(error), "unavailable");
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new EvaluationError(
      `Backend returned an unreadable response (${response.status}).`,
      "unreadable",
      response.status,
    );
  }
  if (!response.ok) {
    const detail =
      body && typeof body === "object" && "detail" in body
        ? (body as { detail: unknown }).detail
        : null;
    const message = Array.isArray(detail)
      ? detail
          .map((item) =>
            item && typeof item === "object"
              ? `${Array.isArray(item.loc) ? item.loc.join(".") : "input"}: ${String(item.msg ?? "Invalid input")}`
              : "Invalid input",
          )
          .join("; ")
      : typeof detail === "string"
        ? detail
        : `Request failed (${response.status}).`;
    throw new EvaluationError(
      message,
      response.status < 500 ? "rejected" : "unavailable",
      response.status,
      fieldErrorsFrom(body, detail),
      typeof detail === "string" ? detail : null,
    );
  }
  return draft.mode === "dated"
    ? (() => {
        const result = guardAssessment(body);
        return {
          mode: "dated" as const,
          input: result.normalized_input,
          result,
          filename: draft.filename,
        };
      })()
    : {
        mode: "legacy",
        input: guardLegacyInput(draft.payload),
        result: guardDecision(body),
        filename: draft.filename,
      };
}
