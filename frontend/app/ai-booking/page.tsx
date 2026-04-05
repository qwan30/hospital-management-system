import type { Metadata } from "next";
import { AiBookingScreen } from "../../features/ai-booking/ai-booking-screen";

export const metadata: Metadata = {
  title: "AI Booking Flow | Clinical Atelier",
  description: "Figma-derived AI booking flow prototype."
};

export default function AiBookingPage() {
  return <AiBookingScreen />;
}
