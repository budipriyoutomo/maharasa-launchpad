import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string | undefined;
  description?: string | undefined;
}


export function EmptyState({
  title = "No applications found.",
  description = "Try a different keyword or clear the active filters.",
}: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="relative flex size-20 items-center justify-center rounded-full bg-primary-soft">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/5" />
        <SearchX className="size-8 text-primary" />
      </div>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
