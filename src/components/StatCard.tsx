import type { LucideIcon } from "lucide-react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  isLoading?: boolean;
  index?: number;
}

export function StatCard({ label, value, icon: Icon, hint, isLoading, index = 0 }: StatCardProps) {
  return (
    <div
      className="card-lift animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-4 h-8 w-16" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
          <AnimatedNumber value={value} />
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
