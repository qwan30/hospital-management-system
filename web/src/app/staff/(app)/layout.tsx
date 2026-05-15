import { RouteGuard } from "@/components/auth/route-guard";
import { StaffTopNav } from "@/components/shells/top-nav";
import { StaffSideNav } from "@/components/shells/side-nav";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard scope="staff">
      <div className="hc-app min-h-screen overflow-x-hidden bg-[var(--hc-bg)] text-[var(--hc-text)]">
        <StaffTopNav />
        <StaffSideNav />
        <main className="hc-main min-h-screen overflow-x-hidden bg-[var(--hc-content-bg)] pt-[var(--hc-topbar-h)] md:ml-[var(--hc-sidebar-w)]">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
