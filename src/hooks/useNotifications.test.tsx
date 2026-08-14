import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { makeNotification } from "@/test/factories";

/** Pulled in by `PreferencesProvider`; a server-function module in real life. */
vi.mock("@/services/applicationService", () => ({
  applicationsQueryOptions: {
    queryKey: ["applications"] as const,
    queryFn: async () => [],
    staleTime: 0,
  },
}));

const NOTIFICATIONS = [
  makeNotification({ id: "n-1", title: "Portal released", kind: "release" }),
  makeNotification({ id: "n-2", title: "Payslips published" }),
];

vi.mock("@/services/notificationService", () => ({
  notificationsQueryOptions: {
    queryKey: ["notifications"] as const,
    queryFn: async () => NOTIFICATIONS,
    staleTime: 0,
  },
}));

import { PreferencesProvider } from "./PreferencesProvider";
import { useNotifications } from "./useNotifications";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </QueryClientProvider>
  );
}

const renderNotifications = async () => {
  const view = renderHook(() => useNotifications(), { wrapper });
  await waitFor(() => expect(view.result.current.notifications).toHaveLength(NOTIFICATIONS.length));
  return view;
};

describe("useNotifications", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("treats everything as unread on a device that has read nothing", async () => {
    const { result } = await renderNotifications();

    expect(result.current.notifications.every((n) => !n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(2);
  });

  it("composes the payload with the read state stored on the device", async () => {
    window.localStorage.setItem("maharasa.notifications.read", JSON.stringify(["n-1"]));

    const { result } = await renderNotifications();

    expect(result.current.notifications.find((n) => n.id === "n-1")?.read).toBe(true);
    expect(result.current.notifications.find((n) => n.id === "n-2")?.read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  it("marks one notification read", async () => {
    const { result } = await renderNotifications();

    act(() => result.current.markRead("n-2"));

    expect(result.current.notifications.find((n) => n.id === "n-2")?.read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it("does not record the same notification twice", async () => {
    const { result } = await renderNotifications();

    act(() => result.current.markRead("n-1"));
    act(() => result.current.markRead("n-1"));

    expect(JSON.parse(window.localStorage.getItem("maharasa.notifications.read") ?? "[]")).toEqual([
      "n-1",
    ]);
  });

  it("clears the badge in one action", async () => {
    const { result } = await renderNotifications();

    act(() => result.current.markAllRead());

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it("keeps the read state a device already had when marking all read", async () => {
    window.localStorage.setItem("maharasa.notifications.read", JSON.stringify(["n-retired"]));

    const { result } = await renderNotifications();
    act(() => result.current.markAllRead());

    expect(
      JSON.parse(window.localStorage.getItem("maharasa.notifications.read") ?? "[]").sort(),
    ).toEqual(["n-1", "n-2", "n-retired"]);
  });
});
