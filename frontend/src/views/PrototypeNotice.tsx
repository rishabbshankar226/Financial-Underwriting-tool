import { useId, useState } from "react";
import { prototypeDisclaimer } from "../prototypeDisclaimer";

/** The disclaimer stays on screen in short form; the full text is one click away. */
export function PrototypeNotice() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="warning environmentWarning">
      <span>Prototype</span>
      <p>
        Synthetic data only. Not validated for lending decisions.{" "}
        <button
          type="button"
          className="linkButton"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          onClick={() => setOpen((value) => !value)}
        >
          Read full notice
        </button>
      </p>
      {open && (
        <p className="noticeDetail" id={id}>
          {prototypeDisclaimer}
        </p>
      )}
    </div>
  );
}
