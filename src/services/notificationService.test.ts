import { describe, expect, it } from "vitest";

import { NotificationService, notificationsQueryOptions } from "./notificationService";

describe("NotificationService", () => {
  it("returns the notifications newest first", async () => {
    const notifications = await NotificationService.getAll();

    expect(notifications.length).toBeGreaterThan(0);

    const timestamps = notifications.map((n) => Date.parse(n.createdAt));
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("gives every notification the fields the dropdown renders", async () => {
    for (const notification of await NotificationService.getAll()) {
      expect(notification.id).toBeTruthy();
      expect(notification.title).toBeTruthy();
      expect(notification.body).toBeTruthy();
      expect(["info", "maintenance", "incident", "release"]).toContain(notification.kind);
      expect(Number.isNaN(Date.parse(notification.createdAt))).toBe(false);
    }
  });

  it("gives every notification a unique id, so read-state cannot collide", async () => {
    const ids = (await NotificationService.getAll()).map((n) => n.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  /** Timestamps are relative to now, so a long-lived tab must not go stale. */
  it("recomputes the payload on each call instead of freezing it at import time", async () => {
    const [first] = await NotificationService.getAll();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const [second] = await NotificationService.getAll();

    expect(first?.id).toBe(second?.id);
    expect(Date.parse(second!.createdAt)).toBeGreaterThan(Date.parse(first!.createdAt));
  });
});

describe("notificationsQueryOptions", () => {
  it("is keyed so the dropdown and the page share one cache entry", () => {
    expect(notificationsQueryOptions.queryKey).toEqual(["notifications"]);
  });

  it("reads through the service", async () => {
    const viaOptions = await notificationsQueryOptions.queryFn();

    expect(viaOptions.map((n) => n.id)).toEqual(
      (await NotificationService.getAll()).map((n) => n.id),
    );
  });
});
