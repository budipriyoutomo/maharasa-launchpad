import type { Application } from "@/types/application";
import type { PortalNotification } from "@/types/notification";

/**
 * Fixtures for unit tests.
 *
 * Specs build the exact shape they assert on instead of reaching into
 * `@/data/applications`: the seed catalogue is content, edited and commented out
 * routinely, and a test that depends on it fails on a data edit while the code
 * is fine. `applicationCatalog.test.ts` is the deliberate exception — it tests
 * the seed data itself, and derives its assertions from whatever is there.
 */
export function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: "test-app",
    name: "Test App",
    description: "An application used by the unit tests.",
    url: "https://example.test/app",
    icon: "LayoutGrid",
    category: "IT",
    status: "online",
    favorite: false,
    color: "#006400",
    lastOpened: null,
    requiresAuth: false,
    authProvider: null,
    launchType: "new_tab",
    ...overrides,
  };
}

export function makeNotification(overrides: Partial<PortalNotification> = {}): PortalNotification {
  return {
    id: "test-notification",
    title: "Test notification",
    body: "Something happened in the portal.",
    kind: "info",
    createdAt: new Date("2026-01-01T09:00:00Z").toISOString(),
    ...overrides,
  };
}
