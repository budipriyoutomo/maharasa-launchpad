import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ApplicationGrid } from "@/components/ApplicationGrid";
import { FilterChips } from "@/components/FilterChips";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/data/applications";
import type { Application } from "@/types/application";

const BASE_FILTERS = ["All", "Favorites", "Recently Used"];

interface ApplicationBrowserProps {
  applications: Application[];
  isLoading: boolean;
  onOpen: (app: Application) => void;
  onToggleFavorite: (id: string) => void;
  showFilters?: boolean;
}

export function ApplicationBrowser({
  applications,
  isLoading,
  onOpen,
  onToggleFavorite,
  showFilters = true,
}: ApplicationBrowserProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (term) {
        const haystack = `${app.name} ${app.description} ${app.category}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filter === "Favorites") return app.favorite;
      if (filter === "Recently Used") return Boolean(app.lastOpened);
      if (filter !== "All") return app.category === filter;
      return true;
    });
  }, [applications, search, filter]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, description or category"
          className="h-10 rounded-xl bg-card pl-9"
        />
      </div>

      {showFilters ? (
        <FilterChips
          options={[...BASE_FILTERS, ...CATEGORIES]}
          value={filter}
          onChange={setFilter}
        />
      ) : null}

      <ApplicationGrid
        applications={filtered}
        isLoading={isLoading}
        onOpen={onOpen}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}
