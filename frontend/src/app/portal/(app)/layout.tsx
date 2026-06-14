import { RouteGuard } from "@/components/auth/route-guard";
import { PortalTopNav } from "@/components/shells/top-nav";
import { defaultPortalSideLinks, PortalSideNav } from "@/components/shells/side-nav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard scope="patient">
      <div className="hc-app min-h-screen bg-[var(--hc-bg)] text-[var(--hc-text)]">
        <PortalTopNav mobileLinks={defaultPortalSideLinks} />
        <PortalSideNav />
        <main className="hc-main min-h-screen bg-[var(--hc-content-bg)] pt-[var(--hc-topbar-h)] md:ml-[var(--hc-sidebar-w)]">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
