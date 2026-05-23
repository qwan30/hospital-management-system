"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import {
  HcSidebar,
  defaultAdminSideLinks,
} from "@/components/shells/side-nav";
import { HcTopbar } from "@/components/shells/top-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard scope="staff">
      <div className="hc-app min-h-screen bg-[var(--hc-bg)] text-[var(--hc-text)]">
        <HcTopbar
          mobileLinks={defaultAdminSideLinks}
          roleScope="staff"
          homeHref="/admin/dashboard"
          alertHref="/admin/monitoring"
          settingsHref="/admin/users"
          supportHref="/admin/monitoring"
          profileHref="/admin/users"
          userName="Admin Ops"
          userRole="Administrator"
          alertLabel="Open admin notifications"
          settingsLabel="Open admin settings"
          profileLabel="Open admin profile"
        />
        <HcSidebar
          title="Clinical Suite"
          subtitle="Admin Access"
          roleScope="staff"
          links={defaultAdminSideLinks}
          ctaLabel="New Entry"
          ctaHref="/admin/users"
          supportHref="/admin/monitoring"
          supportLabel="Monitoring"
          logoutHref="/auth/logout"
          statusTitle="Admin status"
          statusDescription="Operations online"
        />
        <main className="hc-main min-h-screen bg-[var(--hc-content-bg)] pt-[var(--hc-topbar-h)] md:ml-[var(--hc-sidebar-w)]">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
