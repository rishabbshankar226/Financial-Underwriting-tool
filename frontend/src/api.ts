import {
  guardAssessment,
  guardDecision,
  guardLegacyInput,
  type Accepted,
} from "./contracts";
import type { Draft } from "./workspace";
export const apiBase = (
  import.meta.env?.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");
export async function evaluate(
  draft: Draft,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
): Promise<Accepted> {
  const response = await transport(
    `${apiBase}/commercial/${draft.mode === "dated" ? "assessment" : "decision"}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: draft.rawJson ?? JSON.stringify(draft.payload),
      signal,
    },
  );
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      `Backend returned an unreadable response (${response.status}).`,
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
    throw new Error(message);
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
