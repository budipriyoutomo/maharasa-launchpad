import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("rounded-xl", "border")).toBe("rounded-xl border");
  });

  it("drops falsy values so conditional classes stay inline", () => {
    const collapsed = false;

    expect(cn("base", collapsed && "hidden", undefined, null, "")).toBe("base");
  });

  it("lets a later Tailwind class win over an earlier one in the same group", () => {
    expect(cn("p-2", "p-5")).toBe("p-5");
    expect(cn("bg-card", "bg-primary")).toBe("bg-primary");
  });

  it("keeps classes from different groups", () => {
    expect(cn("px-2", "py-5")).toBe("px-2 py-5");
  });

  /** The `className` prop of every component in this repo relies on this. */
  it("gives a caller-supplied class the last word", () => {
    const component = (className?: string) => cn("rounded-2xl bg-card", className);

    expect(component("bg-muted")).toBe("rounded-2xl bg-muted");
    expect(component()).toBe("rounded-2xl bg-card");
  });

  it("accepts arrays and objects", () => {
    expect(cn(["flex", "gap-2"], { hidden: false, "text-sm": true })).toBe("flex gap-2 text-sm");
  });
});
