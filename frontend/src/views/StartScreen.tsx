import { useId } from "react";

/** Shown after connecting when the tab has nothing to restore: nothing is evaluated until a choice is made.
 * Open saved case is the focus fallback while this screen is shown. */
export function StartScreen({
  showCases,
  onExample,
  onToggleCases,
  onImport,
}: {
  showCases: boolean;
  onExample: () => void;
  onToggleCases: () => void;
  onImport: () => void;
}) {
  const id = useId();
  const options = [
    {
      key: "example",
      title: "Try the example case",
      detail: "Alpine Fabrication: two fiscal years and a $500,000 ten-year term loan request.",
      onClick: onExample,
    },
    {
      key: "open",
      title: "Open saved case",
      detail: "Reopen a case saved on this server, at its latest or an earlier revision.",
      onClick: onToggleCases,
    },
    {
      key: "import",
      title: "Import case file (JSON)",
      detail: "A dated or legacy assessment request of up to 1,000,000 bytes.",
      onClick: onImport,
    },
  ];
  return (
    <section className="startScreen" aria-labelledby={`${id}title`}>
      <h1 id={`${id}title`}>Start a credit analysis</h1>
      <p className="startLead">Spread the borrower's statements, check coverage against the illustrative policy, and size the loan. Use synthetic data only.</p>
      <div className="startOptions">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            className="startOption"
            aria-label={option.title}
            aria-describedby={`${id}${option.key}`}
            data-focus-fallback={option.key === "open" ? "" : undefined}
            aria-expanded={option.key === "open" ? showCases : undefined}
            onClick={option.onClick}
          >
            <span className="startOptionTitle">{option.title}</span>
            <span className="startOptionDetail" id={`${id}${option.key}`}>
              {option.detail}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
