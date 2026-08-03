import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

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
import { usePortalApplications } from "@/hooks/usePortalApplications";

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
  const { applications, open: launch } = usePortalApplications();

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

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search applications, categories or pages..." />
      <CommandList>
        <CommandEmpty>No applications found.</CommandEmpty>
        <CommandGroup heading="Applications">
          {applications.map((app) => (
            <CommandItem
              key={app.id}
              value={`${app.name} ${app.description} ${app.category}`}
              onSelect={() => {
                onOpenChange(false);
                launch(app);
              }}
            >
              <AppIcon name={app.icon} className="size-4" style={{ color: app.color }} />
              <span>{app.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{app.category}</span>
            </CommandItem>
          ))}
        </CommandGroup>
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
