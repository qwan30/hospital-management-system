"use client";

import type { ReactNode } from "react";
import { RoleRouteGuard } from "./role-route-guard";

type FinanceRouteGuardProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly forbiddenFallback?: ReactNode;
};

export function FinanceRouteGuard({
  children,
  fallback,
  forbiddenFallback
}: FinanceRouteGuardProps) {
  return (
    <RoleRouteGuard
      allowedRoles={["ACCOUNTANT", "ADMIN"]}
      fallback={fallback}
      forbiddenFallback={forbiddenFallback}
      loginPath="/login"
      scope="staff"
    >
      {children}
    </RoleRouteGuard>
  );
}
