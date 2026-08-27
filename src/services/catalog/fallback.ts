import type { Application } from "@/types/application";

import type { CatalogStore } from "./store";

/**
 * Serve the seed catalogue when the primary store cannot answer.
 *
 * A portal that renders an empty grid during a database outage is worse than
 * one serving a slightly stale list: the applications it links to are still up,
 * and the catalogue changes by commit anyway. Failing closed would take the
 * whole company's launcher down for a problem in a database that only holds a
 * couple of dozen rows.
 *
 * This is safe precisely because nothing writes to the store yet. **Revisit it
 * when the Admin Panel lands** — from that point a fallback can silently hide
 * an administrator's edit, and showing stale data without saying so becomes the
 * wrong trade.
 */
export function withSeedFallback(
  primary: CatalogStore,
  loadSeedStore: () => CatalogStore | Promise<CatalogStore>,
): CatalogStore {
  async function fallback<T>(
    error: unknown,
    read: (store: CatalogStore) => Promise<T>,
  ): Promise<T> {
    console.error("Catalogue store failed, falling back to the seed catalogue.", error);
    return read(await loadSeedStore());
  }

  async function attempt<T>(read: (store: CatalogStore) => Promise<T>): Promise<T> {
    try {
      return await read(primary);
    } catch (error) {
      return fallback(error, read);
    }
  }

  return {
    all: (): Promise<Application[]> => attempt((store) => store.all()),
    byId: (id) => attempt((store) => store.byId(id)),
    query: (query) => attempt((store) => store.query(query)),
    categories: () => attempt((store) => store.categories()),
  };
}
