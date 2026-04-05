"use client";

import type { ReactNode } from "react";
import { RoleRouteGuard } from "./role-route-guard";

type AdminRouteGuardProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly forbiddenFallback?: ReactNode;
};

export function AdminRouteGuard({
  children,
  fallback,
  forbiddenFallback
}: AdminRouteGuardProps) {
  return (
    <RoleRouteGuard
      allowedRoles={["ADMIN"]}
      fallback={fallback}
      forbiddenFallback={forbiddenFallback}
      loginPath="/login"
      scope="staff"
    >
      {children}
    </RoleRouteGuard>
  );
}
