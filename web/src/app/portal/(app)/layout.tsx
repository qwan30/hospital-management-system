import { PortalTopNav } from "@/components/shells/top-nav";
import { PortalSideNav } from "@/components/shells/side-nav";
import { HmsFooter } from "@/components/shells/footer";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hms-surface text-hms-on-surface min-h-screen">
      <PortalTopNav />
      <PortalSideNav />
      <main className="ml-64 mt-[48px] min-h-[calc(100vh-96px)] p-8 bg-hms-surface">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <HmsFooter />
    </div>
  );
}
