"use client";

import { useStoredRole, useHydrated } from "@/lib/use-stored-role";
import { KpiCardSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton";
import { DoctorDashboardView } from "./doctor-dashboard";
import { NurseDashboardView } from "./nurse-dashboard";
import { ReceptionistDashboardView } from "./receptionist-dashboard";
import { AccountantDashboardView } from "./accountant-dashboard";
import { PharmacistDashboardView } from "./pharmacist-dashboard";

function DashboardSkeleton() {
  return (
    <div className="p-8 pb-20 max-w-[1400px] mx-auto" aria-busy="true">
      <PageHeaderSkeleton />
      <div className="hc-kpi-grid mt-8">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>
      <div className="mt-6 h-12 animate-pulse rounded-[var(--radius-lg)] bg-[var(--hc-border-soft)]" />
      <div className="mt-4 h-[400px] animate-pulse rounded-[var(--radius-xl)] bg-[var(--hc-border-soft)]" />
    </div>
  );
}

export default function StaffDashboardPage() {
  const role = useStoredRole("staff");
  const hydrated = useHydrated();

  if (!hydrated) {
    return <DashboardSkeleton />;
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
          <p className="text-xs mt-2 text-[var(--hc-text-muted)]">
            Your profile role is not recognized by the workspace router.
          </p>
        </div>
      );
  }
}
