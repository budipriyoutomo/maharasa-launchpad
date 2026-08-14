import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { makeApplication } from "@/test/factories";

const CATALOGUE = [
  makeApplication({ id: "cmms", name: "CMMS" }),
  makeApplication({ id: "hris", name: "HRIS", favorite: true }),
  makeApplication({ id: "finance", name: "Finance Suite" }),
];

/**
 * `applicationService` is a server-function RPC boundary that needs the
 * TanStack Start plugin, which the unit test config deliberately does not load.
 */
vi.mock("@/services/applicationService", () => ({
  applicationsQueryOptions: {
    queryKey: ["applications"] as const,
    queryFn: async () => CATALOGUE,
    staleTime: 0,
  },
}));

vi.mock("@/utils/launcher", () => ({ launchApplication: vi.fn() }));

import { launchApplication } from "@/utils/launcher";
import { PreferencesProvider } from "./PreferencesProvider";
import { usePortalApplications } from "./usePortalApplications";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </QueryClientProvider>
  );
}

const renderPortal = async () => {
  const view = renderHook(() => usePortalApplications(), { wrapper });
  await waitFor(() => expect(view.result.current.applications.length).toBe(CATALOGUE.length));
  return view;
};

describe("usePortalApplications", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("sorts pinned applications to the front", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify(["finance"]));

    const { result } = await renderPortal();

    expect(result.current.applications[0]?.id).toBe("finance");
    expect(result.current.favoriteApplications.map((app) => app.id)).toEqual(["finance"]);
  });

  /**
   * `app.favorite` from the catalogue is a seed default, not the truth. Once a
   * device has its own list, the stored list wins — otherwise unpinning a
   * default-pinned application would not survive a reload.
   */
  it("takes the pinned state from the device, not from the catalogue", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify(["cmms"]));

    const { result } = await renderPortal();
    const byId = (id: string) => result.current.applications.find((app) => app.id === id);

    expect(byId("cmms")?.favorite).toBe(true);
    expect(byId("hris")?.favorite).toBe(false);
  });

  it("projects the launch history onto lastOpened", async () => {
    const openedAt = new Date("2026-02-01T10:00:00.000Z").toISOString();
    window.localStorage.setItem("maharasa.favorites", JSON.stringify([]));
    window.localStorage.setItem("maharasa.recent", JSON.stringify([{ id: "hris", openedAt }]));

    const { result } = await renderPortal();
    const byId = (id: string) => result.current.applications.find((app) => app.id === id);

    expect(byId("hris")?.lastOpened).toBe(openedAt);
    expect(byId("cmms")?.lastOpened).toBeNull();
  });

  it("lists recent applications newest first", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify([]));

    const { result } = await renderPortal();

    act(() => result.current.open(CATALOGUE[0]!));
    act(() => result.current.open(CATALOGUE[2]!));

    expect(result.current.recentApplications.map((app) => app.id)).toEqual(["finance", "cmms"]);
  });

  it("drops history entries for applications that left the catalogue", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify([]));
    window.localStorage.setItem(
      "maharasa.recent",
      JSON.stringify([{ id: "retired-app", openedAt: new Date().toISOString() }]),
    );

    const { result } = await renderPortal();

    expect(result.current.recentApplications).toEqual([]);
  });

  it("records the launch and then hands off to the launcher", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify([]));

    const { result } = await renderPortal();
    const app = result.current.applications.find((a) => a.id === "hris")!;

    act(() => result.current.open(app));

    expect(launchApplication).toHaveBeenCalledWith(app);
    expect(result.current.recentApplications.map((a) => a.id)).toEqual(["hris"]);
  });

  it("reports loading before the catalogue arrives", () => {
    const { result } = renderHook(() => usePortalApplications(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.applications).toEqual([]);
  });
});
