import { describe, expect, it } from "vitest";

import { selectAll, selectById, selectCategories, selectQuery } from "./applicationCatalog";

/**
 * Assertions are derived from the catalogue rather than naming specific
 * applications. Entries get added, renamed and commented out routinely; a test
 * that hardcodes `"helpdesk"` fails on a data edit even though the code is
 * fine, which is exactly what happened before.
 */
const catalogue = selectAll();
const first = catalogue[0];
if (!first) throw new Error("Catalogue is empty — every assertion below is derived from it.");

describe("applicationCatalog", () => {
  it("returns a non-empty catalogue with unique ids", () => {
    expect(catalogue.length).toBeGreaterThan(0);
    expect(new Set(catalogue.map((app) => app.id)).size).toBe(catalogue.length);
  });

  it("returns a copy, so a caller cannot mutate the seed data", () => {
    expect(selectAll()).not.toBe(selectAll());
  });

  it("looks an application up by id", () => {
    expect(selectById(first.id)).toMatchObject({ name: first.name });
    expect(selectById("does-not-exist")).toBeUndefined();
  });

  it("matches search terms against name, description and category", () => {
    expect(selectQuery({ search: first.name }).map((app) => app.id)).toContain(first.id);

    const word = first.description.split(" ").find((token) => token.length > 4);
    expect(word).toBeDefined();
    expect(selectQuery({ search: word! }).map((app) => app.id)).toContain(first.id);

    expect(selectQuery({ search: first.category }).map((app) => app.id)).toContain(first.id);
  });

  it("ignores case and surrounding whitespace in the search term", () => {
    const padded = `   ${first.name.toUpperCase()}  `;
    expect(selectQuery({ search: padded }).map((app) => app.id)).toContain(first.id);
  });

  it("returns nothing for a term that matches no application", () => {
    expect(selectQuery({ search: "zzz-no-such-application-zzz" })).toEqual([]);
  });

  it("combines category and status filters", () => {
    const results = selectQuery({ category: first.category, status: first.status });

    expect(results.map((app) => app.id)).toContain(first.id);
    expect(
      results.every((app) => app.category === first.category && app.status === first.status),
    ).toBe(true);
  });

  it("returns everything for an empty query", () => {
    expect(selectQuery({})).toHaveLength(catalogue.length);
  });

  it("exposes every category present in the catalogue", () => {
    const categories = selectCategories();
    for (const app of catalogue) {
      expect(categories).toContain(app.category);
    }
  });
});
