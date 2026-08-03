import { useCallback, useEffect, useRef, useState } from "react";

export interface LocalStorageState<T> {
  value: T;
  /** Replaces the stored value. Accepts a value or an updater, like `setState`. */
  set: (next: T | ((prev: T) => T)) => void;
  /** False during SSR and the first client render — do not branch markup on it. */
  hydrated: boolean;
  /** True when the key already held a value on this device before hydration. */
  hasStoredValue: boolean;
}

/**
 * SSR-safe localStorage state. Reads after hydration to avoid mismatches, and
 * follows the key across browser tabs via the `storage` event.
 */
export function useLocalStorage<T>(key: string, initialValue: T): LocalStorageState<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const [hasStoredValue, setHasStoredValue] = useState(false);

  /** Mirrors `value` so `set` can resolve updaters without an impure setState. */
  const valueRef = useRef<T>(initialValue);
  const initialValueRef = useRef<T>(initialValue);

  const commit = useCallback((next: T) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        commit(JSON.parse(raw) as T);
        setHasStoredValue(true);
      }
    } catch {
      // Corrupt or unavailable storage — fall back to the initial value.
    }
    setHydrated(true);
  }, [key, commit]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== window.localStorage) return;
      if (event.newValue === null) {
        commit(initialValueRef.current);
        setHasStoredValue(false);
        return;
      }
      try {
        commit(JSON.parse(event.newValue) as T);
        setHasStoredValue(true);
      } catch {
        // Another tab wrote something unparseable — keep the current value.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, commit]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;

      commit(resolved);
      setHasStoredValue(true);

      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Ignore quota / privacy-mode failures.
      }
    },
    [key, commit],
  );

  return { value, set, hydrated, hasStoredValue };
}
