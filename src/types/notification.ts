/**
 * Portal notifications.
 *
 * Same contract as `Application`: transport-agnostic, so Phase 2 can serve
 * these from the portal API without touching the dropdown.
 */

export type NotificationKind = "info" | "maintenance" | "incident" | "release";

export interface PortalNotification {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  /** ISO 8601. */
  createdAt: string;
  /** Optional deep link into the application this notification is about. */
  applicationId?: string;
}
