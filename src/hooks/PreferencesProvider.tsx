import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  PreferencesContext,
  type PreferencesContextValue,
  type RecentEntry,
  type Theme,
} from "@/hooks/preferences-context";
import { applicationsQueryOptions } from "@/services/applicationService";

const THEME_KEY = "maharasa.theme";
const FAVORITES_KEY = "maharasa.favorites";
const RECENT_KEY = "maharasa.recent";
const READ_NOTIFICATIONS_KEY = "maharasa.notifications.read";
const MAX_RECENT = 10;

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const theme = useLocalStorage<Theme>(THEME_KEY, "light");
  const favorites = useLocalStorage<string[]>(FAVORITES_KEY, []);
  const recent = useLocalStorage<RecentEntry[]>(RECENT_KEY, []);
  const readNotifications = useLocalStorage<string[]>(READ_NOTIFICATIONS_KEY, []);

  const { data: applications } = useQuery(applicationsQueryOptions);

  useEffect(() => {
    if (!theme.hydrated) return;
    document.documentElement.classList.toggle("dark", theme.value === "dark");
  }, [theme.value, theme.hydrated]);

  /**
   * On a device that has never pinned anything, adopt the defaults declared in
   * the application data. Guarded by `hasStoredValue` so that a user who
   * deliberately unpins everything does not get the defaults back on reload.
   */
  const seeded = useRef(false);
  const setFavorites = favorites.set;
  useEffect(() => {
    if (seeded.current || !favorites.hydrated || favorites.hasStoredValue || !applications) return;
    seeded.current = true;

    const defaults = applications.filter((app) => app.favorite).map((app) => app.id);
    if (defaults.length > 0) setFavorites(defaults);
  }, [applications, favorites.hydrated, favorites.hasStoredValue, setFavorites]);

  const setTheme = theme.set;
  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    [setTheme],
  );

  const favoriteIds = favorites.value;
  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const toggleFavorite = useCallback(
    (id: string) =>
      setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
    [setFavorites],
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  const setRecent = recent.set;
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

  const setReadNotifications = readNotifications.set;
  const markNotificationRead = useCallback(
    (id: string) => setReadNotifications((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setReadNotifications],
  );

  const markAllNotificationsRead = useCallback(
    (ids: string[]) => setReadNotifications((prev) => Array.from(new Set([...prev, ...ids]))),
    [setReadNotifications],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      theme: theme.value,
      setTheme,
      toggleTheme,
      themeHydrated: theme.hydrated,

      favorites: favoriteIds,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      favoritesHydrated: favorites.hydrated,

      recent: recent.value,
      trackOpen,
      clearRecent,
      recentHydrated: recent.hydrated,

      readNotifications: readNotifications.value,
      markNotificationRead,
      markAllNotificationsRead,
      notificationsHydrated: readNotifications.hydrated,
    }),
    [
      theme.value,
      theme.hydrated,
      setTheme,
      toggleTheme,
      favoriteIds,
      favorites.hydrated,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      recent.value,
      recent.hydrated,
      trackOpen,
      clearRecent,
      readNotifications.value,
      readNotifications.hydrated,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
