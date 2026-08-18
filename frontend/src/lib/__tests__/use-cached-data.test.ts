import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCachedData, clearMemoryCache } from "../use-cached-data";

describe("useCachedData", () => {
  beforeEach(() => {
    clearMemoryCache();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("fetches data and caches in memory", async () => {
    const fetcher = vi.fn().mockResolvedValue(["dept1", "dept2"]);

    const { result } = renderHook(() =>
      useCachedData("test-key", fetcher, { ttlMs: 60000 })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(["dept1", "dept2"]);
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("serves cached data immediately on subsequent calls within TTL", async () => {
    const fetcher = vi.fn().mockResolvedValue(["dept1"]);

    // First mount
    const { result: firstResult } = renderHook(() =>
      useCachedData("test-key", fetcher, { ttlMs: 60000 })
    );
    await waitFor(() => expect(firstResult.current.isLoading).toBe(false));

    // Second mount with same key
    const { result: secondResult } = renderHook(() =>
      useCachedData("test-key", fetcher, { ttlMs: 60000 })
    );

    // Initial state of second mount is already populated from cache
    expect(secondResult.current.data).toEqual(["dept1"]);
    expect(secondResult.current.isLoading).toBe(false);
  });

  it("handles fetch errors and resets error on manual mutate", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("API failure"))
      .mockResolvedValueOnce(["recovered"]);

    const { result } = renderHook(() => useCachedData("error-key", fetcher));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("API failure");
    expect(result.current.data).toBeNull();

    await act(async () => {
      await result.current.mutate(true);
    });

    expect(result.current.data).toEqual(["recovered"]);
    expect(result.current.error).toBeNull();
  });
});
