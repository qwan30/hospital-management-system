import type { Metadata } from "next";
import { PatientMessagesScreen } from "../../../features/patient-portal/patient-messages-screen";

export const metadata: Metadata = {
  title: "Patient Messages | Clinical Atelier",
  description: "Patient care-team messages and thread history."
};

export default function PatientMessagesPage() {
  return <PatientMessagesScreen />;
}
