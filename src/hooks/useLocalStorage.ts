import { useCallback, useEffect, useState } from "react";

/** SSR-safe localStorage state. Reads after hydration to avoid mismatches. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Corrupt or unavailable storage — fall back to the initial value.
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Ignore quota / privacy-mode failures.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
