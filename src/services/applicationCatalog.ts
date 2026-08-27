import type { AppCategory, Application } from "@/types/application";

import { chooseStore } from "./catalog/config";
import { withSeedFallback } from "./catalog/fallback";
import type { CatalogQuery, CatalogStore } from "./catalog/store";

/**
 * Server-side catalogue reads.
 *
 * This module resolves which `CatalogStore` is active and forwards to it. It is
 * loaded exclusively from inside the server-function handlers in
 * `applicationService.ts` — never from a component, a hook, or the client
 * bundle — and it is free of `createServerFn`, which is what keeps it importable
 * under plain Vitest.
 *
 * Which adapter runs is decided by `chooseStore` from the environment, so the
 * seed file and Neon are the same code path with a different backing store.
 * The four selectors below are the contract the server functions expose and do
 * not change either way.
 */

export type { CatalogQuery } from "./catalog/store";

let active: Promise<CatalogStore> | null = null;

function loadSeedStore(): Promise<CatalogStore> {
  return import("./catalog/seedStore").then(({ createSeedCatalogStore }) =>
    createSeedCatalogStore(),
  );
}

/**
 * The adapter is chosen once per server instance and cached.
 *
 * Adapters are pulled in with a dynamic `import()` so a store the deployment
 * does not use is never loaded — which is also what keeps
 * `@/data/applications` out of any bundle that does not need it.
 *
 * A configured database is wrapped in `withSeedFallback`, so a database outage
 * degrades to a stale catalogue rather than to an empty grid. The reason for
 * running on the seed file is logged once at startup: an unconfigured
 * deployment silently serving seed data is how a missing environment variable
 * goes unnoticed for a month.
 */
async function createStore(): Promise<CatalogStore> {
  const choice = chooseStore(process.env);

  if (choice.kind === "seed") {
    console.info(`Catalogue: ${choice.reason}`);
    return loadSeedStore();
  }

  const { createNeonCatalogStore } = await import("./catalog/neonStore");
  return withSeedFallback(createNeonCatalogStore(choice.connectionString), loadSeedStore);
}

function resolveStore(): Promise<CatalogStore> {
  active ??= createStore();
  return active;
}

export async function selectAll(): Promise<Application[]> {
  return (await resolveStore()).all();
}

export async function selectById(id: string): Promise<Application | undefined> {
  return (await resolveStore()).byId(id);
}

export async function selectQuery(query: CatalogQuery): Promise<Application[]> {
  return (await resolveStore()).query(query);
}

/** Canonical display order for category filters and groupings. */
export async function selectCategories(): Promise<AppCategory[]> {
  return (await resolveStore()).categories();
}
