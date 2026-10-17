import { prototypeDisclaimer } from "../prototypeDisclaimer";

export function PrototypeNotice() {
  return (
    <div className="warning environmentWarning">
      <span>Prototype use</span>
      <p>{prototypeDisclaimer}</p>
    </div>
  );
}
