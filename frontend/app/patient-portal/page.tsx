import type { Metadata } from "next";
import { PatientPortalDashboardScreen } from "../../features/patient-portal/patient-portal-dashboard-screen";

export const metadata: Metadata = {
  title: "Patient Portal | Clinical Atelier",
  description: "Patient dashboard for appointments, results, and messages."
};

export default function PatientPortalPage() {
  return <PatientPortalDashboardScreen />;
}
