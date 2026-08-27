import { describeCatalogStoreContract } from "@/test/catalogStoreContract";

import { selectAll, selectById, selectCategories, selectQuery } from "./applicationCatalog";

/**
 * The facade is held to the same contract as the adapters it forwards to: if
 * `selectQuery` ever filtered differently from the store behind it, callers
 * would see one thing during SSR and another after a store swap.
 *
 * This runs against whichever adapter is active, which is the seed file today.
 * That makes it the one spec deliberately exercising the real catalogue —
 * every assertion is still derived from whatever the catalogue holds, never
 * from a named application.
 */
describeCatalogStoreContract("applicationCatalog", () => ({
  all: selectAll,
  byId: selectById,
  query: selectQuery,
  categories: selectCategories,
}));
