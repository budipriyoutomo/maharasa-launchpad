import { Bell, CircleAlert, Info, Sparkles, TriangleAlert, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/types/notification";
import { formatRelative } from "@/utils/greeting";

const KIND_MAP: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  info: { icon: Info, tone: "bg-muted text-muted-foreground" },
  maintenance: {
    icon: TriangleAlert,
    tone: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
  incident: { icon: CircleAlert, tone: "bg-destructive/10 text-destructive-strong" },
  release: { icon: Sparkles, tone: "bg-primary-soft text-primary" },
};

export function NotificationMenu() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications, none unread"
          }
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg text-xs"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />

        {isLoading ? (
          <div className="space-y-3 p-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto py-1">
            {notifications.map((notification) => {
              const { icon: Icon, tone } = KIND_MAP[notification.kind];
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="flex w-full gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-hidden"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        tone,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            notification.read ? "font-normal" : "font-semibold",
                          )}
                        >
                          {notification.title}
                        </span>
                        {notification.read ? null : (
                          <span
                            aria-label="Unread"
                            className="size-1.5 shrink-0 rounded-full bg-accent"
                          />
                        )}
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                        {notification.body}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {formatRelative(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
