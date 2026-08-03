import { createFileRoute } from "@tanstack/react-router";

import { ApplicationGrid } from "@/components/ApplicationGrid";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { usePortalApplications } from "@/hooks/usePortalApplications";

export const Route = createFileRoute("/recent")({
  head: () => ({
    meta: [
      { title: "Recently Used — Maharasa Portal" },
      {
        name: "description",
        content: "The last ten Maharasa applications you opened, ready to relaunch.",
      },
      { property: "og:title", content: "Recently Used — Maharasa Portal" },
      {
        property: "og:description",
        content: "Your ten most recently opened Maharasa applications.",
      },
    ],
  }),
  component: RecentPage,
});

function RecentPage() {
  const { recentApplications, isLoading, open, toggleFavorite, clearRecent } =
    usePortalApplications();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recently Used"
        description="The last 10 applications you launched from this device."
        actions={
          recentApplications.length > 0 ? (
            <Button variant="outline" className="rounded-xl" onClick={clearRecent}>
              Clear history
            </Button>
          ) : null
        }
      />
      <ApplicationGrid
        applications={recentApplications}
        isLoading={isLoading}
        onOpen={open}
        onToggleFavorite={toggleFavorite}
        emptyTitle="No recent activity."
        emptyDescription="Applications you open will show up here automatically."
      />
    </div>
  );
}
