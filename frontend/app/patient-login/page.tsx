import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientLoginScreen } from "../../features/auth/patient-login-screen";

export const metadata: Metadata = {
  title: "Patient Login | Clinical Atelier",
  description: "Secure patient portal access."
};

export default function PatientLoginPage() {
  return (
    <Suspense fallback={null}>
      <PatientLoginScreen />
    </Suspense>
  );
}
