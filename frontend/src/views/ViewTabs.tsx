export const workspaceTabs = ["spread", "assumptions", "details", "memo", "history", "scenarios", "review"] as const;
export type WorkspaceTab = (typeof workspaceTabs)[number];

export function ViewTabs({
  tab,
  onSelect,
}: {
  tab: WorkspaceTab;
  onSelect: (tab: WorkspaceTab) => void;
}) {
  return (
    <nav className="workspaceNav" aria-label="Workspace views">
      {workspaceTabs.map((value) => (
        <button
          className={tab === value ? "active" : ""}
          aria-pressed={tab === value}
          aria-current={tab === value ? "page" : undefined}
          onClick={() => onSelect(value)}
          key={value}
        >
          {value === "scenarios" ? "Scenarios" : value === "review" ? "Review" : value}
        </button>
      ))}
    </nav>
  );
}
