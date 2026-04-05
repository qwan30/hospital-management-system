"use client";

import type { ReactNode } from "react";
import { RoleRouteGuard } from "./role-route-guard";

type DoctorRouteGuardProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly forbiddenFallback?: ReactNode;
};

export function DoctorRouteGuard({
  children,
  fallback,
  forbiddenFallback
}: DoctorRouteGuardProps) {
  return (
    <RoleRouteGuard
      allowedRoles={["DOCTOR"]}
      fallback={fallback}
      forbiddenFallback={forbiddenFallback}
      loginPath="/login"
      scope="staff"
    >
      {children}
    </RoleRouteGuard>
  );
}
