import type { ReactNode } from "react";
import { DisclosureMenu } from "../components/DisclosureMenu";
import { useTheme } from "../ThemeRoot";
import type { WorkspaceView } from "../workspaceSelectors";

export function BrandBar({ children }: { children?: ReactNode }) {
  return (
    <div className="workspaceBrand">
      <div className="wordmark">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path d="M2 5h13v4H2zm7 5h13v4H9zM2 15h13v4H2z" fill="currentColor" />
        </svg>
        <span>Spreadline</span>
      </div>
      <span className="workspaceType">
        Commercial underwriting <span>USD</span>
      </span>
      <div className="brandActions">{children}</div>
    </div>
  );
}

/** Open case doubles as the focus fallback (`data-focus-fallback`) when a dialog's opener has gone. */
export function PrimaryActions({
  showCases,
  canSave,
  onToggleCases,
  onSave,
}: {
  showCases: boolean;
  canSave: boolean;
  onToggleCases: () => void;
  onSave: (opener: HTMLElement) => void;
}) {
  return (
    <>
      <button type="button" data-focus-fallback aria-expanded={showCases} onClick={onToggleCases}>
        Open case
      </button>
      <button type="button" className="primary" disabled={!canSave} onClick={(event) => onSave(event.currentTarget)}>
        Save case
      </button>
    </>
  );
}

/** Less frequent actions: example cases, import, the theme and, outside the Streamlit host, disconnect. */
export function MoreMenu({
  onExample,
  onImport,
  onDisconnect,
}: {
  onExample: (mode: "dated" | "legacy") => void;
  onImport: () => void;
  onDisconnect?: () => void;
}) {
  const { theme, setTheme } = useTheme();
  return (
    <DisclosureMenu label="More" panelLabel="More actions" className="moreMenu">
      {(close) => (
        <>
          <div className="menuGroup">
            <button type="button" onClick={() => { close(); onExample("dated"); }}>
              Load example case
            </button>
            <button type="button" onClick={() => { close(); onExample("legacy"); }}>
              Load legacy example case
            </button>
            <button type="button" onClick={() => { close(); onImport(); }}>
              Import case file (JSON)
            </button>
          </div>
          <div className="menuGroup">
            <button
              type="button"
              className="themeToggle"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              Dark theme
            </button>
          </div>
          {onDisconnect && (
            <div className="menuGroup">
              <button type="button" onClick={() => { close(); onDisconnect(); }}>
                Disconnect workspace
              </button>
            </div>
          )}
        </>
      )}
    </DisclosureMenu>
  );
}

/** One h1 per view: the case name, its mode, whether it is saved, and the file or case it came from. */
export function CaseHeader({ view, filename, legacy }: { view: WorkspaceView; filename: string; legacy: boolean }) {
  return (
    <header className="caseHeader">
      <h1>{view.title}</h1>
      <div className="caseMeta">
        {view.modeLabel ? <span className="modeBadge">{view.modeLabel}</span> : <span className="pendingNote">{view.subtitle}</span>}
        {view.statusChip && (
          <span className="statusChip" data-saved={view.statusChip.startsWith("Draft") ? "false" : "true"}>
            {view.statusChip}
          </span>
        )}
        <span className="caseSource">{filename} · synthetic only</span>
      </div>
      {legacy && (
        <p className="legacyNote">Saving requires a separately imported dated assessment with explicit dates and units.</p>
      )}
    </header>
  );
}
