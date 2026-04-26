import { expect, test } from "@playwright/test";
import { apiRequest } from "../../src/lib/api-client";

type FetchRecord = {
  url: string;
  method?: string;
  headers: Record<string, string>;
};

function installFetchMock(status = 200) {
  const records: FetchRecord[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input, init) => {
    const headers = new Headers(init?.headers);

    records.push({
      url: String(input),
      method: init?.method,
      headers: Object.fromEntries(headers.entries()),
    });

    return new Response(
      JSON.stringify({
        success: status >= 200 && status < 300,
        data: { ok: true },
        error: status >= 400 ? { code: "AUTH", message: "Access denied" } : null,
      }),
      {
        status,
        headers: { "content-type": "application/json" },
      },
    );
  };

  return {
    records,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
}

function installBrowserSession(values: Record<string, string>) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalSessionStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values[key] ?? null,
      removeItem: () => undefined,
      setItem: () => undefined,
    },
  });

  return () => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }

    if (originalSessionStorage) {
      Object.defineProperty(globalThis, "sessionStorage", originalSessionStorage);
    } else {
      delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
    }
  };
}

test.describe("apiRequest", () => {
  test("attaches a staff bearer token only when staff auth is requested", async () => {
    const restoreSession = installBrowserSession({
      hms_staff_access_token: "staff-token",
    });
    const fetchMock = installFetchMock();

    try {
      await apiRequest("/queue/today", {}, { authScope: "staff" });

      expect(fetchMock.records[0].headers.authorization).toBe(
        "Bearer staff-token",
      );
    } finally {
      fetchMock.restore();
      restoreSession();
    }
  });

  test("leaves public calls unauthenticated by default", async () => {
    const restoreSession = installBrowserSession({
      hms_staff_access_token: "staff-token",
    });
    const fetchMock = installFetchMock();

    try {
      await apiRequest("/appointments", { method: "POST" });

      expect(fetchMock.records[0].headers.authorization).toBeUndefined();
    } finally {
      fetchMock.restore();
      restoreSession();
    }
  });
});
