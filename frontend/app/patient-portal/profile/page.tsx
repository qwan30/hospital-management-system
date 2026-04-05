import type { Metadata } from "next";
import { PatientProfileScreen } from "../../../features/patient-portal/patient-profile-screen";

export const metadata: Metadata = {
  title: "Patient Profile | Clinical Atelier",
  description: "Patient profile and settings workspace."
};

export default function PatientProfilePage() {
  return <PatientProfileScreen />;
}
