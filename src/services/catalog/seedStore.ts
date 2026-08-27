import { APPLICATIONS } from "@/data/applications";
import type { AppCategory, Application } from "@/types/application";

import {
  applyQuery,
  assertUniqueIds,
  CATEGORY_ORDER,
  type CatalogQuery,
  type CatalogStore,
} from "./store";

/**
 * The seed-file adapter — the catalogue as it has always been, behind the port.
 *
 * This module is the only place allowed to import `@/data/applications`, and it
 * is reached exclusively through a dynamic `import()` inside a server-function
 * handler. That is what keeps every internal Maharasa URL out of the client
 * bundle; importing it from a component or a hook would ship the catalogue to
 * every visitor.
 *
 * It stays after the database adapter lands: it is the fallback when no
 * connection string is configured, which is what keeps `dev` and CI working
 * without a database.
 */
export function createSeedCatalogStore(): CatalogStore {
  return {
    all(): Promise<Application[]> {
      return Promise.resolve(assertUniqueIds([...APPLICATIONS]));
    },

    byId(id: string): Promise<Application | undefined> {
      return Promise.resolve(APPLICATIONS.find((app) => app.id === id));
    },

    query(query: CatalogQuery): Promise<Application[]> {
      return Promise.resolve(applyQuery([...APPLICATIONS], query));
    },

    categories(): Promise<AppCategory[]> {
      return Promise.resolve([...CATEGORY_ORDER]);
    },
  };
}
