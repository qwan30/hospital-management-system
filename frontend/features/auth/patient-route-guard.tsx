"use client";

import type { ReactNode } from "react";
import { RoleRouteGuard } from "./role-route-guard";

type PatientRouteGuardProps = {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly forbiddenFallback?: ReactNode;
};

export function PatientRouteGuard({
  children,
  fallback,
  forbiddenFallback
}: PatientRouteGuardProps) {
  return (
    <RoleRouteGuard
      allowedRoles={["PATIENT"]}
      fallback={fallback}
      forbiddenFallback={forbiddenFallback}
      loginPath="/patient-login"
      scope="patient"
    >
      {children}
    </RoleRouteGuard>
  );
}
