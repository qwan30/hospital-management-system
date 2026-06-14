import { expect, test } from "@playwright/test";
import {
  filterNavigationLinks,
  getRouteDecision,
  type AppRole,
  type NavigationLink,
} from "../../src/lib/rbac";
import { clearSessions, getStoredRole, persistSession } from "../../src/lib/api-client";

function installBrowserSession() {
  const store: Record<string, string> = {};
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
      getItem: (key: string) => store[key] ?? null,
      removeItem: (key: string) => {
        delete store[key];
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    },
  });

  return {
    store,
    restore: () => {
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
    },
  };
}

test.describe("frontend RBAC policy", () => {
  test("persists staff and patient roles with their auth scope", () => {
    const session = installBrowserSession();

    try {
      persistSession("staff", {
        accessToken: "staff-token",
        expiresInSeconds: 900,
      }, "PHARMACIST");
      persistSession("patient", {
        accessToken: "patient-token",
        expiresInSeconds: 900,
      }, "PATIENT");

      expect(getStoredRole("staff")).toBe("PHARMACIST");
      expect(getStoredRole("patient")).toBe("PATIENT");

      clearSessions();
      expect(session.store).toEqual({});
    } finally {
      session.restore();
    }
  });

  test("redirects unauthenticated users to the matching login page", () => {
    expect(getRouteDecision("/staff/dashboard", null)).toEqual({
      allowed: false,
      reason: "unauthenticated",
      redirectTo: "/staff/login",
    });
    expect(getRouteDecision("/admin/users", null)).toEqual({
      allowed: false,
      reason: "unauthenticated",
      redirectTo: "/staff/login",
    });
    expect(getRouteDecision("/portal/overview", null)).toEqual({
      allowed: false,
      reason: "unauthenticated",
      redirectTo: "/portal/login",
    });
  });

  test("allows and forbids protected routes by role", () => {
    expect(getRouteDecision("/staff/inventory", "PHARMACIST")).toEqual({ allowed: true });
    expect(getRouteDecision("/staff/queue", "RECEPTIONIST")).toEqual({ allowed: true });
    expect(getRouteDecision("/staff/medical-records/1/edit", "RECEPTIONIST")).toEqual({
      allowed: false,
      reason: "forbidden",
      redirectTo: "/forbidden",
    });
    expect(getRouteDecision("/admin/users", "ACCOUNTANT")).toEqual({
      allowed: false,
      reason: "forbidden",
      redirectTo: "/forbidden",
    });
    expect(getRouteDecision("/portal/billing", "PATIENT")).toEqual({ allowed: true });
    expect(getRouteDecision("/portal/billing", "DOCTOR")).toEqual({
      allowed: false,
      reason: "forbidden",
      redirectTo: "/forbidden",
    });
  });

  test("filters navigation links by route permissions", () => {
    const links: NavigationLink[] = [
      { label: "Queue", href: "/staff/queue" },
      { label: "Records", href: "/staff/medical-records/1/edit" },
      { label: "Inventory", href: "/staff/inventory" },
      { label: "Billing", href: "/staff/invoices" },
    ];

    const visibleForNurse = filterNavigationLinks(links, "NURSE" satisfies AppRole);
    const visibleForAccountant = filterNavigationLinks(links, "ACCOUNTANT" satisfies AppRole);

    expect(visibleForNurse.map((link) => link.label)).toEqual(["Queue"]);
    expect(visibleForAccountant.map((link) => link.label)).toEqual(["Billing"]);
  });
});
