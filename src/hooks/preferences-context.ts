import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

export interface RecentEntry {
  id: string;
  openedAt: string;
}

/**
 * Every client-side user preference lives here, owned by a single provider.
 *
 * These values are backed by localStorage, and localStorage is global: if each
 * consumer kept its own `useState` copy, pinning an application in the grid
 * would not update the command palette, the stat cards, or the settings page
 * until those remounted.
 */
export interface PreferencesContextValue {
  theme: Theme;
  setTheme: (next: Theme | ((prev: Theme) => Theme)) => void;
  toggleTheme: () => void;
  themeHydrated: boolean;

  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  favoritesHydrated: boolean;

  recent: RecentEntry[];
  trackOpen: (id: string) => void;
  clearRecent: () => void;
  recentHydrated: boolean;

  readNotifications: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  notificationsHydrated: boolean;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside <PreferencesProvider>.");
  }
  return context;
}
