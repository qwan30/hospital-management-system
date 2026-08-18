"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CacheOptions {
  ttlMs?: number;
  persistKey?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function clearMemoryCache(keyPattern?: string) {
  if (!keyPattern) {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.includes(keyPattern)) {
        memoryCache.delete(key);
      }
    }
  }
}

export function useCachedData<T>(
  key: string | null | undefined,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { ttlMs = 300000, persistKey } = options;

  const [data, setData] = useState<T | null>(() => {
    if (!key) return null;
    const cached = memoryCache.get(key) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data;
    }
    if (typeof window !== "undefined" && persistKey) {
      try {
        const stored = sessionStorage.getItem(`hms_cache_${persistKey}`);
        if (stored) {
          const parsed = JSON.parse(stored) as CacheEntry<T>;
          if (Date.now() - parsed.timestamp < ttlMs) {
            memoryCache.set(key, parsed);
            return parsed.data;
          }
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!key) return false;
    const cached = memoryCache.get(key);
    return !(cached && Date.now() - cached.timestamp < ttlMs);
  });

  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const revalidate = useCallback(
    async (isManualRefresh = false) => {
      if (!key) return;
      if (isManualRefresh || !data) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await fetcherRef.current();
        const entry: CacheEntry<T> = {
          data: result,
          timestamp: Date.now(),
        };
        memoryCache.set(key, entry);
        if (typeof window !== "undefined" && persistKey) {
          try {
            sessionStorage.setItem(`hms_cache_${persistKey}`, JSON.stringify(entry));
          } catch {
            // ignore
          }
        }
        setData(result);
        setError(null);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error fetching data";
        setError(message);
        if (!data || isManualRefresh) {
          setData(null);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [key, data, persistKey]
  );

  useEffect(() => {
    if (!key) {
      return;
    }

    let isActive = true;
    const cached = memoryCache.get(key) as CacheEntry<T> | undefined;
    const isFresh = cached && Date.now() - cached.timestamp < ttlMs;

    if (!isFresh) {
      // Async state update via microtask or execution
      Promise.resolve().then(() => {
        if (isActive) {
          setIsLoading(true);
        }
      });
    }

    fetcherRef
      .current()
      .then((result) => {
        if (!isActive) return;
        const entry: CacheEntry<T> = {
          data: result,
          timestamp: Date.now(),
        };
        memoryCache.set(key, entry);
        if (typeof window !== "undefined" && persistKey) {
          try {
            sessionStorage.setItem(`hms_cache_${persistKey}`, JSON.stringify(entry));
          } catch {
            // ignore
          }
        }
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!isActive) return;
        const message = err instanceof Error ? err.message : "Error fetching data";
        setError(message);
        setData(null);
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [key, ttlMs, persistKey]);

  return {
    data,
    isLoading,
    error,
    mutate: revalidate,
    setData,
  };
}
