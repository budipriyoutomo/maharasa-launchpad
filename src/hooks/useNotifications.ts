import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { usePreferences } from "@/hooks/preferences-context";
import { notificationsQueryOptions } from "@/services/notificationService";
import type { PortalNotification } from "@/types/notification";

export interface NotificationView extends PortalNotification {
  read: boolean;
}

/**
 * Composes notification data with the per-device read state held by
 * `PreferencesProvider`.
 */
export function useNotifications() {
  const { data, isLoading } = useQuery(notificationsQueryOptions);
  const { readNotifications, markNotificationRead, markAllNotificationsRead } = usePreferences();

  const notifications = useMemo<NotificationView[]>(
    () => (data ?? []).map((n) => ({ ...n, read: readNotifications.includes(n.id) })),
    [data, readNotifications],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(
    () => markAllNotificationsRead(notifications.map((n) => n.id)),
    [notifications, markAllNotificationsRead],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: markNotificationRead,
    markAllRead,
  };
}
