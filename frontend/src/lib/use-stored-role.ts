"use client";

import { useSyncExternalStore } from "react";
import { getStoredRole } from "@/lib/api-client";
import { toAppRole, type AppRole } from "@/lib/rbac";

/**
 * No-op subscribe for `useSyncExternalStore` — the sessionStorage-backed
 * role only changes on full-page navigation (login/logout), so we don't need
 * live intra-tab updates. React will still call `getSnapshot` on mount and
 * after hydration to pick up the client-side value.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function noopSubscribe(_onStoreChange: () => void) {
  return () => undefined;
}

/**
 * Reads the stored role from sessionStorage.
 *
 * Returns `null` during SSR and hydration. After hydration React calls
 * `getSnapshot` which reads `sessionStorage` directly — if a token was stored
 * (e.g. by `addInitScript` in E2E tests or a prior login redirect), the role
 * resolves immediately.
 */
export function useStoredRole(scope: "staff" | "patient"): AppRole | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => toAppRole(getStoredRole(scope)),
    () => null,
  );
}

/**
 * Returns `true` once the client renders after hydration.
 *
 * Uses `useSyncExternalStore` so React handles the server→client transition
 * without a hydration mismatch. The subscribe is a no-op because we only need
 * the initial mount to flip from `false` to `true`.
 *
 * Pair with `useStoredRole` to gate auth-dependent content:
 * ```tsx
 * const role = useStoredRole("staff");
 * const hydrated = useHydrated();
 * if (!hydrated || !role) return <DashboardSkeleton />;
 * ```
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
