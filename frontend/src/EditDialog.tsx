import { editorText } from "./format";
import { useEffect, useRef, useState } from "react";
import { validateEdit, type EditableField, type EditEvent } from "./workspace";
import { restoreDialogFocus } from "./CaseDialogs";
import { rationale as savedRationale } from "./caseContracts";
import { activeWorkspaceElement } from "./workspaceDom";
export default function EditDialog({
  field,
  onCancel,
  onSubmit,
  restoreFocus,
  saved = false,
  proposal,
}: {
  field: EditableField;
  onCancel: () => void;
  onSubmit: (edit: EditEvent) => void;
  restoreFocus: HTMLElement | null;
  saved?: boolean;
  proposal?: EditEvent;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(
    editorText(proposal?.next ?? field.value, field.unit),
  );
  const [rationale, setRationale] = useState(proposal?.rationale ?? "");
  const [error, setError] = useState("");
  function validateValue(next: string) {
    try {
      validateEdit(field, next, "", { requireRationale: false });
      return "";
    } catch (reason) {
      return reason instanceof Error ? reason.message : "Review this value.";
    }
  }
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      restoreDialogFocus(restoreFocus);
    };
  }, [restoreFocus]);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="edit-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const nodes = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "input,textarea,button:not(:disabled)",
          ),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          event.shiftKey &&
          activeWorkspaceElement(event.currentTarget) === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          activeWorkspaceElement(event.currentTarget) === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          try {
            // Only a saved revision needs a rationale; an unsaved draft edit does not.
            const next = validateEdit(field, value, rationale, { requireRationale: saved });
            if (saved) savedRationale(rationale);
            onSubmit({
              path: field.path,
              prior: field.value,
              next,
              rationale: rationale.trim(),
              at: new Date().toISOString(),
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
      >
        <h2 id="edit-title">Edit {field.label}</h2>
        <p>
          {field.period} · {field.unit}
          <br />
          Current value: {editorText(field.value, field.unit)}
        </p>
        <label>
          New value{" "}
          <input
            autoFocus
            value={value}
            placeholder={
              field.unit === "%" ? "10.5%" : field.integer ? "120" : "500000.00"
            }
            aria-describedby="edit-value-help"
            onBlur={() => setError(validateValue(value))}
            onChange={(e) => {
              setValue(e.target.value);
              if (!validateValue(e.target.value)) setError("");
            }}
            inputMode="decimal"
          />
        </label>
        <small id="edit-value-help">
          {field.unit === "%"
            ? "Percentage, such as 10.5"
            : field.integer
              ? "Whole months, such as 120"
              : "Dollar amount, such as 600,000"}
          {field.min !== undefined
            ? ` · minimum ${editorText(field.min, field.unit)}`
            : ""}
          {field.max !== undefined
            ? ` · maximum ${editorText(field.max, field.unit)}`
            : ""}
        </small>
        <label>
          {saved ? "Rationale" : "Rationale (optional)"}{" "}
          <textarea
            value={rationale}
            placeholder="Explain the source or reason for this edit"
            onChange={(e) => {
              setRationale(e.target.value);
              if (e.target.value.trim()) setError("");
            }}
            rows={3}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <p className="fine">
          {saved
            ? "The edit creates a saved revision only after an accepted server receipt. It uses the server's selected policy; earlier revisions stay unchanged. Rationale: at most 2,000 characters."
            : "The edit is applied only after a successful backend evaluation."}
        </p>
        <div className="actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary" type="submit">
            {saved ? "Save revision" : "Evaluate edit"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
