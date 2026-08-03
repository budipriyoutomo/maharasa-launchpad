import { Search } from "lucide-react";
import { useMemo } from "react";

import { ApplicationGrid } from "@/components/ApplicationGrid";
import { FilterChips } from "@/components/FilterChips";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useCategories";
import type { Application } from "@/types/application";

export const ALL_FILTER = "All";
const BASE_FILTERS = [ALL_FILTER, "Favorites", "Recently Used"];

interface ApplicationBrowserProps {
  applications: Application[];
  isLoading: boolean;
  onOpen: (app: Application) => void;
  onToggleFavorite: (id: string) => void;
  /** Controlled by the caller so the view can be reflected in the URL. */
  search: string;
  filter: string;
  onSearchChange: (search: string) => void;
  onFilterChange: (filter: string) => void;
}

export function ApplicationBrowser({
  applications,
  isLoading,
  onOpen,
  onToggleFavorite,
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: ApplicationBrowserProps) {
  const { categories } = useCategories();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (term) {
        const haystack = `${app.name} ${app.description} ${app.category}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filter === "Favorites") return app.favorite;
      if (filter === "Recently Used") return Boolean(app.lastOpened);
      if (filter !== ALL_FILTER) return app.category === filter;
      return true;
    });
  }, [applications, search, filter]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <label htmlFor="application-search" className="sr-only">
          Search applications
        </label>
        <Input
          id="application-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, description or category"
          className="h-10 rounded-xl bg-card pl-9"
        />
      </div>

      <FilterChips
        options={[...BASE_FILTERS, ...categories]}
        value={filter}
        onChange={onFilterChange}
      />

      <ApplicationGrid
        applications={filtered}
        isLoading={isLoading}
        onOpen={onOpen}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}
