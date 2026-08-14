import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { makeApplication } from "@/test/factories";
import { ApplicationGrid } from "./ApplicationGrid";

const APPS = [
  makeApplication({ id: "hris", name: "HRIS" }),
  makeApplication({ id: "cmms", name: "CMMS" }),
];

const renderGrid = (props: Partial<Parameters<typeof ApplicationGrid>[0]> = {}) =>
  render(
    <TooltipProvider>
      <ApplicationGrid applications={APPS} onOpen={vi.fn()} onToggleFavorite={vi.fn()} {...props} />
    </TooltipProvider>,
  );

describe("ApplicationGrid", () => {
  it("renders a card per application", () => {
    renderGrid();

    expect(screen.getByRole("heading", { name: "HRIS" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "CMMS" })).toBeTruthy();
  });

  /** No blank screens: a pending load shows skeletons, never an empty state. */
  it("shows skeletons while loading, even if applications are already cached", () => {
    const { container } = renderGrid({ isLoading: true });

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "HRIS" })).toBeNull();
    expect(screen.queryByText(/No applications found/i)).toBeNull();
  });

  it("shows the empty state once loading has finished with no results", () => {
    renderGrid({ applications: [], isLoading: false });

    expect(screen.getByRole("heading", { name: "No applications found." })).toBeTruthy();
  });

  it("passes a caller-supplied empty message through", () => {
    renderGrid({
      applications: [],
      emptyTitle: "Nothing pinned yet",
      emptyDescription: "Star an application to pin it.",
    });

    expect(screen.getByRole("heading", { name: "Nothing pinned yet" })).toBeTruthy();
    expect(screen.getByText("Star an application to pin it.")).toBeTruthy();
  });
});
