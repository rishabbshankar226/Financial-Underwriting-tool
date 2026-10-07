import { apiBase } from "./api";
import {
  guardCasePage,
  guardCreate,
  guardEdit,
  guardReplay,
  guardRevisionPage,
  guardSavedCase,
  inputField,
  requireCase,
  revision,
  sameJson,
  uuid,
  type StoredCase,
} from "./caseContracts";
import { guardOperation, type PendingOperation } from "./caseRecovery";

export class CaseApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public code = "outcome_uncertain",
    public certain = false,
    public retryAfter: string | null = null,
  ) {
    super(message);
    this.name = "CaseApiError";
  }
}
export function caseError(error: unknown): CaseApiError {
  return error instanceof CaseApiError
    ? error
    : new CaseApiError(error instanceof Error ? error.message : String(error));
}
async function json(path: string, init: RequestInit, transport: typeof fetch) {
  let response: Response;
  try {
    response = await transport(`${apiBase}${path}`, init);
  } catch {
    throw new CaseApiError(
      "The response was lost or unavailable. Retry the exact saved write if one is pending.",
    );
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new CaseApiError(
      `Saved-case service returned an unreadable response (${response.status}).`,
      response.status,
    );
  }
  if (!response.ok) {
    const detail =
      body && typeof body === "object" && "detail" in body
        ? (body as { detail: unknown }).detail
        : null;
    let code = "request_failed",
      message = `Saved-case request failed (${response.status}).`;
    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      if ("code" in detail && typeof detail.code === "string")
        code = detail.code;
      if ("message" in detail && typeof detail.message === "string")
        message = detail.message;
    } else if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail))
      message = detail
        .map((v) =>
          v && typeof v === "object"
            ? `${Array.isArray(v.loc) ? v.loc.join(".") : "input"}: ${String(v.msg ?? "Invalid input")}`
            : "Invalid input",
        )
        .join("; ");
    if (code === "storage_not_configured")
      message =
        "Saved cases are not enabled for this local workspace. You can continue with unsaved assessments.";
    throw new CaseApiError(
      message,
      response.status,
      code,
      [400, 404, 412, 413, 422, 428].includes(response.status),
      response.headers.get("Retry-After"),
    );
  }
  return { response, body };
}
function identity(caseId: string, number: number | "latest") {
  requireCase(
    uuid(caseId) && (number === "latest" || revision(number)),
    "requested case/revision",
  );
  return `/cases/${encodeURIComponent(caseId)}${number === "latest" ? "" : `/revisions/${number}`}`;
}
export async function fetchCase(
  caseId: string,
  number: number | "latest",
  signal: AbortSignal,
  transport: typeof fetch = fetch,
): Promise<StoredCase> {
  const { response, body } = await json(
    identity(caseId, number),
    { signal },
    transport,
  );
  const view = guardSavedCase(body, response.headers.get("ETag"));
  requireCase(
    view.snapshot.case_id === caseId &&
      (number === "latest" || view.snapshot.revision === number),
    "requested snapshot identity",
  );
  return view;
}
export async function writeCase(
  operation: PendingOperation,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
): Promise<{ view: StoredCase; replayed: boolean }> {
  const op = guardOperation(operation);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": op.id,
  };
  if (op.kind === "edit") headers["If-Match"] = op.etag;
  const path =
    op.kind === "create"
      ? "/cases"
      : `${identity(op.caseId, "latest")}/revisions`;
  const { response, body } = await json(
    path,
    { method: "POST", headers, body: op.body, signal },
    transport,
  );
  try {
    requireCase(
      response.status === 201 &&
        ["true", "false"].includes(
          response.headers.get("Idempotency-Replayed") ?? "",
        ),
      "accepted receipt status/replay header",
    );
    const view = guardSavedCase(body, response.headers.get("ETag")),
      s = view.snapshot;
    if (op.kind === "create") {
      const command = guardCreate(JSON.parse(op.body));
      requireCase(
        s.revision === 1 &&
          s.event.kind === "creation" &&
          s.event.rationale === command.rationale &&
          sameJson(s.normalized_input, command.input),
        "creation receipt command",
      );
    } else {
      const command = guardEdit(JSON.parse(op.body));
      requireCase(
        s.case_id === op.caseId &&
          s.parent_revision === op.baseRevision &&
          s.revision === op.baseRevision + 1 &&
          s.event.field_path === command.field_path &&
          s.event.after === command.new_value &&
          s.event.before === op.review.value &&
          s.event.rationale === command.rationale &&
          sameJson(s.event.context, op.context),
        "edit receipt command",
      );
      requireCase(
        inputField(s.normalized_input, command.field_path).value ===
          command.new_value,
        "accepted edited input",
      );
    }
    return {
      view,
      replayed: response.headers.get("Idempotency-Replayed") === "true",
    };
  } catch (error) {
    throw new CaseApiError(
      `The write may be saved, but its receipt could not be verified: ${error instanceof Error ? error.message : String(error)}`,
      response.status,
    );
  }
}
const query = (after: string | null) =>
  `?${new URLSearchParams({ limit: "25", ...(after ? { after } : {}) })}`;
export async function fetchCases(
  after: string | null,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
) {
  const { body } = await json(`/cases${query(after)}`, { signal }, transport);
  return guardCasePage(body);
}
export async function fetchRevisions(
  caseId: string,
  after: string | null,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
) {
  const { body } = await json(
    `${identity(caseId, "latest")}/revisions${query(after)}`,
    { signal },
    transport,
  );
  return guardRevisionPage(body, caseId);
}
export async function replayCase(
  view: StoredCase,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
) {
  const { body } = await json(
    `${identity(view.snapshot.case_id, view.snapshot.revision)}/replay`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal,
    },
    transport,
  );
  return guardReplay(body, view);
}
