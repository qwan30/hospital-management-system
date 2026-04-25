import { StaffTopNav } from "@/components/shells/top-nav";
import { StaffSideNav } from "@/components/shells/side-nav";
import { HmsFooter } from "@/components/shells/footer";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hms-surface text-hms-on-surface min-h-screen">
      <StaffTopNav />
      <StaffSideNav />
      <main className="ml-64 mt-[48px] min-h-screen bg-hms-surface">
        {children}
      </main>
      <HmsFooter />
    </div>
  );
}
