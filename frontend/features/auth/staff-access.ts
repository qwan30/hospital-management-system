import type { StaffRole } from "./auth.types";

export type StaffAccessPolicy = {
  readonly allowedRoles: readonly StaffRole[];
  readonly description: string;
  readonly primaryCredential: {
    readonly email: string;
    readonly password: string;
  };
  readonly title: string;
};

const defaultPolicy: StaffAccessPolicy = {
  allowedRoles: ["DOCTOR", "NURSE", "ACCOUNTANT", "ADMIN"],
  description: "Use an authenticated staff account to continue into the requested workspace.",
  primaryCredential: {
    email: "doctor1@hospital.vn",
    password: "Doctor@1234"
  },
  title: "Staff access"
};

const routePolicies: readonly [pattern: RegExp, policy: StaffAccessPolicy][] = [
  [
    /^\/doctor-dashboard|^\/medical-record-editor/,
    {
      allowedRoles: ["DOCTOR"],
      description: "Only doctor sessions can enter the live clinical consultation workflow.",
      primaryCredential: {
        email: "doctor1@hospital.vn",
        password: "Doctor@1234"
      },
      title: "Doctor workspace access"
    }
  ],
  [
    /^\/nurse-checkin/,
    {
      allowedRoles: ["NURSE"],
      description: "Nurse accounts can manage queue, check-in, and room handoff operations.",
      primaryCredential: {
        email: "nurse@hospital.vn",
        password: "Nurse@1234"
      },
      title: "Nurse operations access"
    }
  ],
  [
    /^\/billing-revenue|^\/pharmacy-inventory/,
    {
      allowedRoles: ["ACCOUNTANT", "ADMIN"],
      description: "Finance routes are available to accountant and admin accounts.",
      primaryCredential: {
        email: "accountant@hospital.vn",
        password: "Acc@1234"
      },
      title: "Finance workspace access"
    }
  ],
  [
    /^\/admin-monitoring|^\/cms/,
    {
      allowedRoles: ["ADMIN"],
      description: "Admin routes expose monitoring, content, and operational controls.",
      primaryCredential: {
        email: "admin@hospital.vn",
        password: "Admin@1234"
      },
      title: "Admin workspace access"
    }
  ],
  [
    /^\/patient-records-management/,
    {
      allowedRoles: ["DOCTOR", "ADMIN"],
      description: "Clinical records routes are available to doctor and admin accounts.",
      primaryCredential: {
        email: "doctor1@hospital.vn",
        password: "Doctor@1234"
      },
      title: "Clinical records access"
    }
  ]
] as const;

export function resolveStaffAccessPolicy(redirectTarget: string | null | undefined) {
  const normalizedTarget = redirectTarget || "/";

  for (const [pattern, policy] of routePolicies) {
    if (pattern.test(normalizedTarget)) {
      return policy;
    }
  }

  return defaultPolicy;
}
