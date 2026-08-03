import { createFileRoute } from "@tanstack/react-router";

import { ApplicationGrid } from "@/components/ApplicationGrid";
import { PageHeader } from "@/components/PageHeader";
import { usePortalApplications } from "@/hooks/usePortalApplications";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Maharasa Portal" },
      {
        name: "description",
        content: "Your pinned Maharasa applications, always one click away.",
      },
      { property: "og:title", content: "Favorites — Maharasa Portal" },
      { property: "og:description", content: "Pinned Maharasa applications for quick access." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favoriteApplications, isLoading, open, toggleFavorite } = usePortalApplications();

  return (
    <div className="space-y-6">
      <PageHeader title="Favorites" description="Applications you pinned for quick access." />
      <ApplicationGrid
        applications={favoriteApplications}
        isLoading={isLoading}
        onOpen={open}
        onToggleFavorite={toggleFavorite}
        emptyTitle="No favorites yet."
        emptyDescription="Pin an application with the star icon and it will appear here."
      />
    </div>
  );
}
