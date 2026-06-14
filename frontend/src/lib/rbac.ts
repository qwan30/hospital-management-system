export type AppRole =
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "ACCOUNTANT"
  | "PATIENT";

export interface NavigationLink {
  label: string;
  href: string;
}

export type RouteDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: "unauthenticated" | "forbidden";
      redirectTo: string;
    };

const STAFF_ROLES: AppRole[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "ACCOUNTANT",
];

const CLINICAL_READ_ROLES: AppRole[] = ["ADMIN", "DOCTOR", "NURSE"];
const SCHEDULING_ROLES: AppRole[] = ["ADMIN", "NURSE", "RECEPTIONIST"];
const BILLING_ROLES: AppRole[] = ["ADMIN", "ACCOUNTANT"];
const INVENTORY_ROLES: AppRole[] = ["ADMIN", "PHARMACIST"];

const ROUTE_POLICIES: Array<{ prefix: string; roles: AppRole[]; loginPath: string }> = [
  { prefix: "/admin/audit-logs", roles: ["ADMIN", "ACCOUNTANT"], loginPath: "/staff/login" },
  { prefix: "/admin", roles: ["ADMIN"], loginPath: "/staff/login" },

  { prefix: "/staff/booking", roles: SCHEDULING_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/queue", roles: SCHEDULING_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/nurse-intake", roles: ["ADMIN", "NURSE"], loginPath: "/staff/login" },
  { prefix: "/staff/vital-signs", roles: CLINICAL_READ_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/lab-results/new", roles: ["ADMIN", "DOCTOR"], loginPath: "/staff/login" },
  { prefix: "/staff/lab-results", roles: CLINICAL_READ_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/patients", roles: ["ADMIN", "DOCTOR"], loginPath: "/staff/login" },
  { prefix: "/staff/medical-records", roles: ["ADMIN", "DOCTOR"], loginPath: "/staff/login" },
  { prefix: "/staff/prescriptions", roles: ["ADMIN", "DOCTOR", "PHARMACIST"], loginPath: "/staff/login" },
  { prefix: "/staff/schedule", roles: ["DOCTOR"], loginPath: "/staff/login" },
  { prefix: "/staff/doctor", roles: ["ADMIN", "DOCTOR"], loginPath: "/staff/login" },
  { prefix: "/staff/inventory", roles: INVENTORY_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/invoices", roles: BILLING_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/pricing", roles: BILLING_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/revenue", roles: BILLING_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/closures", roles: ["ADMIN"], loginPath: "/staff/login" },
  { prefix: "/staff/slots", roles: ["ADMIN"], loginPath: "/staff/login" },
  { prefix: "/staff/support", roles: STAFF_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff/dashboard", roles: STAFF_ROLES, loginPath: "/staff/login" },
  { prefix: "/staff", roles: STAFF_ROLES, loginPath: "/staff/login" },

  { prefix: "/portal", roles: ["PATIENT"], loginPath: "/portal/login" },
];

const PUBLIC_PREFIXES = ["/staff/login", "/portal/login", "/portal/claim"];

export function getRouteDecision(pathname: string, role: AppRole | null): RouteDecision {
  const policy = policyForPath(pathname);
  if (!policy) {
    return { allowed: true };
  }

  if (!role) {
    return {
      allowed: false,
      reason: "unauthenticated",
      redirectTo: policy.loginPath,
    };
  }

  if (!policy.roles.includes(role)) {
    return {
      allowed: false,
      reason: "forbidden",
      redirectTo: "/forbidden",
    };
  }

  return { allowed: true };
}

export function filterNavigationLinks<T extends NavigationLink>(
  links: T[],
  role: AppRole | null,
): T[] {
  return links.filter((link) => getRouteDecision(link.href, role).allowed);
}

export function toAppRole(value: string | null | undefined): AppRole | null {
  if (!value) {
    return null;
  }

  return isAppRole(value) ? value : null;
}

function isAppRole(value: string): value is AppRole {
  return [
    "ADMIN",
    "DOCTOR",
    "NURSE",
    "RECEPTIONIST",
    "PHARMACIST",
    "ACCOUNTANT",
    "PATIENT",
  ].includes(value);
}

function policyForPath(pathname: string) {
  const normalized = normalizePath(pathname);
  if (PUBLIC_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return undefined;
  }
  return ROUTE_POLICIES.find(
    (policy) => normalized === policy.prefix || normalized.startsWith(`${policy.prefix}/`),
  );
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}
