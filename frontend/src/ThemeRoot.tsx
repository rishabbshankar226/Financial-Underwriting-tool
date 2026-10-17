import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { isEmbeddedWorkspace, preferenceStorage } from "./transport";

export type Theme = "light" | "dark";
const THEME_KEY = "spreadline.theme.v1";

function storedTheme(): Theme {
  try {
    return preferenceStorage()?.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function storeTheme(theme: Theme): void {
  try {
    preferenceStorage()?.setItem(THEME_KEY, theme);
  } catch {
    // An unstorable preference still applies for the rest of this page.
  }
}

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

/** Applies the chosen theme to everything inside it: light unless dark was chosen in this browser. */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(storedTheme);
  useLayoutEffect(() => {
    // Standalone pages also theme the document canvas; the Streamlit host keeps its own page.
    if (!isEmbeddedWorkspace()) document.documentElement.dataset.theme = theme;
  }, [theme]);
  function setTheme(next: Theme) {
    storeTheme(next);
    setThemeState(next);
  }
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="themeRoot" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeRoot");
  return context;
}
