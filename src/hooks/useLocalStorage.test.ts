import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts from the initial value and reports nothing stored", () => {
    const { result } = renderHook(() => useLocalStorage("test.key", ["a"]));

    expect(result.current.value).toEqual(["a"]);
    expect(result.current.hydrated).toBe(true);
    expect(result.current.hasStoredValue).toBe(false);
  });

  it("reads an existing value after hydration", () => {
    window.localStorage.setItem("test.key", JSON.stringify(["stored"]));

    const { result } = renderHook(() => useLocalStorage<string[]>("test.key", []));

    expect(result.current.value).toEqual(["stored"]);
    expect(result.current.hasStoredValue).toBe(true);
  });

  it("distinguishes a stored empty array from nothing stored", () => {
    window.localStorage.setItem("test.key", JSON.stringify([]));

    const { result } = renderHook(() => useLocalStorage<string[]>("test.key", ["default"]));

    expect(result.current.value).toEqual([]);
    expect(result.current.hasStoredValue).toBe(true);
  });

  it("persists both direct values and updater functions", () => {
    const { result } = renderHook(() => useLocalStorage<string[]>("test.key", []));

    act(() => result.current.set(["one"]));
    expect(window.localStorage.getItem("test.key")).toBe(JSON.stringify(["one"]));

    act(() => result.current.set((prev) => [...prev, "two"]));
    expect(result.current.value).toEqual(["one", "two"]);
    expect(window.localStorage.getItem("test.key")).toBe(JSON.stringify(["one", "two"]));
  });

  it("applies consecutive updater calls made in one batch", () => {
    const { result } = renderHook(() => useLocalStorage<number>("test.count", 0));

    act(() => {
      result.current.set((prev) => prev + 1);
      result.current.set((prev) => prev + 1);
    });

    expect(result.current.value).toBe(2);
  });

  it("follows the key when another tab writes it", () => {
    const { result } = renderHook(() => useLocalStorage<string[]>("test.key", []));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test.key",
          newValue: JSON.stringify(["from-other-tab"]),
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current.value).toEqual(["from-other-tab"]);
  });

  it("falls back to the initial value when another tab clears the key", () => {
    window.localStorage.setItem("test.key", JSON.stringify(["stored"]));
    const { result } = renderHook(() => useLocalStorage<string[]>("test.key", ["default"]));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test.key",
          newValue: null,
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current.value).toEqual(["default"]);
    expect(result.current.hasStoredValue).toBe(false);
  });

  it("ignores storage events for other keys", () => {
    const { result } = renderHook(() => useLocalStorage<string[]>("test.key", ["default"]));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "other.key",
          newValue: JSON.stringify(["nope"]),
          storageArea: window.localStorage,
        }),
      );
    });

    expect(result.current.value).toEqual(["default"]);
  });

  it("keeps the initial value when the stored JSON is corrupt", () => {
    window.localStorage.setItem("test.key", "{not json");

    const { result } = renderHook(() => useLocalStorage<string[]>("test.key", ["default"]));

    expect(result.current.value).toEqual(["default"]);
  });
});
