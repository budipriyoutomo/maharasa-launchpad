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
      id: "n-qms-maintenance",
      title: "Quality Management under maintenance",
      body: "QMS is offline for a scheduled database upgrade until 18:00 WIB.",
      kind: "maintenance",
      createdAt: minutesAgo(25),
      applicationId: "qms",
    },
    {
      id: "n-kds-incident",
      title: "Kitchen Display unreachable",
      body: "The outlet display service is down. IT is investigating.",
      kind: "incident",
      createdAt: minutesAgo(95),
      applicationId: "kitchen-display",
    },
    {
      id: "n-recruitment-maintenance",
      title: "Recruitment paused for migration",
      body: "Candidate data is being migrated. Read-only access resumes tomorrow.",
      kind: "maintenance",
      createdAt: minutesAgo(60 * 6),
      applicationId: "recruitment",
    },
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
