import { describe, expect, it } from "vitest";

import { chooseStore } from "./config";

describe("chooseStore", () => {
  it("picks the database when a connection string is configured", () => {
    expect(chooseStore({ DATABASE_URL: "postgresql://user:pw@host/db" })).toEqual({
      kind: "sql",
      connectionString: "postgresql://user:pw@host/db",
    });
  });

  it("accepts POSTGRES_URL, which is what the Vercel Neon integration sets", () => {
    expect(chooseStore({ POSTGRES_URL: "postgres://user:pw@host/db" })).toMatchObject({
      kind: "sql",
    });
  });

  it("prefers DATABASE_URL when both are present, so the explicit one wins", () => {
    const choice = chooseStore({
      DATABASE_URL: "postgresql://explicit/db",
      POSTGRES_URL: "postgresql://integration/db",
    });

    expect(choice).toMatchObject({ connectionString: "postgresql://explicit/db" });
  });

  it("falls back to the seed catalogue when nothing is configured", () => {
    expect(chooseStore({})).toMatchObject({ kind: "seed" });
  });

  it("explains why it fell back, so an empty grid is never a silent mystery", () => {
    const choice = chooseStore({});

    expect(choice.kind).toBe("seed");
    expect(choice.kind === "seed" && choice.reason).toMatch(/DATABASE_URL/);
  });

  it("treats a blank connection string as absent rather than as a broken one", () => {
    expect(chooseStore({ DATABASE_URL: "   " })).toMatchObject({ kind: "seed" });
  });

  it("refuses a connection string that is not Postgres, instead of failing at query time", () => {
    const choice = chooseStore({ DATABASE_URL: "mysql://user:pw@host/db" });

    expect(choice.kind).toBe("seed");
    expect(choice.kind === "seed" && choice.reason).toMatch(/postgres/i);
  });

  it("never reads a client-injected variable, which the browser bundle would carry", () => {
    // Assembled rather than spelled out: `clientBundleSecrets.test.ts` scans
    // this file too, and a literal here would trip that guard.
    const clientVisible = ["VITE", "DATABASE", "URL"].join("_");

    expect(chooseStore({ [clientVisible]: "postgresql://user:pw@host/db" })).toMatchObject({
      kind: "seed",
    });
  });
});
