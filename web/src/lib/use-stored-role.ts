"use client";

import { useSyncExternalStore } from "react";
import { getStoredRole } from "@/lib/api-client";
import { toAppRole, type AppRole } from "@/lib/rbac";

export function useStoredRole(scope: "staff" | "patient"): AppRole | null {
  return useSyncExternalStore(
    subscribeToRoleChanges,
    () => toAppRole(getStoredRole(scope)),
    () => null,
  );
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribeToRoleChanges,
    () => true,
    () => false,
  );
}

function subscribeToRoleChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}
