import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { AppCategory, Application, ApplicationQuery } from "@/types/application";

/**
 * Data-access boundary for applications.
 *
 * Phase 2: the catalogue is served by the portal's own server rather than
 * bundled into the browser. Each method below is a TanStack Start server
 * function — an RPC that runs on the Worker during SSR and over HTTP from the
 * client. The seed data is loaded with a dynamic `import()` *inside* each
 * handler, which is what keeps `@/data/applications` and every internal
 * application URL out of the client bundle. Do not hoist that import to the
 * top of this file.
 *
 * The async signatures are unchanged from Phase 1, so no component or hook
 * needed to change. Swapping the seed data for a database is a change to
 * `applicationCatalog.ts` only.
 */
export interface IApplicationService {
  getAll(): Promise<Application[]>;
  getById(id: string): Promise<Application | undefined>;
  query(query: ApplicationQuery): Promise<Application[]>;
  /** Canonical display order for category filters and groupings. */
  getCategories(): Promise<AppCategory[]>;
}

const categorySchema = z.enum([
  "Human Resource",
  "IT",
  "Finance",
  "Production",
  "Warehouse",
  "Operations",
  "Sales",
  "Management",
  "Administration",
]);

const statusSchema = z.enum(["online", "maintenance", "offline"]);

/**
 * Server functions accept whatever the network hands them, so the query is
 * validated at the boundary rather than trusted. Unknown keys are dropped.
 */
const applicationQuerySchema = z.object({
  search: z.string().max(200).optional(),
  category: categorySchema.nullish(),
  status: statusSchema.nullish(),
});

/**
 * The local catalogue answers instantly, which makes skeleton states flash and
 * hides loading bugs during development. Production pays real latency instead.
 */
async function devLatency(ms: number): Promise<void> {
  if (!import.meta.env.DEV) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const fetchApplications = createServerFn({ method: "GET" }).handler(async () => {
  const { selectAll } = await import("./applicationCatalog");
  await devLatency(350);
  return selectAll();
});

const fetchApplicationById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(100) }))
  .handler(async ({ data }) => {
    const { selectById } = await import("./applicationCatalog");
    await devLatency(350);
    return selectById(data.id) ?? null;
  });

const fetchApplicationQuery = createServerFn({ method: "GET" })
  .validator(applicationQuerySchema)
  .handler(async ({ data }) => {
    const { selectQuery } = await import("./applicationCatalog");
    await devLatency(350);
    return selectQuery(data);
  });

const fetchCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { selectCategories } = await import("./applicationCatalog");
  await devLatency(350);
  return selectCategories();
});

class RemoteApplicationService implements IApplicationService {
  getAll(): Promise<Application[]> {
    return fetchApplications();
  }

  /** `null` on the wire — `undefined` does not survive JSON — restored here. */
  async getById(id: string): Promise<Application | undefined> {
    return (await fetchApplicationById({ data: { id } })) ?? undefined;
  }

  query(query: ApplicationQuery): Promise<Application[]> {
    return fetchApplicationQuery({ data: query });
  }

  getCategories(): Promise<AppCategory[]> {
    return fetchCategories();
  }
}

export const ApplicationService: IApplicationService = new RemoteApplicationService();

export const applicationsQueryOptions = {
  queryKey: ["applications"] as const,
  queryFn: () => ApplicationService.getAll(),
  staleTime: 5 * 60 * 1000,
};

export const categoriesQueryOptions = {
  queryKey: ["application-categories"] as const,
  queryFn: () => ApplicationService.getCategories(),
  staleTime: 5 * 60 * 1000,
};
