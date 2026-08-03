import { createFileRoute } from "@tanstack/react-router";

import { ApplicationGrid } from "@/components/ApplicationGrid";
import { PageHeader } from "@/components/PageHeader";
import { useCategories } from "@/hooks/useCategories";
import { usePortalApplications } from "@/hooks/usePortalApplications";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Maharasa Portal" },
      {
        name: "description",
        content:
          "Maharasa applications grouped by department: HR, IT, Finance, Production, Warehouse and more.",
      },
      { property: "og:title", content: "Categories — Maharasa Portal" },
      {
        property: "og:description",
        content: "Explore Maharasa internal applications grouped by department.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { applications, isLoading, open, toggleFavorite } = usePortalApplications();
  const { categories } = useCategories();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Categories"
        description="Applications grouped by the department that owns them."
      />
      {categories.map((category) => {
        const apps = applications.filter((app) => app.category === category);
        if (!isLoading && apps.length === 0) return null;
        return (
          <section key={category} className="space-y-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{category}</h2>
              <span className="text-sm text-muted-foreground">{apps.length} applications</span>
            </div>
            <ApplicationGrid
              applications={apps}
              isLoading={isLoading}
              onOpen={open}
              onToggleFavorite={toggleFavorite}
            />
          </section>
        );
      })}
    </div>
  );
}
