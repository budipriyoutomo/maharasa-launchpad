import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "maharasa.favorites";

export function useFavorites() {
  const [favorites, setFavorites, hydrated] = useLocalStorage<string[]>(KEY, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(
    (id: string) =>
      setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
    [setFavorites],
  );

  return { favorites, isFavorite, toggleFavorite, hydrated };
}
