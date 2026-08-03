import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "maharasa.recent";
const MAX_RECENT = 10;

export interface RecentEntry {
  id: string;
  openedAt: string;
}

export function useRecentApps() {
  const [recent, setRecent, hydrated] = useLocalStorage<RecentEntry[]>(KEY, []);

  const trackOpen = useCallback(
    (id: string) =>
      setRecent((prev) =>
        [{ id, openedAt: new Date().toISOString() }, ...prev.filter((e) => e.id !== id)].slice(
          0,
          MAX_RECENT,
        ),
      ),
    [setRecent],
  );

  const clearRecent = useCallback(() => setRecent([]), [setRecent]);

  return { recent, trackOpen, clearRecent, hydrated };
}
