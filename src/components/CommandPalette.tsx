import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { AppIcon } from "@/components/AppIcon";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCategories } from "@/hooks/useCategories";
import { usePortalApplications } from "@/hooks/usePortalApplications";
import type { Application } from "@/types/application";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Applications", to: "/applications" },
  { label: "Favorites", to: "/favorites" },
  { label: "Recently Used", to: "/recent" },
  { label: "Categories", to: "/categories" },
  { label: "Settings", to: "/settings" },
  { label: "About", to: "/about" },
] as const;

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const {
    applications,
    favoriteApplications,
    recentApplications,
    open: launch,
  } = usePortalApplications();
  const { categories } = useCategories();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const byCategory = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          apps: applications.filter((app) => app.category === category),
        }))
        .filter((group) => group.apps.length > 0),
    [applications, categories],
  );

  /**
   * The same application can appear in several groups, so `value` is namespaced
   * to keep cmdk's selection unambiguous. Searchable text lives in `keywords`.
   */
  const renderApp = (group: string, app: Application) => (
    <CommandItem
      key={`${group}:${app.id}`}
      value={`${group}:${app.id}`}
      keywords={[app.name, app.description, app.category]}
      onSelect={() => {
        onOpenChange(false);
        launch(app);
      }}
    >
      <AppIcon name={app.icon} className="size-4" style={{ color: app.color }} />
      <span>{app.name}</span>
      <span className="ml-auto text-xs text-muted-foreground">{app.category}</span>
    </CommandItem>
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search applications, categories or pages..." />
      <CommandList>
        <CommandEmpty>No applications found.</CommandEmpty>

        {recentApplications.length > 0 ? (
          <CommandGroup heading="Recently Used">
            {recentApplications.slice(0, 5).map((app) => renderApp("recent", app))}
          </CommandGroup>
        ) : null}

        {favoriteApplications.length > 0 ? (
          <CommandGroup heading="Favorites">
            {favoriteApplications.map((app) => renderApp("favorite", app))}
          </CommandGroup>
        ) : null}

        {byCategory.map(({ category, apps }) => (
          <CommandGroup key={category} heading={category}>
            {apps.map((app) => renderApp(category, app))}
          </CommandGroup>
        ))}

        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.to}
              value={`Go to ${item.label}`}
              onSelect={() => {
                onOpenChange(false);
                void navigate({ to: item.to });
              }}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
