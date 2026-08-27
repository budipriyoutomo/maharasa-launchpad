import { z } from "zod";

import type { AppAuthConfig, AppCategory, Application } from "@/types/application";

import {
  applyQuery,
  assertUniqueIds,
  CATEGORY_ORDER,
  type CatalogQuery,
  type CatalogStore,
} from "./store";

/**
 * The narrowest thing this adapter needs from a database driver: run a
 * parameterised statement, hand back rows.
 *
 * Declaring it here rather than importing a driver keeps the adapter free of a
 * dependency and testable without a live database — the Neon serverless
 * driver's `sql.query(text, params)` already has this shape, so wiring it up is
 * one line at the call site.
 */
export type SqlQuery = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

/**
 * The catalogue is a couple of dozen rows that every page loads in full, so the
 * adapter reads them all and lets the shared `applyQuery` filter in memory.
 * That keeps one definition of what a search matches across every adapter; see
 * `src/test/catalogStoreContract.ts`.
 *
 * `sort_order` is explicit because display order is a product decision. Without
 * it Postgres is free to return rows in whatever order it finds convenient, and
 * the grid would reshuffle after an unrelated update.
 */
const SELECT_ALL = `
  select id, name, description, url, icon, category, status, favorite, color,
         last_opened, requires_auth, auth_provider, launch_type,
         auth, roles, permissions, sort_order
    from applications
   order by sort_order, name
`;

const authConfigSchema = z.object({
  clientId: z.string().nullish(),
  clientSecret: z.string().nullish(),
  realm: z.string().nullish(),
  redirectUri: z.string().nullish(),
  scopes: z.array(z.string()).optional(),
});

/**
 * A database row is untrusted input in exactly the way a request body is: it
 * was written by a migration, an admin panel or a person at a SQL prompt, and
 * any of them can put a typo in a status column. Parsing here means a bad row
 * fails loudly at the boundary instead of rendering as a broken card.
 */
const rowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  url: z.string().url(),
  icon: z.string().min(1),
  category: z.enum(CATEGORY_ORDER as [AppCategory, ...AppCategory[]]),
  status: z.enum(["online", "maintenance", "offline"]),
  favorite: z.boolean(),
  color: z.string().min(1),
  last_opened: z.string().nullable(),
  requires_auth: z.boolean(),
  auth_provider: z.enum(["keycloak", "azure_ad", "google", "custom_oidc"]).nullable(),
  launch_type: z.enum(["new_tab", "same_tab", "embedded"]),
  auth: authConfigSchema.nullish(),
  roles: z.array(z.string()).nullish(),
  permissions: z.array(z.string()).nullish(),
  sort_order: z.number().int(),
});

/**
 * `exactOptionalPropertyTypes` is on, so an absent optional field has to stay
 * absent rather than become an explicit `undefined`. Every optional key is
 * therefore spread in only when the row actually carried it, here and in
 * `toAuthConfig` — defaulting them to `null` instead would invent SSO
 * configuration that nobody wrote.
 */
function toAuthConfig(auth: z.infer<typeof authConfigSchema>): AppAuthConfig {
  return {
    ...(auth.clientId !== undefined ? { clientId: auth.clientId } : {}),
    ...(auth.clientSecret !== undefined ? { clientSecret: auth.clientSecret } : {}),
    ...(auth.realm !== undefined ? { realm: auth.realm } : {}),
    ...(auth.redirectUri !== undefined ? { redirectUri: auth.redirectUri } : {}),
    ...(auth.scopes !== undefined ? { scopes: auth.scopes } : {}),
  };
}

function toApplication(row: z.infer<typeof rowSchema>): Application {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    icon: row.icon,
    category: row.category,
    status: row.status,
    favorite: row.favorite,
    color: row.color,
    lastOpened: row.last_opened,
    requiresAuth: row.requires_auth,
    authProvider: row.auth_provider,
    launchType: row.launch_type,
    ...(row.auth ? { auth: toAuthConfig(row.auth) } : {}),
    ...(row.roles ? { roles: row.roles } : {}),
    ...(row.permissions ? { permissions: row.permissions } : {}),
  };
}

/** The id goes in the message so a rejected row can actually be found again. */
function parseRow(row: Record<string, unknown>, index: number): Application {
  const parsed = rowSchema.safeParse(row);

  if (!parsed.success) {
    const id = row["id"];
    const label = typeof id === "string" && id ? `"${id}"` : `at index ${index}`;
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "row"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid application row ${label} — ${issues}`);
  }

  return toApplication(parsed.data);
}

export function createSqlCatalogStore(query: SqlQuery): CatalogStore {
  async function all(): Promise<Application[]> {
    const rows = await query(SELECT_ALL);
    return assertUniqueIds(rows.map(parseRow));
  }

  return {
    all,

    async byId(id: string): Promise<Application | undefined> {
      return (await all()).find((app) => app.id === id);
    },

    async query(catalogQuery: CatalogQuery): Promise<Application[]> {
      return applyQuery(await all(), catalogQuery);
    },

    categories(): Promise<AppCategory[]> {
      return Promise.resolve([...CATEGORY_ORDER]);
    },
  };
}
