import { useEffect, useRef, useState, type ReactNode } from "react";
import { rationale } from "./caseContracts";
import type { DatedRequest } from "./contracts";

export function restoreDialogFocus(element: HTMLElement | null) {
  if (
    element?.isConnected &&
    !(element instanceof HTMLButtonElement && element.disabled)
  )
    element.focus();
  else
    document.querySelector<HTMLButtonElement>("[data-focus-fallback]")?.focus();
}
function Modal({
  title,
  onCancel,
  restoreFocus,
  children,
}: {
  title: string;
  onCancel: () => void;
  restoreFocus: HTMLElement | null;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => {
      node?.close();
      restoreDialogFocus(restoreFocus);
    };
  }, [restoreFocus]);
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const nodes = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            "input:not(:disabled),textarea:not(:disabled),button:not(:disabled)",
          ),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
    >
      {children}
    </dialog>
  );
}
export function SaveCaseDialog({
  input,
  onSave,
  onCancel,
  restoreFocus,
}: {
  input: DatedRequest;
  onSave: (reason: string) => void;
  onCancel: () => void;
  restoreFocus: HTMLElement | null;
}) {
  const [reason, setReason] = useState(""),
    [error, setError] = useState("");
  return (
    <Modal
      title="Save dated case"
      onCancel={onCancel}
      restoreFocus={restoreFocus}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            rationale(reason);
            onSave(reason);
            onCancel();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
      >
        <div className="eyebrow">SAVE ACCEPTED INPUT</div>
        <h2>Save dated case</h2>
        <p>
          {input.borrower_name} · as of {input.assessment_as_of}
        </p>
        <label>
          Save rationale
          <textarea
            autoFocus
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <p className="fine">
          Saving assesses this accepted input under the server's current policy.
          The returned stored result becomes the accepted result. Earlier
          session edits are not added to saved history. Rationale: at most 2,000
          characters.
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save accepted case
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function DiscardTrackingDialog({
  onDiscard,
  onCancel,
  restoreFocus,
}: {
  onDiscard: () => void;
  onCancel: () => void;
  restoreFocus: HTMLElement | null;
}) {
  const [error, setError] = useState("");
  return (
    <Modal
      title="Discard recovery tracking"
      onCancel={onCancel}
      restoreFocus={restoreFocus}
    >
      <h2>Discard recovery tracking?</h2>
      <p>
        A previous write might already be saved. Discarding this tab's tracking
        does not undo that write and loses its exact retry key. Check saved
        cases before creating another case.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="actions">
        <button autoFocus onClick={onCancel}>
          Keep tracking
        </button>
        <button
          onClick={() => {
            try {
              onDiscard();
              onCancel();
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          Discard tracking
        </button>
      </div>
    </Modal>
  );
}
