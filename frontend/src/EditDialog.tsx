import { useEffect, useRef, useState } from "react";
import { validateEdit, type EditableField, type EditEvent } from "./workspace";
import { restoreDialogFocus } from "./CaseDialogs";
import { rationale as savedRationale } from "./caseContracts";
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
    String(
      field.unit === "%"
        ? (proposal?.next ?? field.value) * 100
        : (proposal?.next ?? field.value),
    ),
  );
  const [rationale, setRationale] = useState(proposal?.rationale ?? "");
  const [error, setError] = useState("");
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
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
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
            const next = validateEdit(field, value, rationale);
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
        <div className="eyebrow">INPUT REVIEW</div>
        <h2 id="edit-title">Edit {field.label}</h2>
        <p>
          {field.period} · {field.unit}
          <br />
          Current value: {field.unit === "%" ? field.value * 100 : field.value}
        </p>
        <label>
          New value{" "}
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
          />
        </label>
        <label>
          Rationale{" "}
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
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
