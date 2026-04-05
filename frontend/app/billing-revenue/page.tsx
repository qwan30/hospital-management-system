import type { Metadata } from "next";
import { BillingRevenueScreen } from "../../features/billing-revenue/billing-revenue-screen";

export const metadata: Metadata = {
  title: "Billing & Revenue | Clinical Atelier",
  description: "Finance dashboard for invoices, revenue, and pricing visibility."
};

export default function BillingRevenuePage() {
  return <BillingRevenueScreen />;
}
