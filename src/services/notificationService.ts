import { seedNotifications } from "@/data/notifications";
import type { PortalNotification } from "@/types/notification";

/**
 * Data-access boundary for notifications.
 *
 * Mirrors `ApplicationService`: async now, local later swapped for `fetch()`.
 */
export interface INotificationService {
  getAll(): Promise<PortalNotification[]>;
}

class LocalNotificationService implements INotificationService {
  private readonly latency = 250;

  getAll(): Promise<PortalNotification[]> {
    const notifications = seedNotifications().sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

    return new Promise((resolve) => setTimeout(() => resolve(notifications), this.latency));
  }
}

export const NotificationService: INotificationService = new LocalNotificationService();

export const notificationsQueryOptions = {
  queryKey: ["notifications"] as const,
  queryFn: () => NotificationService.getAll(),
  staleTime: 60 * 1000,
};
