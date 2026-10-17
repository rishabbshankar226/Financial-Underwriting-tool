import type { ReactNode } from "react";
import type { EditableField } from "../workspace";

export type OpenEditor = (field: EditableField, opener: HTMLElement) => void;

/** A supplied input; activating it opens that field's editor and returns focus here afterwards. */
export function EditButton({
  field,
  canEdit,
  onEdit,
  label,
  children,
}: {
  field: EditableField;
  canEdit: boolean;
  onEdit: OpenEditor;
  label?: string;
  children: ReactNode;
}) {
  return (
    <button
      className="rowEdit"
      aria-label={label}
      disabled={!canEdit}
      onClick={(event) => onEdit(field, event.currentTarget)}
    >
      {children}
    </button>
  );
}
