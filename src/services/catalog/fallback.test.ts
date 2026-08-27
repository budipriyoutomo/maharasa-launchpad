import { describe, expect, it, vi } from "vitest";

import { makeApplication } from "@/test/factories";

import { withSeedFallback } from "./fallback";
import type { CatalogStore } from "./store";

const seeded = [makeApplication({ id: "from-seed" })];

function seedStore(): CatalogStore {
  return {
    all: () => Promise.resolve(seeded),
    byId: (id) => Promise.resolve(seeded.find((app) => app.id === id)),
    query: () => Promise.resolve(seeded),
    categories: () => Promise.resolve(["IT"]),
  };
}

function brokenStore(): CatalogStore {
  const boom = () => Promise.reject(new Error("connection refused"));
  return { all: boom, byId: boom, query: boom, categories: boom };
}

function workingStore(): CatalogStore {
  const live = [makeApplication({ id: "from-database" })];
  return {
    all: () => Promise.resolve(live),
    byId: (id) => Promise.resolve(live.find((app) => app.id === id)),
    query: () => Promise.resolve(live),
    categories: () => Promise.resolve(["Finance"]),
  };
}

describe("withSeedFallback", () => {
  it("passes through to the primary store while it answers", async () => {
    const store = withSeedFallback(workingStore(), seedStore);

    expect((await store.all()).map((app) => app.id)).toEqual(["from-database"]);
  });

  it("serves the seed catalogue when the primary store fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = withSeedFallback(brokenStore(), seedStore);

    expect((await store.all()).map((app) => app.id)).toEqual(["from-seed"]);
  });

  it("falls back on every method, not only on all()", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = withSeedFallback(brokenStore(), seedStore);

    expect(await store.byId("from-seed")).toMatchObject({ id: "from-seed" });
    expect((await store.query({})).map((app) => app.id)).toEqual(["from-seed"]);
    expect(await store.categories()).toEqual(["IT"]);
  });

  it("reports the failure, so a silent outage cannot look like normal service", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = withSeedFallback(brokenStore(), seedStore);

    await store.all();

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("falling back to the seed catalogue"),
      expect.any(Error),
    );
  });

  it("lets a seed failure surface, because there is nothing left to fall back to", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = withSeedFallback(brokenStore(), () => {
      throw new Error("seed unavailable");
    });

    await expect(store.all()).rejects.toThrow(/seed unavailable/);
  });
});
