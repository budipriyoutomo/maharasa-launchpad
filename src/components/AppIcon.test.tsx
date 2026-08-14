import { render } from "@testing-library/react";
import { LayoutGrid, Star } from "lucide-react";
import { describe, expect, it } from "vitest";

import { AppIcon } from "./AppIcon";

/**
 * Compared against a directly rendered icon rather than against a class name:
 * Lucide changes its generated markup between releases, but "resolves to the
 * same component" stays true.
 */
describe("AppIcon", () => {
  it("resolves a Lucide icon by the name held in application data", () => {
    const { container: byName } = render(<AppIcon name="Star" />);
    const { container: direct } = render(<Star />);

    expect(byName.innerHTML).toBe(direct.innerHTML);
  });

  it("falls back to a generic icon when the data names an icon that does not exist", () => {
    const { container: unknown } = render(<AppIcon name="NoSuchIcon" />);
    const { container: fallback } = render(<LayoutGrid />);

    expect(unknown.innerHTML).toBe(fallback.innerHTML);
  });

  it("forwards Lucide props", () => {
    const { container } = render(<AppIcon name="Star" className="size-5" aria-label="Pinned" />);
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("class")).toContain("size-5");
    expect(svg?.getAttribute("aria-label")).toBe("Pinned");
  });
});
