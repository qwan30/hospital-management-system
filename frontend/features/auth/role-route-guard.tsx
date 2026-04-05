"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import type { AuthScope, PrincipalRole } from "./auth.types";

type RoleRouteGuardProps = {
  readonly allowedRoles: readonly PrincipalRole[];
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly forbiddenFallback?: ReactNode;
  readonly loginPath: string;
  readonly scope: AuthScope;
};

export function RoleRouteGuard({
  allowedRoles,
  children,
  fallback,
  forbiddenFallback,
  loginPath,
  scope
}: RoleRouteGuardProps) {
  const { bootstrap, bootstrapped, session, status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!bootstrapped && status !== "loading") {
      void bootstrap(scope);
    }
  }, [bootstrap, bootstrapped, scope, status]);

  useEffect(() => {
    if (bootstrapped && status === "unauthenticated") {
      const redirectTarget = pathname || "/";
      router.replace(`${loginPath}?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  }, [bootstrapped, loginPath, pathname, router, status]);

  if (!bootstrapped || status === "loading") {
    return fallback ?? <p>Checking session...</p>;
  }

  if (!session) {
    return fallback ?? <p>Redirecting to login...</p>;
  }

  if (session.scope !== scope || !allowedRoles.includes(session.role)) {
    return forbiddenFallback ?? <p>This screen is not available for the current account.</p>;
  }

  return <>{children}</>;
}
