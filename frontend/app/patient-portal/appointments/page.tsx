import type { Metadata } from "next";
import { PatientAppointmentsScreen } from "../../../features/patient-portal/patient-appointments-screen";

export const metadata: Metadata = {
  title: "My Appointments | Clinical Atelier",
  description: "Patient appointment history and upcoming visits."
};

export default function PatientAppointmentsPage() {
  return <PatientAppointmentsScreen />;
}
