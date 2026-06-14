"use client";

import { useStoredRole, useHydrated } from "@/lib/use-stored-role";
import { DoctorDashboardView } from "./doctor-dashboard";
import { NurseDashboardView } from "./nurse-dashboard";
import { ReceptionistDashboardView } from "./receptionist-dashboard";
import { AccountantDashboardView } from "./accountant-dashboard";
import { PharmacistDashboardView } from "./pharmacist-dashboard";

export default function StaffDashboardPage() {
  const role = useStoredRole("staff");
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="p-12 text-center" aria-busy="true">
        <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[var(--hc-primary)] rounded-full animate-spin" />
        <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Resolving user workspace…</p>
      </div>
    );
  }

  switch (role) {
    case "ADMIN":
      return <DoctorDashboardView />;
    case "DOCTOR":
      return <DoctorDashboardView />;
    case "NURSE":
      return <NurseDashboardView />;
    case "RECEPTIONIST":
      return <ReceptionistDashboardView />;
    case "ACCOUNTANT":
      return <AccountantDashboardView />;
    case "PHARMACIST":
      return <PharmacistDashboardView />;
    default:
      return (
        <div className="p-12 text-center text-[var(--hc-danger)]">
          <p className="text-sm font-bold uppercase tracking-wider">Access Restrained</p>
          <p className="text-xs mt-2 text-slate-500">Your profile role is not recognized by the workspace router.</p>
        </div>
      );
  }
}
