import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ALL_FILTER, ApplicationBrowser } from "@/components/ApplicationBrowser";
import { PageHeader } from "@/components/PageHeader";
import { usePortalApplications } from "@/hooks/usePortalApplications";

/**
 * Search and filter live in the URL so a filtered view survives a refresh and
 * can be shared. Defaults are omitted from the query string to keep it clean.
 */
interface ApplicationSearch {
  q?: string;
  filter?: string;
}

function buildSearch(q: string, filter: string): ApplicationSearch {
  const next: ApplicationSearch = {};
  if (q.trim()) next.q = q;
  if (filter && filter !== ALL_FILTER) next.filter = filter;
  return next;
}

export const Route = createFileRoute("/applications")({
  validateSearch: (search: Record<string, unknown>): ApplicationSearch =>
    buildSearch(
      typeof search["q"] === "string" ? search["q"] : "",
      typeof search["filter"] === "string" ? search["filter"] : ALL_FILTER,
    ),
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
  const { q, filter } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const search = q ?? "";
  const activeFilter = filter ?? ALL_FILTER;

  const update = (nextSearch: string, nextFilter: string) =>
    void navigate({
      search: buildSearch(nextSearch, nextFilter),
      replace: true,
      resetScroll: false,
    });

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
        search={search}
        filter={activeFilter}
        onSearchChange={(next) => update(next, activeFilter)}
        onFilterChange={(next) => update(search, next)}
      />
    </div>
  );
}
