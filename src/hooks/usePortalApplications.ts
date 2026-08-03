import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { applicationsQueryOptions } from "@/services/applicationService";
import type { Application } from "@/types/application";
import { launchApplication } from "@/utils/launcher";
import { useFavorites } from "./useFavorites";
import { useRecentApps } from "./useRecentApps";

/**
 * Composes remote/local application data with the user's client-side
 * preferences (favorites, recent history) into a single view model.
 */
export function usePortalApplications() {
  const { data, isLoading } = useQuery(applicationsQueryOptions);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { recent, trackOpen, clearRecent } = useRecentApps();

  const applications = useMemo<Application[]>(() => {
    const source = data ?? [];
    const recentMap = new Map(recent.map((entry) => [entry.id, entry.openedAt]));
    return source
      .map((app) => ({
        ...app,
        favorite: isFavorite(app.id) || (favorites.length === 0 && app.favorite),
        lastOpened: recentMap.get(app.id) ?? null,
      }))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite));
  }, [data, favorites, isFavorite, recent]);

  const recentApplications = useMemo(
    () =>
      recent
        .map((entry) => applications.find((app) => app.id === entry.id))
        .filter((app): app is Application => Boolean(app)),
    [recent, applications],
  );

  const favoriteApplications = useMemo(
    () => applications.filter((app) => app.favorite),
    [applications],
  );

  const open = useCallback(
    (app: Application) => {
      trackOpen(app.id);
      launchApplication(app);
    },
    [trackOpen],
  );

  return {
    applications,
    favoriteApplications,
    recentApplications,
    isLoading,
    open,
    toggleFavorite,
    clearRecent,
  };
}
