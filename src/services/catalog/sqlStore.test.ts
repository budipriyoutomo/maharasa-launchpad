import { describe, expect, it, vi } from "vitest";

import { makeApplication } from "@/test/factories";
import { describeCatalogStoreContract } from "@/test/catalogStoreContract";
import type { Application } from "@/types/application";

import { CATEGORY_ORDER } from "./store";
import { createSqlCatalogStore, type SqlQuery } from "./sqlStore";

/** A row as Postgres hands it back: snake_case columns, JSON for the arrays. */
function toRow(app: Application, sortOrder: number): Record<string, unknown> {
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    url: app.url,
    icon: app.icon,
    category: app.category,
    status: app.status,
    favorite: app.favorite,
    color: app.color,
    last_opened: app.lastOpened,
    requires_auth: app.requiresAuth,
    auth_provider: app.authProvider,
    launch_type: app.launchType,
    auth: app.auth ?? null,
    roles: app.roles ?? null,
    permissions: app.permissions ?? null,
    sort_order: sortOrder,
  };
}

function fakeQuery(applications: Application[]): SqlQuery {
  return () => Promise.resolve(applications.map((app, index) => toRow(app, index)));
}

const catalogue = [
  makeApplication({ id: "alpha", name: "Alpha HR", category: "Human Resource" }),
  makeApplication({ id: "bravo", name: "Bravo Ledger", category: "Finance", status: "offline" }),
  makeApplication({ id: "charlie", name: "Charlie Desk", category: "IT" }),
];

describeCatalogStoreContract("sqlStore", () => createSqlCatalogStore(fakeQuery(catalogue)));

describe("sqlStore", () => {
  it("maps snake_case columns onto the domain shape", async () => {
    const app = makeApplication({
      id: "delta",
      lastOpened: "2026-08-01T09:00:00Z",
      requiresAuth: true,
      authProvider: "keycloak",
      launchType: "same_tab",
      auth: { clientId: "portal", realm: "maharasa" },
      roles: ["staff"],
      permissions: ["app.read"],
    });

    const store = createSqlCatalogStore(fakeQuery([app]));

    expect(await store.byId("delta")).toEqual(app);
  });

  it("keeps the order the query returned, so display order is the database's call", async () => {
    const store = createSqlCatalogStore(fakeQuery(catalogue));

    expect((await store.all()).map((app) => app.id)).toEqual(["alpha", "bravo", "charlie"]);
  });

  it("orders by the sort_order column rather than leaving it to the engine", async () => {
    const query = vi.fn<SqlQuery>(() => Promise.resolve([]));

    await createSqlCatalogStore(query).all();

    expect(query.mock.calls[0]?.[0]).toMatch(/order\s+by\s+sort_order/i);
  });

  it("rejects a row the database should never have held", async () => {
    const query: SqlQuery = () =>
      Promise.resolve([{ ...toRow(catalogue[0]!, 0), status: "on-fire" }]);

    await expect(createSqlCatalogStore(query).all()).rejects.toThrow(/status/i);
  });

  it("names the offending row, so a bad record is findable", async () => {
    const query: SqlQuery = () =>
      Promise.resolve([{ ...toRow(catalogue[0]!, 0), category: "Astrology" }]);

    await expect(createSqlCatalogStore(query).all()).rejects.toThrow(/alpha/);
  });

  it("answers with the canonical category order, not the order rows happen to arrive in", async () => {
    const store = createSqlCatalogStore(fakeQuery(catalogue));

    expect(await store.categories()).toEqual(CATEGORY_ORDER);
  });
});
