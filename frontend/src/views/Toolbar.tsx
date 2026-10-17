/** Case actions and import. The Saved cases button is the list's focus fallback (`data-focus-fallback`). */
export function Toolbar({
  filename,
  legacy,
  showCases,
  canSave,
  onDemo,
  onToggleCases,
  onSave,
  onUpload,
}: {
  filename: string;
  legacy: boolean;
  showCases: boolean;
  canSave: boolean;
  onDemo: (mode: "dated" | "legacy") => void;
  onToggleCases: () => void;
  onSave: (opener: HTMLElement) => void;
  onUpload: (file: File | undefined) => void;
}) {
  return (
    <div className="uploadbar">
      <div className="actions">
        <button onClick={() => onDemo("dated")}>Dated Alpine demo</button>
        <button onClick={() => onDemo("legacy")}>Legacy Alpine demo</button>
        <button
          data-focus-fallback
          aria-expanded={showCases}
          onClick={onToggleCases}
        >
          Saved cases
        </button>
        <button
          className="primary"
          disabled={!canSave}
          onClick={(event) => onSave(event.currentTarget)}
        >
          Save case
        </button>
      </div>
      <label>
        Import synthetic JSON{" "}
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            onUpload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      <span>{filename} · synthetic only</span>
      {legacy && (
        <span>
          Saving requires a separately imported dated assessment with explicit
          dates and units.
        </span>
      )}
    </div>
  );
}
