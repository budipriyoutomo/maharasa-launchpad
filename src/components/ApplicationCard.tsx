import { ExternalLink, Star } from "lucide-react";

import { AppIcon } from "@/components/AppIcon";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Application } from "@/types/application";
import { formatRelative } from "@/utils/greeting";

interface ApplicationCardProps {
  app: Application;
  onOpen: (app: Application) => void;
  onToggleFavorite: (id: string) => void;
  index?: number;
}

export function ApplicationCard({
  app,
  onOpen,
  onToggleFavorite,
  index = 0,
}: ApplicationCardProps) {
  return (
    <article
      className="card-lift group animate-fade-up relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${app.color}1A`, color: app.color }}
        >
          <AppIcon name={app.icon} className="size-5" />
        </div>
        <button
          type="button"
          aria-label={app.favorite ? `Unpin ${app.name}` : `Pin ${app.name}`}
          onClick={() => onToggleFavorite(app.id)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
        >
          <Star className={cn("size-4", app.favorite && "fill-warning text-warning")} />
        </button>
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight">{app.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{app.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {app.category}
        </span>
        <StatusBadge status={app.status} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-[11px] text-muted-foreground">{formatRelative(app.lastOpened)}</span>
        <Button
          size="sm"
          onClick={() => onOpen(app)}
          disabled={app.status === "offline"}
          className="gap-1.5 rounded-lg"
        >
          Open
          <ExternalLink className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}
