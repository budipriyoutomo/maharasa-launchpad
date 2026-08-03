import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";

import { PreferencesProvider } from "./PreferencesProvider";
import { useFavorites } from "./useFavorites";
import { useRecentApps } from "./useRecentApps";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </QueryClientProvider>
  );
}

/** Two consumers under one provider — the shape that used to desync. */
const useTwoConsumers = () => ({ a: useFavorites(), b: useFavorites() });

describe("useFavorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("seeds from the application defaults on a device with no stored favorites", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.favorites.length).toBeGreaterThan(0));
    expect(result.current.favorites).toContain("hris");
  });

  it("does not re-seed a device that deliberately cleared its favorites", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify([]));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    // Give the seeding effect a chance to run before asserting it did not.
    await act(() => new Promise((resolve) => setTimeout(resolve, 500)));

    expect(result.current.favorites).toEqual([]);
  });

  it("keeps user pins when applications are pinned or unpinned", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify(["hris"]));

    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.favorites).toEqual(["hris"]));

    act(() => result.current.toggleFavorite("finance"));
    expect(result.current.favorites).toEqual(["hris", "finance"]);
    expect(result.current.isFavorite("finance")).toBe(true);

    act(() => result.current.toggleFavorite("hris"));
    expect(result.current.favorites).toEqual(["finance"]);
    expect(result.current.isFavorite("hris")).toBe(false);
  });

  it("clears every pin at once", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify(["hris", "finance", "cmms"]));

    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.favorites).toHaveLength(3));

    act(() => result.current.clearFavorites());

    expect(result.current.favorites).toEqual([]);
    expect(window.localStorage.getItem("maharasa.favorites")).toBe("[]");
  });

  it("shares one state across every consumer of the provider", async () => {
    window.localStorage.setItem("maharasa.favorites", JSON.stringify([]));

    const { result } = renderHook(useTwoConsumers, { wrapper });
    await waitFor(() => expect(result.current.a.hydrated).toBe(true));

    act(() => result.current.a.toggleFavorite("helpdesk"));

    expect(result.current.b.favorites).toEqual(["helpdesk"]);
    expect(result.current.b.isFavorite("helpdesk")).toBe(true);
  });
});

describe("useRecentApps", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("records launches newest first", async () => {
    const { result } = renderHook(() => useRecentApps(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.trackOpen("hris"));
    act(() => result.current.trackOpen("finance"));

    expect(result.current.recent.map((e) => e.id)).toEqual(["finance", "hris"]);
  });

  it("moves a re-opened application back to the front without duplicating it", async () => {
    const { result } = renderHook(() => useRecentApps(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.trackOpen("hris"));
    act(() => result.current.trackOpen("finance"));
    act(() => result.current.trackOpen("hris"));

    expect(result.current.recent.map((e) => e.id)).toEqual(["hris", "finance"]);
  });

  it("caps the history at ten entries", async () => {
    const { result } = renderHook(() => useRecentApps(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    for (let i = 0; i < 14; i += 1) {
      act(() => result.current.trackOpen(`app-${i}`));
    }

    expect(result.current.recent).toHaveLength(10);
    expect(result.current.recent[0]?.id).toBe("app-13");
    expect(result.current.recent.at(-1)?.id).toBe("app-4");
  });

  it("clears the history", async () => {
    const { result } = renderHook(() => useRecentApps(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.trackOpen("hris"));
    act(() => result.current.clearRecent());

    expect(result.current.recent).toEqual([]);
  });
});
