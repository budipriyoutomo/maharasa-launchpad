import { APPLICATIONS } from "@/data/applications";
import type { Application, ApplicationQuery } from "@/types/application";

/**
 * Data-access boundary for applications.
 *
 * Phase 1 resolves everything from local seed data. Phase 2 swaps the bodies of
 * these methods for `fetch()` calls against the portal API — the async
 * signatures already match, so no UI component needs to change.
 */
export interface IApplicationService {
  getAll(): Promise<Application[]>;
  getById(id: string): Promise<Application | undefined>;
  query(query: ApplicationQuery): Promise<Application[]>;
}

function matches(app: Application, query: ApplicationQuery): boolean {
  const term = query.search?.trim().toLowerCase();
  if (term) {
    const haystack = `${app.name} ${app.description} ${app.category}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }
  if (query.category && app.category !== query.category) return false;
  if (query.status && app.status !== query.status) return false;
  return true;
}

class LocalApplicationService implements IApplicationService {
  /** Simulated latency keeps skeleton states honest in development. */
  private readonly latency = 350;

  private delay<T>(value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), this.latency));
  }

  getAll(): Promise<Application[]> {
    return this.delay([...APPLICATIONS]);
  }

  getById(id: string): Promise<Application | undefined> {
    return this.delay(APPLICATIONS.find((app) => app.id === id));
  }

  query(query: ApplicationQuery): Promise<Application[]> {
    return this.delay(APPLICATIONS.filter((app) => matches(app, query)));
  }
}

export const ApplicationService: IApplicationService = new LocalApplicationService();

export const applicationsQueryOptions = {
  queryKey: ["applications"] as const,
  queryFn: () => ApplicationService.getAll(),
  staleTime: 5 * 60 * 1000,
};
