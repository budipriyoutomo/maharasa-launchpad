import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("explains the empty result and how to recover from it", () => {
    render(<EmptyState />);

    expect(screen.getByRole("heading", { name: "No applications found." })).toBeTruthy();
    expect(screen.getByText(/clear the active filters/i)).toBeTruthy();
  });

  it("takes a caller-supplied title and description", () => {
    render(
      <EmptyState title="No favorites yet" description="Pin an application to see it here." />,
    );

    expect(screen.getByRole("heading", { name: "No favorites yet" })).toBeTruthy();
    expect(screen.getByText("Pin an application to see it here.")).toBeTruthy();
  });

  /** `undefined` is what a parent passes through for an unset optional prop. */
  it("falls back to the defaults when a prop is explicitly undefined", () => {
    render(<EmptyState title={undefined} description={undefined} />);

    expect(screen.getByRole("heading", { name: "No applications found." })).toBeTruthy();
  });
});
