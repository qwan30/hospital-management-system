import type { Metadata } from "next";
import { PharmacyInventoryScreen } from "../../features/pharmacy-inventory/pharmacy-inventory-screen";

export const metadata: Metadata = {
  title: "Pharmacy & Inventory | Clinical Atelier",
  description: "Inventory visibility workspace for medication and supply health."
};

export default function PharmacyInventoryPage() {
  return <PharmacyInventoryScreen />;
}
