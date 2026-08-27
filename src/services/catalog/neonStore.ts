import { neon } from "@neondatabase/serverless";

import { createSqlCatalogStore } from "./sqlStore";
import type { CatalogStore } from "./store";

/**
 * The Neon adapter: a driver, and nothing else.
 *
 * All catalogue behaviour lives in `sqlStore.ts`, which takes a `SqlQuery` and
 * is therefore testable without credentials. Keeping this file down to the
 * driver call is what makes that possible — there is nothing here worth a test
 * that a live database would not be needed to run.
 *
 * `neon()` speaks HTTP rather than opening a socket, so it works unchanged in
 * `vite dev`, during SSR and in the deployed function.
 */
export function createNeonCatalogStore(connectionString: string): CatalogStore {
  const sql = neon(connectionString);

  return createSqlCatalogStore((text, params) => sql.query(text, params));
}
