import { usePreferences } from "./preferences-context";

export type { Theme } from "./preferences-context";

/** Light/dark preference. State is owned by `PreferencesProvider`. */
export function useTheme() {
  const { theme, setTheme, toggleTheme, themeHydrated } = usePreferences();

  return { theme, setTheme, toggleTheme, hydrated: themeHydrated };
}
