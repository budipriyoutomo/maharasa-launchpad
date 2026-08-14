import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterChips } from "./FilterChips";

const OPTIONS = ["All", "Favorites", "Recently Used", "IT"];

describe("FilterChips", () => {
  it("renders one chip per option", () => {
    render(<FilterChips options={OPTIONS} value="All" onChange={vi.fn()} />);

    expect(screen.getAllByRole("button")).toHaveLength(OPTIONS.length);
    for (const option of OPTIONS) {
      expect(screen.getByRole("button", { name: option })).toBeTruthy();
    }
  });

  it("reports the chosen option", () => {
    const onChange = vi.fn();
    render(<FilterChips options={OPTIONS} value="All" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

    expect(onChange).toHaveBeenCalledWith("Favorites");
  });

  it("reports a re-click on the active chip instead of swallowing it", () => {
    const onChange = vi.fn();
    render(<FilterChips options={OPTIONS} value="IT" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "IT" }));

    expect(onChange).toHaveBeenCalledWith("IT");
  });

  it("marks only the active chip", () => {
    render(<FilterChips options={OPTIONS} value="IT" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "IT" }).className).toContain("bg-primary");
    expect(screen.getByRole("button", { name: "All" }).className).not.toContain("bg-primary");
  });

  it("renders nothing for an empty option list", () => {
    render(<FilterChips options={[]} value="All" onChange={vi.fn()} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
