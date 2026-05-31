import { describe, expect, it } from "vitest";
import { getRouteDecision, toAppRole, type AppRole } from "../rbac";

type RoutePolicyCase = {
  path: string;
  allowed: AppRole[];
  denied: AppRole[];
};

const allStaffRoles: AppRole[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "ACCOUNTANT",
];

const routePolicies: RoutePolicyCase[] = [
  {
    path: "/admin/users",
    allowed: ["ADMIN"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/admin/audit-logs",
    allowed: ["ADMIN", "ACCOUNTANT"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST"],
  },
  {
    path: "/staff/booking",
    allowed: ["ADMIN", "NURSE", "RECEPTIONIST"],
    denied: ["DOCTOR", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/queue",
    allowed: ["ADMIN", "NURSE", "RECEPTIONIST"],
    denied: ["DOCTOR", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/nurse-intake",
    allowed: ["ADMIN", "NURSE"],
    denied: ["DOCTOR", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/vital-signs",
    allowed: ["ADMIN", "DOCTOR", "NURSE"],
    denied: ["RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/lab-results/1",
    allowed: ["ADMIN", "DOCTOR", "NURSE"],
    denied: ["RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/lab-results/new",
    allowed: ["ADMIN", "DOCTOR"],
    denied: ["NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/patients",
    allowed: ["ADMIN", "DOCTOR"],
    denied: ["NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/medical-records/1/edit",
    allowed: ["ADMIN", "DOCTOR"],
    denied: ["NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/prescriptions/preview",
    allowed: ["ADMIN", "DOCTOR", "PHARMACIST"],
    denied: ["NURSE", "RECEPTIONIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/schedule",
    allowed: ["DOCTOR"],
    denied: ["ADMIN", "NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/doctor/dashboard",
    allowed: ["ADMIN", "DOCTOR"],
    denied: ["NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/doctor/1",
    allowed: ["ADMIN", "DOCTOR"],
    denied: ["NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/inventory",
    allowed: ["ADMIN", "PHARMACIST"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/invoices",
    allowed: ["ADMIN", "ACCOUNTANT"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST"],
  },
  {
    path: "/staff/pricing",
    allowed: ["ADMIN", "ACCOUNTANT"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST"],
  },
  {
    path: "/staff/revenue",
    allowed: ["ADMIN", "ACCOUNTANT"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST"],
  },
  {
    path: "/staff/closures",
    allowed: ["ADMIN"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/slots",
    allowed: ["ADMIN"],
    denied: ["DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"],
  },
  {
    path: "/staff/support",
    allowed: allStaffRoles,
    denied: ["PATIENT"],
  },
  {
    path: "/staff/dashboard",
    allowed: allStaffRoles,
    denied: ["PATIENT"],
  },
  {
    path: "/portal/overview",
    allowed: ["PATIENT"],
    denied: allStaffRoles,
  },
];

describe("frontend RBAC route matrix", () => {
  it.each(routePolicies)("$path allows the documented roles", ({ path, allowed }) => {
    for (const role of allowed) {
      expect(getRouteDecision(path, role), `${path} for ${role}`).toEqual({
        allowed: true,
      });
    }
  });

  it.each(routePolicies)("$path denies roles outside the documented policy", ({ path, denied }) => {
    for (const role of denied) {
      const decision = getRouteDecision(path, role);
      expect(decision.allowed, `${path} for ${role}`).toBe(false);
      if (!decision.allowed) {
        expect(decision.reason).toBe("forbidden");
        expect(decision.redirectTo).toBe("/forbidden");
      }
    }
  });

  it("redirects unauthenticated protected routes to the correct login surface", () => {
    expect(getRouteDecision("/staff/dashboard", null)).toEqual({
      allowed: false,
      reason: "unauthenticated",
      redirectTo: "/staff/login",
    });
    expect(getRouteDecision("/admin/users", null)).toEqual({
      allowed: false,
      reason: "unauthenticated",
      redirectTo: "/staff/login",
    });
    expect(getRouteDecision("/portal/overview", null)).toEqual({
      allowed: false,
      reason: "unauthenticated",
      redirectTo: "/portal/login",
    });
  });

  it("keeps public and auth entry routes open without a stored role", () => {
    for (const path of ["/", "/departments", "/staff/login", "/portal/login", "/portal/claim"]) {
      expect(getRouteDecision(path, null), path).toEqual({ allowed: true });
    }
  });

  it("normalizes unknown stored role values to null", () => {
    expect(toAppRole("ADMIN")).toBe("ADMIN");
    expect(toAppRole("BAD_ROLE")).toBeNull();
    expect(toAppRole(undefined)).toBeNull();
  });
});
