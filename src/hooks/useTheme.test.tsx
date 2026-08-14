import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

/** Pulled in by `PreferencesProvider`; a server-function module in real life. */
vi.mock("@/services/applicationService", () => ({
  applicationsQueryOptions: {
    queryKey: ["applications"] as const,
    queryFn: async () => [],
    staleTime: 0,
  },
}));

import { PreferencesProvider } from "./PreferencesProvider";
import { useTheme } from "./useTheme";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </QueryClientProvider>
  );
}

const renderTheme = async () => {
  const view = renderHook(() => useTheme(), { wrapper });
  await waitFor(() => expect(view.result.current.hydrated).toBe(true));
  return view;
};

describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to light", async () => {
    const { result } = await renderTheme();

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("restores the theme this device chose", async () => {
    window.localStorage.setItem("maharasa.theme", JSON.stringify("dark"));

    const { result } = await renderTheme();

    expect(result.current.theme).toBe("dark");
    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
  });

  it("toggles between the two themes", async () => {
    const { result } = await renderTheme();

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists the choice for the next visit", async () => {
    const { result } = await renderTheme();

    act(() => result.current.setTheme("dark"));

    expect(window.localStorage.getItem("maharasa.theme")).toBe(JSON.stringify("dark"));
  });

  /**
   * `hydrated` exists so components can hold off rendering theme-dependent
   * markup until localStorage has been read. Rendering it earlier is a
   * hydration mismatch.
   */
  it("reports hydration so components can avoid a mismatch", async () => {
    const { result } = await renderTheme();

    expect(result.current.hydrated).toBe(true);
  });
});
