import type { Metadata } from "next";
import { PatientRecordsManagementScreen } from "../../features/patient-records-management/patient-records-management-screen";

export const metadata: Metadata = {
  title: "Patient Records Management | Clinical Atelier",
  description: "Internal patient record search and chart review workspace."
};

export default function PatientRecordsManagementPage() {
  return <PatientRecordsManagementScreen />;
}
