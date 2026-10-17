import { useState, type MutableRefObject } from "react";
import type { EditableField, EditEvent } from "./workspace";

/** The open edit dialog and its reviewed proposal. `opener` is the workspace's shared focus-return element. */
export function useEditController(
  opener: MutableRefObject<HTMLElement | null>,
  apply: (event: EditEvent, field: EditableField) => void,
) {
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [proposal, setProposal] = useState<EditEvent | undefined>();
  function cancel() {
    setEditing(null);
    setProposal(undefined);
  }
  return {
    editing,
    proposal,
    open(field: EditableField, element: HTMLElement) {
      opener.current = element;
      setEditing(field);
    },
    /** Reopens a conflicted saved write with its proposed value and rationale. */
    review(field: EditableField, reviewed: EditEvent, element: HTMLElement) {
      opener.current = element;
      setEditing(field);
      setProposal(reviewed);
    },
    /** Closes the editor because an evaluation started. */
    dismiss() {
      setEditing(null);
    },
    cancel,
    submit(event: EditEvent) {
      if (!editing) return;
      apply(event, editing);
      cancel();
    },
  };
}
