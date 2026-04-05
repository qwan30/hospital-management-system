import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientClaimScreen } from "../../../features/auth/patient-claim-screen";

export const metadata: Metadata = {
  title: "Claim Patient Portal | Clinical Atelier",
  description: "Activate patient portal access using booking identity details."
};

export default function PatientClaimPage() {
  return (
    <Suspense fallback={null}>
      <PatientClaimScreen />
    </Suspense>
  );
}
