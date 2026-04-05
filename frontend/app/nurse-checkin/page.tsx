import type { Metadata } from "next";
import { NurseCheckinScreen } from "../../features/nurse-checkin/nurse-checkin-screen";

export const metadata: Metadata = {
  title: "Nurse Check-In | Clinical Atelier",
  description: "Figma-derived nurse check-in and queue management prototype."
};

export default function NurseCheckinPage() {
  return <NurseCheckinScreen />;
}
