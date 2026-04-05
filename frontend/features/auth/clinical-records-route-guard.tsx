"use client";

import type { ReactNode } from "react";
import { RoleRouteGuard } from "./role-route-guard";

type ClinicalRecordsRouteGuardProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly forbiddenFallback?: ReactNode;
};

export function ClinicalRecordsRouteGuard({
  children,
  fallback,
  forbiddenFallback
}: ClinicalRecordsRouteGuardProps) {
  return (
    <RoleRouteGuard
      allowedRoles={["DOCTOR", "NURSE", "ADMIN"]}
      fallback={fallback}
      forbiddenFallback={forbiddenFallback}
      loginPath="/login"
      scope="staff"
    >
      {children}
    </RoleRouteGuard>
  );
}
