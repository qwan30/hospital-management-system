import type { Metadata } from "next";
import { AdminMonitoringScreen } from "../../features/admin-monitoring/admin-monitoring-screen";

export const metadata: Metadata = {
  title: "Admin Monitoring | Clinical Atelier",
  description: "Administrative control room for system health and audit visibility."
};

export default function AdminMonitoringPage() {
  return <AdminMonitoringScreen />;
}
