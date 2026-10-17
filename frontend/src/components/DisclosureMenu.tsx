import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** A button that shows a panel of plain buttons (the disclosure pattern, not an ARIA menu). Escape closes it
 * and returns focus to the button; a click or focus outside closes it. Outside clicks are found through
 * `composedPath()`, so the menu also works inside the Streamlit host's shadow root. */
export function DisclosureMenu({
  label,
  panelLabel,
  className,
  children,
}: {
  label: string;
  panelLabel: string;
  className: string;
  /** Items call `close()` before acting; a toggle may leave the panel open. */
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (root.current && !event.composedPath().includes(root.current)) setOpen(false);
    };
    const owner = root.current?.ownerDocument;
    owner?.addEventListener("pointerdown", outside);
    return () => owner?.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div
      className="disclosureMenu"
      ref={root}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        toggle.current?.focus();
      }}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (open && next instanceof Node && !event.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={toggle}
        type="button"
        className="menuToggle"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className={className} id={panelId} role="group" aria-label={panelLabel}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
