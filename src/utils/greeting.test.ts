import { describe, expect, it } from "vitest";

import { formatRelative, getGreeting } from "./greeting";

describe("getGreeting", () => {
  it("greets by time of day", () => {
    expect(getGreeting(new Date("2026-01-01T08:00:00"))).toBe("Good Morning");
    expect(getGreeting(new Date("2026-01-01T13:00:00"))).toBe("Good Afternoon");
    expect(getGreeting(new Date("2026-01-01T20:00:00"))).toBe("Good Evening");
  });

  it("puts the boundaries on the later greeting", () => {
    expect(getGreeting(new Date("2026-01-01T11:59:59"))).toBe("Good Morning");
    expect(getGreeting(new Date("2026-01-01T12:00:00"))).toBe("Good Afternoon");
    expect(getGreeting(new Date("2026-01-01T17:59:59"))).toBe("Good Afternoon");
    expect(getGreeting(new Date("2026-01-01T18:00:00"))).toBe("Good Evening");
  });
});

describe("formatRelative", () => {
  const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

  it("reports never for applications that were not opened", () => {
    expect(formatRelative(null)).toBe("Never opened");
  });

  it("scales the unit with the elapsed time", () => {
    expect(formatRelative(ago(5_000))).toBe("Just now");
    expect(formatRelative(ago(9 * 60_000))).toBe("9m ago");
    expect(formatRelative(ago(3 * 3_600_000))).toBe("3h ago");
    expect(formatRelative(ago(4 * 86_400_000))).toBe("4d ago");
  });
});
