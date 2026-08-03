import { usePreferences } from "./preferences-context";

export type { RecentEntry } from "./preferences-context";

/** Launch history, newest first, capped at 10. State is owned by `PreferencesProvider`. */
export function useRecentApps() {
  const { recent, trackOpen, clearRecent, recentHydrated } = usePreferences();

  return { recent, trackOpen, clearRecent, hydrated: recentHydrated };
}
