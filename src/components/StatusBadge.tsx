import { cn } from "@/lib/utils";
import type { AppStatus } from "@/types/application";

const STATUS_MAP: Record<AppStatus, { label: string; dot: string; chip: string }> = {
  online: {
    label: "Online",
    dot: "bg-success",
    chip: "bg-success/10 text-success border-success/20",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-warning",
    chip: "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
  },
  offline: {
    label: "Offline",
    dot: "bg-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function StatusBadge({ status, className }: { status: AppStatus; className?: string }) {
  const config = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        config.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
