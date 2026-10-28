/** The workspace views in tab order. Spread is the initial view; a freshly evaluated dated case opens on Overview. */
export const workspaceTabs = [
  { key: "spread", label: "Spread" },
  { key: "overview", label: "Overview" },
  { key: "debt", label: "Debt & Loan" },
  { key: "global", label: "Global Cash Flow" },
  { key: "stress", label: "Stress Tests" },
  { key: "memo", label: "Credit Memo" },
  { key: "audit", label: "History & Audit" },
] as const;
export type WorkspaceTab = (typeof workspaceTabs)[number]["key"];
