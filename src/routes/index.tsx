import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, History, LayoutGrid, Star, Wifi } from "lucide-react";

import { ApplicationGrid } from "@/components/ApplicationGrid";
import { HeroCard } from "@/components/HeroCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
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
        content:
          "The single entry point to every Maharasa Group internal application: HRIS, IT Helpdesk, Finance, Production and more.",
      },
    ],
  }),
  component: DashboardPage,
});

function SectionHeader({
  title,
  description,
  to,
  linkLabel,
}: {
  title: string;
  description: string;
  to: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="ghost" size="sm" className="rounded-lg">
        <Link to={to}>
          {linkLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function DashboardPage() {
  const { openCommandPalette } = usePortal();
  const {
    applications,
    favoriteApplications,
    recentApplications,
    isLoading,
    open,
    toggleFavorite,
  } = usePortalApplications();

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
        <SectionHeader
          title="Your favorites"
          description="The applications you pinned, first in line."
          to="/favorites"
          linkLabel="All favorites"
        />
        <ApplicationGrid
          applications={favoriteApplications.slice(0, 8)}
          isLoading={isLoading}
          onOpen={open}
          onToggleFavorite={toggleFavorite}
          emptyTitle="No favorites yet."
          emptyDescription="Pin an application with the star icon and it will appear here."
        />
      </section>

      {isLoading || recentApplications.length > 0 ? (
        <section className="space-y-4">
          <SectionHeader
            title="Recently used"
            description="Pick up where you left off."
            to="/recent"
            linkLabel="Full history"
          />
          <ApplicationGrid
            applications={recentApplications.slice(0, 4)}
            isLoading={isLoading}
            onOpen={open}
            onToggleFavorite={toggleFavorite}
          />
        </section>
      ) : null}

      {/* Exhaustive browsing lives on /applications — the dashboard stays a summary. */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Looking for something else?</h2>
          <p className="text-sm text-muted-foreground">
            Search, filter by department and launch any of the {applications.length} applications
            available to you.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/applications">
            Browse all applications
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
