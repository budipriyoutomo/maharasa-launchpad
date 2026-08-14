import { APPLICATIONS, CATEGORIES } from "@/data/applications";
import type { AppCategory, Application, ApplicationQuery } from "@/types/application";

/**
 * Server-side catalogue reads.
 *
 * This module is the only thing that touches the seed data, and it is loaded
 * exclusively from inside the server-function handlers in
 * `applicationService.ts` — never from a component, a hook, or the client
 * bundle. Keeping the selectors pure and free of `createServerFn` is what makes
 * them testable under plain Vitest, which does not run the TanStack Start
 * plugin.
 *
 * Phase 2 swaps the bodies here for a database or upstream API call; the
 * signatures are the contract the server functions expose.
 */

/**
 * Duplicate ids silently break favorites, recent history and React keys, and
 * the symptom shows up far from the cause. Checked on the server so a future
 * API or database payload gets the same guard as the seed data.
 */
function assertUniqueIds(applications: Application[]): Application[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const app of applications) {
    if (seen.has(app.id)) duplicates.add(app.id);
    seen.add(app.id);
  }

  if (duplicates.size > 0) {
    const message = `Duplicate application id(s): ${[...duplicates].join(", ")}`;
    if (import.meta.env.DEV) throw new Error(message);
    console.error(message);
  }

  return applications;
}

/**
 * Query as it arrives from the wire. `exactOptionalPropertyTypes` is on, so a
 * validated payload — where an absent key materialises as an explicit
 * `undefined` — does not satisfy `ApplicationQuery`. This tolerates both.
 */
export type CatalogQuery = {
  [K in keyof ApplicationQuery]?: ApplicationQuery[K] | undefined;
};

function matches(app: Application, query: CatalogQuery): boolean {
  const term = query.search?.trim().toLowerCase();
  if (term) {
    const haystack = `${app.name} ${app.description} ${app.category}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  if (query.category && app.category !== query.category) return false;
  if (query.status && app.status !== query.status) return false;
  return true;
}

export function selectAll(): Application[] {
  return assertUniqueIds([...APPLICATIONS]);
}

export function selectById(id: string): Application | undefined {
  return APPLICATIONS.find((app) => app.id === id);
}

export function selectQuery(query: CatalogQuery): Application[] {
  return APPLICATIONS.filter((app) => matches(app, query));
}

/** Canonical display order for category filters and groupings. */
export function selectCategories(): AppCategory[] {
  return [...CATEGORIES];
}
