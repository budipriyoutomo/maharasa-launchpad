import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentApps } from "@/hooks/useRecentApps";
import { useTheme } from "@/hooks/useTheme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Maharasa Portal" },
      {
        name: "description",
        content: "Manage your Maharasa Portal appearance and locally stored preferences.",
      },
      { property: "og:title", content: "Settings — Maharasa Portal" },
      { property: "og:description", content: "Appearance and preference settings for the portal." },
    ],
  }),
  component: SettingsPage,
});

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { clearRecent } = useRecentApps();
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        description="Portal preferences. More configuration options arrive with the admin panel."
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Appearance
        </h2>
        <div className="mt-2">
          <SettingsRow title="Dark mode" description="Remembered on this device.">
            <div className="flex items-center gap-2">
              <Label htmlFor="theme-switch" className="sr-only">
                Dark mode
              </Label>
              <Switch id="theme-switch" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </SettingsRow>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Local data
        </h2>
        <div className="mt-2">
          <SettingsRow
            title="Recently used history"
            description="Clear the list of applications you recently opened."
          >
            <Button variant="outline" className="rounded-xl" onClick={clearRecent}>
              Clear history
            </Button>
          </SettingsRow>
          <SettingsRow
            title="Favorites"
            description={`${favorites.length} application(s) pinned on this device.`}
          >
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={favorites.length === 0}
              onClick={() => favorites.forEach((id) => toggleFavorite(id))}
            >
              Reset favorites
            </Button>
          </SettingsRow>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
        Organisation-level settings — application management, categories, status and single sign-on
        — will be available here once the admin panel is enabled.
      </div>
    </div>
  );
}
