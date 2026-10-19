import { EvaluationError } from "./api";
import { describeFieldPath } from "./fieldCatalog";

/** Plain-language messages for failed evaluations and imports. Server field messages are already plain and
 * never echo submitted values; this module adds the field's analyst label and what happens next. */
export const rejectedCaseLead = "The server could not evaluate this case";
const SHOWN_PROBLEMS = 3;

function rejection(error: EvaluationError): string {
  if (error.status === 413) return "This case is larger than the 1,000,000-byte request limit, so it was not evaluated.";
  const located = error.fieldErrors.filter((item) => item.pointer !== "");
  if (!located.length) return `${rejectedCaseLead}: ${error.detail ?? error.fieldErrors[0]?.message ?? error.message}`;
  const shown = located.slice(0, SHOWN_PROBLEMS).map((item) => `${describeFieldPath(item.pointer)}: ${item.message}`);
  const more = located.length - shown.length;
  return `${rejectedCaseLead}. ${shown.join(" ")}${more > 0 ? ` …and ${more} more.` : ""}`;
}

export function evaluationFailureMessage(error: unknown): string {
  if (error instanceof EvaluationError) {
    if (error.kind === "rejected") return rejection(error);
    if (error.kind === "unreadable")
      return `The calculation service sent an unreadable response (${error.status}). Nothing was recalculated; retry when it is available.`;
    if (error.status)
      return `The calculation service is unavailable (${error.status}). Nothing was recalculated; retry shortly.`;
    if (error.detail === "timeout")
      return "The calculation service did not respond within 30 seconds. Nothing was recalculated; retry when it is available.";
    if (error.detail) return `The request was not completed: ${error.detail}`;
    return "The calculation service could not be reached. Nothing was recalculated; check the connection, then retry.";
  }
  const message = error instanceof Error ? error.message : String(error);
  const incomplete = /^Incomplete or invalid assessment: (.+)$/.exec(message);
  if (incomplete)
    return `The calculation service returned an incomplete result (${incomplete[1]}), so it was not used. Retry, or check the server version.`;
  return message;
}

export function importFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const reason =
    error instanceof SyntaxError || message === "Invalid JSON number."
      ? "it is not valid JSON."
      : message.endsWith("unsupported schema_version")
        ? "its schema version is not supported."
        : /^Incomplete or invalid assessment: request$/.test(message)
          ? "it does not contain a case object."
          : `${message.charAt(0).toLowerCase()}${message.slice(1)}`;
  return `This file can't be imported: ${reason}`;
}
