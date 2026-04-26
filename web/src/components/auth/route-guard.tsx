"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRouteDecision } from "@/lib/rbac";
import { useHydrated, useStoredRole } from "@/lib/use-stored-role";

interface RouteGuardProps {
  children: React.ReactNode;
  scope: "staff" | "patient";
}

export function RouteGuard({ children, scope }: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHydrated = useHydrated();
  const role = useStoredRole(scope);
  const decision = getRouteDecision(pathname, role);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!decision.allowed) {
      router.replace(decision.redirectTo);
    }
  }, [decision, isHydrated, router]);

  if (!isHydrated || !decision.allowed) {
    return null;
  }

  return <>{children}</>;
}
