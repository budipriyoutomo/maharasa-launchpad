import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { makeApplication } from "@/test/factories";

/**
 * `useCategories` reads through `applicationService`, which is a server-function
 * module the unit test config cannot load. Stubbing the hook also pins the chip
 * list, so editing the seed catalogue cannot break these tests.
 */
vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({ categories: ["IT", "Finance"], isLoading: false }),
}));

import { ALL_FILTER, ApplicationBrowser } from "./ApplicationBrowser";

const APPS = [
  makeApplication({
    id: "hris",
    name: "HRIS",
    description: "Employee data.",
    category: "Human Resource",
    favorite: true,
  }),
  makeApplication({
    id: "helpdesk",
    name: "IT Helpdesk",
    description: "Raise a ticket.",
    category: "IT",
    lastOpened: new Date().toISOString(),
  }),
  makeApplication({
    id: "finance",
    name: "Finance Suite",
    description: "Invoices and budgets.",
    category: "Finance",
  }),
];

/** Search and filter are controlled by the route so they can live in the URL. */
function Harness({ initialFilter = ALL_FILTER }: { initialFilter?: string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(initialFilter);

  return (
    <TooltipProvider>
      <ApplicationBrowser
        applications={APPS}
        isLoading={false}
        onOpen={vi.fn()}
        onToggleFavorite={vi.fn()}
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
    </TooltipProvider>
  );
}

const visibleApps = () =>
  screen
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent)
    .filter((name): name is string => Boolean(name));

const search = (term: string) =>
  fireEvent.change(screen.getByLabelText("Search applications"), { target: { value: term } });

describe("ApplicationBrowser", () => {
  it("shows every application by default", () => {
    render(<Harness />);

    expect(visibleApps()).toEqual(["HRIS", "IT Helpdesk", "Finance Suite"]);
  });

  it("offers the base filters ahead of the catalogue categories", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Favorites" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Recently Used" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Finance" })).toBeTruthy();
  });

  it("searches name, description and category", () => {
    render(<Harness />);

    search("helpdesk");
    expect(visibleApps()).toEqual(["IT Helpdesk"]);

    search("invoices");
    expect(visibleApps()).toEqual(["Finance Suite"]);

    search("human resource");
    expect(visibleApps()).toEqual(["HRIS"]);
  });

  it("ignores case and padding in the search term", () => {
    render(<Harness />);

    search("   HRIS  ");

    expect(visibleApps()).toEqual(["HRIS"]);
  });

  it("shows the empty state rather than a blank area for a term that matches nothing", () => {
    render(<Harness />);

    search("zzz-no-such-application");

    expect(screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "No applications found.",
    ]);
  });

  it("filters to pinned applications", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

    expect(visibleApps()).toEqual(["HRIS"]);
  });

  it("filters to applications this device has opened", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Recently Used" }));

    expect(visibleApps()).toEqual(["IT Helpdesk"]);
  });

  it("filters by category", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Finance" }));

    expect(visibleApps()).toEqual(["Finance Suite"]);
  });

  it("combines the search term with the active filter", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Favorites" }));
    search("finance");

    expect(screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "No applications found.",
    ]);
  });

  it("starts from the filter the caller restored from the URL", () => {
    render(<Harness initialFilter="IT" />);

    expect(visibleApps()).toEqual(["IT Helpdesk"]);
  });
});
