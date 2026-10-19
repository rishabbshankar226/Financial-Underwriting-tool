import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";

export type TabDefinition<K extends string> = { key: K; label: string };

/** WAI-ARIA tabs with a roving tabindex: arrows move between tabs (wrapping), Home and End jump to the ends,
 * and moving focus selects the tab. Only the selected panel is rendered, so inactive views stay unmounted. */
export function Tabs<K extends string>({
  label,
  tabs,
  selected,
  onSelect,
  children,
}: {
  label: string;
  tabs: readonly TabDefinition<K>[];
  selected: K;
  onSelect: (key: K) => void;
  children: ReactNode;
}) {
  const id = useId();
  const buttons = useRef(new Map<K, HTMLButtonElement>());
  const tabId = (key: K) => `${id}tab-${key}`,
    panelId = `${id}panel`;
  function choose(key: K) {
    onSelect(key);
    const button = buttons.current.get(key);
    button?.focus();
    button?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.key === selected);
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    choose(tabs[next].key);
  }
  return (
    <>
      <div className="workspaceTabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const active = tab.key === selected;
          return (
            <button
              key={tab.key}
              ref={(element) => {
                if (element) buttons.current.set(tab.key, element);
                else buttons.current.delete(tab.key);
              }}
              type="button"
              role="tab"
              id={tabId(tab.key)}
              aria-selected={active}
              aria-controls={active ? panelId : undefined}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="tabPanel" role="tabpanel" id={panelId} aria-labelledby={tabId(selected)} tabIndex={0}>
        {children}
      </div>
    </>
  );
}
