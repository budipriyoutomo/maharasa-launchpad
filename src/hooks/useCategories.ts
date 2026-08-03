import { useQuery } from "@tanstack/react-query";

import { categoriesQueryOptions } from "@/services/applicationService";
import type { AppCategory } from "@/types/application";

const EMPTY: AppCategory[] = [];

/** Canonical category order, read through the service layer like everything else. */
export function useCategories() {
  const { data, isLoading } = useQuery(categoriesQueryOptions);
  return { categories: data ?? EMPTY, isLoading };
}
