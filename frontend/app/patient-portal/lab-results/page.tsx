import type { Metadata } from "next";
import { PatientLabResultsScreen } from "../../../features/patient-portal/patient-lab-results-screen";

export const metadata: Metadata = {
  title: "My Lab Results | Clinical Atelier",
  description: "Patient lab result summaries and attachments."
};

export default function PatientLabResultsPage() {
  return <PatientLabResultsScreen />;
}
