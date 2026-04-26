import { RouteGuard } from "@/components/auth/route-guard";
import { PortalTopNav } from "@/components/shells/top-nav";
import { PortalSideNav } from "@/components/shells/side-nav";
import { HmsFooter } from "@/components/shells/footer";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard scope="patient">
      <div className="bg-hms-surface text-hms-on-surface min-h-screen">
        <PortalTopNav />
        <PortalSideNav />
        <main className="mt-[48px] min-h-[calc(100vh-96px)] p-6 sm:p-8 bg-hms-surface md:ml-64">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <HmsFooter />
      </div>
    </RouteGuard>
  );
}
