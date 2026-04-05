import type { Metadata } from "next";
import { DoctorDashboardScreen } from "../../features/doctor-dashboard/doctor-dashboard-screen";

export const metadata: Metadata = {
  title: "Doctor Dashboard | Clinical Atelier",
  description: "Authenticated doctor dashboard backed by live HMS schedule and appointment APIs."
};

export default function DoctorDashboardPage() {
  return <DoctorDashboardScreen />;
}
