import type { AppCategory, Application, ApplicationQuery } from "@/types/application";

/**
 * The catalogue port.
 *
 * `applicationCatalog.ts` reads through this interface and nothing else, so the
 * seed file, a Postgres table or an upstream API are interchangeable behind it.
 * Every method is async because a remote store cannot be anything else; the
 * seed adapter simply resolves immediately.
 *
 * Adapters own retrieval only. Filtering and the duplicate-id guard live in the
 * pure helpers below so that every adapter shares one definition of what a
 * search term matches — see `src/test/catalogStoreContract.ts`, which holds
 * each adapter to the same behaviour.
 */
export interface CatalogStore {
  all(): Promise<Application[]>;
  byId(id: string): Promise<Application | undefined>;
  query(query: CatalogQuery): Promise<Application[]>;
  /** Canonical display order for category filters and groupings. */
  categories(): Promise<AppCategory[]>;
}

/**
 * Query as it arrives from the wire. `exactOptionalPropertyTypes` is on, so a
 * validated payload — where an absent key materialises as an explicit
 * `undefined` — does not satisfy `ApplicationQuery`. This tolerates both.
 */
export type CatalogQuery = {
  [K in keyof ApplicationQuery]?: ApplicationQuery[K] | undefined;
};

/**
 * Canonical display order for category filters and groupings.
 *
 * Every adapter answers `categories()` from this one list. Keeping it here
 * rather than beside the seed data is what stops the seed file and a database
 * from disagreeing about which categories exist, or about the order the filter
 * chips appear in — a difference users would see as the UI rearranging itself
 * the day the store is swapped.
 */
export const CATEGORY_ORDER: readonly AppCategory[] = [
  "Human Resource",
  "IT",
  "Finance",
  "Production",
  "Warehouse",
  "Operations",
  "Sales",
  "Management",
  "Administration",
];

/**
 * Duplicate ids silently break favorites, recent history and React keys, and
 * the symptom shows up far from the cause. Applied by every adapter, so a
 * database or API payload gets the same guard as the seed data.
 */
export function assertUniqueIds(applications: Application[]): Application[] {
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

/**
 * Filtering stays in memory on purpose. The catalogue is a couple of dozen rows
 * that every page already loads in full, so pushing the filter into SQL would
 * buy nothing and would let two adapters drift apart on what a search matches.
 */
export function applyQuery(applications: Application[], query: CatalogQuery): Application[] {
  return applications.filter((app) => matches(app, query));
}
