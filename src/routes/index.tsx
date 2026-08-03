import { createFileRoute } from "@tanstack/react-router";
import { History, LayoutGrid, Star, Wifi } from "lucide-react";

import { ApplicationBrowser } from "@/components/ApplicationBrowser";
import { HeroCard } from "@/components/HeroCard";
import { StatCard } from "@/components/StatCard";
import { usePortalApplications } from "@/hooks/usePortalApplications";
import { usePortal } from "@/layouts/portal-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maharasa Portal — One Portal. Every Application." },
      {
        name: "description",
        content:
          "The single entry point to every Maharasa Group internal application: HRIS, IT Helpdesk, Finance, Production and more.",
      },
      { property: "og:title", content: "Maharasa Portal — One Portal. Every Application." },
      {
        property: "og:description",
        content: "The single entry point to every Maharasa Group internal application: HRIS, IT Helpdesk, Finance, Production and more.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { openCommandPalette } = usePortal();
  const { applications, favoriteApplications, recentApplications, isLoading, open, toggleFavorite } =
    usePortalApplications();

  const onlineCount = applications.filter((app) => app.status === "online").length;

  return (
    <div className="space-y-8">
      <HeroCard onOpenSearch={openCommandPalette} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Total Applications"
          value={applications.length}
          icon={LayoutGrid}
          hint="Available across all departments"
          isLoading={isLoading}
        />
        <StatCard
          index={1}
          label="Favorites"
          value={favoriteApplications.length}
          icon={Star}
          hint="Pinned for quick access"
          isLoading={isLoading}
        />
        <StatCard
          index={2}
          label="Recently Opened"
          value={recentApplications.length}
          icon={History}
          hint="Last 10 launches"
          isLoading={isLoading}
        />
        <StatCard
          index={3}
          label="Online Applications"
          value={onlineCount}
          icon={Wifi}
          hint="Systems reporting healthy"
          isLoading={isLoading}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">All Applications</h2>
          <p className="text-sm text-muted-foreground">
            Browse, filter and launch any Maharasa application.
          </p>
        </div>
        <ApplicationBrowser
          applications={applications}
          isLoading={isLoading}
          onOpen={open}
          onToggleFavorite={toggleFavorite}
        />
      </section>
    </div>
  );
}
