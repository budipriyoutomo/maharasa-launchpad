import { ApplicationCard } from "@/components/ApplicationCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application } from "@/types/application";

interface ApplicationGridProps {
  applications: Application[];
  isLoading?: boolean;
  onOpen: (app: Application) => void;
  onToggleFavorite: (id: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="size-11 rounded-xl" />
          <Skeleton className="mt-4 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <div className="mt-5 flex justify-between border-t border-border pt-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApplicationGrid({
  applications,
  isLoading,
  onOpen,
  onToggleFavorite,
  emptyTitle,
  emptyDescription,
}: ApplicationGridProps) {
  if (isLoading) return <GridSkeleton />;
  if (applications.length === 0)
    return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {applications.map((app, i) => (
        <ApplicationCard
          key={app.id}
          app={app}
          index={i}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
