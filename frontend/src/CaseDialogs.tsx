import { useEffect, useRef, useState, type ReactNode } from "react";
import { rationale } from "./caseContracts";
import type { DatedRequest } from "./contracts";
import { activeWorkspaceElement, queryWorkspace } from "./workspaceDom";

export function restoreDialogFocus(element: HTMLElement | null) {
  if (
    element?.isConnected &&
    !(element instanceof HTMLButtonElement && element.disabled)
  )
    element.focus();
  else
    queryWorkspace<HTMLButtonElement>("[data-focus-fallback]")?.focus();
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
        if (e.shiftKey && activeWorkspaceElement(e.currentTarget) === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && activeWorkspaceElement(e.currentTarget) === last) {
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
      title="Save case"
      onCancel={onCancel}
      restoreFocus={restoreFocus}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Say what is missing in plain words; the contract check below stays as the backstop.
          if (!reason.trim()) {
            setError("Enter a rationale for this save (up to 2,000 characters).");
            return;
          }
          try {
            rationale(reason);
            onSave(reason);
            onCancel();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
      >
        <h2>Save case</h2>
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
          Saving re-checks this case under the current policy and stores it as a
          saved revision. Edits made before saving are not listed separately in
          its history. Rationale: up to 2,000 characters.
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save
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
