import type { Metadata } from "next";
import { DoctorRouteGuard } from "../../features/auth/doctor-route-guard";
import { MedicalRecordEditorScreen } from "../../features/medical-record/medical-record-editor-screen";

export const metadata: Metadata = {
  title: "Medical Record Editor | Clinical Atelier",
  description: "Figma-derived medical record editor prototype."
};

export default function MedicalRecordEditorPage() {
  return (
    <DoctorRouteGuard>
      <MedicalRecordEditorScreen />
    </DoctorRouteGuard>
  );
}
