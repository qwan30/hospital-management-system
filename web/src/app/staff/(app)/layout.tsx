import { StaffTopNav } from "@/components/shells/top-nav";
import { StaffSideNav } from "@/components/shells/side-nav";
import { HmsFooter } from "@/components/shells/footer";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hms-surface text-hms-on-surface min-h-screen overflow-x-hidden">
      <StaffTopNav />
      <StaffSideNav />
      <main className="mt-[48px] min-h-screen bg-hms-surface md:ml-64 overflow-x-hidden">
        {children}
      </main>
      <HmsFooter />
    </div>
  );
}
