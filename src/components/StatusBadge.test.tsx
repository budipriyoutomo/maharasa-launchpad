import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("labels every application status", () => {
    const { rerender } = render(<StatusBadge status="online" />);
    expect(screen.getByText("Online")).toBeTruthy();

    rerender(<StatusBadge status="maintenance" />);
    expect(screen.getByText("Maintenance")).toBeTruthy();

    rerender(<StatusBadge status="offline" />);
    expect(screen.getByText("Offline")).toBeTruthy();
  });

  /**
   * `--success` and `--destructive` are fill colors and fail contrast as text at
   * this size; the `-strong` tokens are the accessible variants. Asserted so a
   * later restyle cannot quietly drop back to the fill token.
   */
  it("uses the accessible text token, not the fill token", () => {
    const { container } = render(<StatusBadge status="online" />);
    const chip = container.firstElementChild;

    expect(chip?.className).toContain("text-success-strong");
  });

  it("merges a caller class over its own", () => {
    const { container } = render(<StatusBadge status="offline" className="px-4" />);

    expect(container.firstElementChild?.className).toContain("px-4");
    expect(container.firstElementChild?.className).not.toContain("px-2");
  });
});
