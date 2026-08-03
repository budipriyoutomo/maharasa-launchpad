import { createFileRoute } from "@tanstack/react-router";

import { ApplicationBrowser } from "@/components/ApplicationBrowser";
import { PageHeader } from "@/components/PageHeader";
import { usePortalApplications } from "@/hooks/usePortalApplications";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Applications — Maharasa Portal" },
      {
        name: "description",
        content: "Browse and launch every internal Maharasa Group application from one directory.",
      },
      { property: "og:title", content: "Applications — Maharasa Portal" },
      {
        property: "og:description",
        content: "The complete directory of Maharasa Group internal applications.",
      },
    ],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { applications, isLoading, open, toggleFavorite } = usePortalApplications();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Every application available to you, filtered by category or status."
      />
      <ApplicationBrowser
        applications={applications}
        isLoading={isLoading}
        onOpen={open}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
