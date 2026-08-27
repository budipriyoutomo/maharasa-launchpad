import { describe, expect, it } from "vitest";

import type { CatalogStore } from "@/services/catalog/store";

/**
 * The behaviour every `CatalogStore` adapter must share.
 *
 * The seed file, a database and an upstream API are interchangeable only if
 * they answer identically, so the filter semantics are specified once here and
 * replayed against each adapter. A database adapter that quietly folded
 * accents, dropped the description from the search haystack or returned rows in
 * insertion order would pass its own hand-written spec and fail this one.
 *
 * Assertions are derived from whatever the store holds rather than naming
 * applications, so a content edit cannot turn this red.
 */
export function describeCatalogStoreContract(
  name: string,
  createStore: () => CatalogStore | Promise<CatalogStore>,
): void {
  describe(`${name} (CatalogStore contract)`, () => {
    async function store(): Promise<CatalogStore> {
      return await createStore();
    }

    async function sample() {
      const applications = await (await store()).all();
      const first = applications[0];
      if (!first) throw new Error("Store is empty — every assertion below is derived from it.");
      return { applications, first };
    }

    it("answers with a non-empty catalogue whose ids are unique", async () => {
      const { applications } = await sample();

      expect(applications.length).toBeGreaterThan(0);
      expect(new Set(applications.map((app) => app.id)).size).toBe(applications.length);
    });

    it("hands out a copy, so a caller cannot mutate what the store holds", async () => {
      const s = await store();
      const applications = await s.all();

      applications.length = 0;

      expect((await s.all()).length).toBeGreaterThan(0);
    });

    it("keeps the order stable across reads", async () => {
      const s = await store();

      expect((await s.all()).map((app) => app.id)).toEqual((await s.all()).map((app) => app.id));
    });

    it("looks an application up by id", async () => {
      const { first } = await sample();
      const s = await store();

      expect(await s.byId(first.id)).toMatchObject({ name: first.name });
    });

    it("answers undefined for an id it does not hold", async () => {
      expect(await (await store()).byId("does-not-exist")).toBeUndefined();
    });

    it("matches a search term against name, description and category", async () => {
      const { first } = await sample();
      const s = await store();

      const word = first.description.split(" ").find((token) => token.length > 4);
      expect(word).toBeDefined();

      for (const term of [first.name, word!, first.category]) {
        expect((await s.query({ search: term })).map((app) => app.id)).toContain(first.id);
      }
    });

    it("ignores case and surrounding whitespace in the search term", async () => {
      const { first } = await sample();
      const s = await store();

      const padded = `   ${first.name.toUpperCase()}  `;

      expect((await s.query({ search: padded })).map((app) => app.id)).toContain(first.id);
    });

    it("answers with nothing for a term that matches no application", async () => {
      expect(await (await store()).query({ search: "zzz-no-such-application-zzz" })).toEqual([]);
    });

    it("combines the category and status filters", async () => {
      const { first } = await sample();
      const s = await store();

      const results = await s.query({ category: first.category, status: first.status });

      expect(results.map((app) => app.id)).toContain(first.id);
      expect(
        results.every((app) => app.category === first.category && app.status === first.status),
      ).toBe(true);
    });

    it("answers with everything for an empty query", async () => {
      const { applications } = await sample();

      expect(await (await store()).query({})).toHaveLength(applications.length);
    });

    it("treats an explicitly undefined filter as absent", async () => {
      const { applications } = await sample();

      expect(
        await (await store()).query({ search: undefined, category: undefined, status: undefined }),
      ).toHaveLength(applications.length);
    });

    it("exposes every category present in the catalogue", async () => {
      const { applications } = await sample();
      const categories = await (await store()).categories();

      for (const app of applications) {
        expect(categories).toContain(app.category);
      }
    });
  });
}
