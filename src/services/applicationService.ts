import { APPLICATIONS, CATEGORIES } from "@/data/applications";
import type { AppCategory, Application, ApplicationQuery } from "@/types/application";

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
  /** Canonical display order for category filters and groupings. */
  getCategories(): Promise<AppCategory[]>;
}

/**
 * Duplicate ids silently break favorites, recent history and React keys, and
 * the symptom shows up far from the cause. Checked here rather than in the data
 * file so a Phase 2 API payload gets the same guard.
 */
function assertUniqueIds(applications: Application[]): Application[] {
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
    return this.delay(assertUniqueIds([...APPLICATIONS]));
  }

  getById(id: string): Promise<Application | undefined> {
    return this.delay(APPLICATIONS.find((app) => app.id === id));
  }

  query(query: ApplicationQuery): Promise<Application[]> {
    return this.delay(APPLICATIONS.filter((app) => matches(app, query)));
  }

  getCategories(): Promise<AppCategory[]> {
    return this.delay([...CATEGORIES]);
  }
}

export const ApplicationService: IApplicationService = new LocalApplicationService();

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
