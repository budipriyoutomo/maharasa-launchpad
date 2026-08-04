import type { PortalNotification } from "@/types/notification";

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/**
 * Seed notifications for Phase 1.
 *
 * A factory rather than a constant so the relative timestamps stay accurate for
 * the life of the tab. Phase 2 replaces this with an API payload.
 */
export function seedNotifications(): PortalNotification[] {
  return [
    {
      id: "n-portal-release",
      title: "Portal 1.0.0 released",
      body: "Favorites, recent history and command search are now available.",
      kind: "release",
      createdAt: minutesAgo(60 * 26),
    },
    {
      id: "n-payroll-info",
      title: "Payslips published",
      body: "This month's payslips are available in Payroll Center.",
      kind: "info",
      createdAt: minutesAgo(60 * 50),
      applicationId: "payroll",
    },
  ];
}
