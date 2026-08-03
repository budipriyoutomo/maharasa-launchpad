import { usePreferences } from "./preferences-context";

/** Pinned applications. State is owned by `PreferencesProvider`. */
export function useFavorites() {
  const { favorites, isFavorite, toggleFavorite, clearFavorites, favoritesHydrated } =
    usePreferences();

  return { favorites, isFavorite, toggleFavorite, clearFavorites, hydrated: favoritesHydrated };
}
