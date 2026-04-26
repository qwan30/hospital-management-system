import { PortalSectionPage } from "../_components/portal-section-page";

export default function PatientPharmacyPage() {
  return (
    <PortalSectionPage
      eyebrow="Medication Management"
      title="Pharmacy"
      description="Review active prescriptions, renewal status, and pickup instructions shared by the clinical team."
      primaryAction={{ label: "Request Renewal", href: "/portal/messages" }}
      metrics={[
        {
          label: "Active Prescriptions",
          value: "06",
          detail: "Current regimen",
          tone: "primary",
        },
        {
          label: "Renewals",
          value: "02",
          detail: "Awaiting care team",
        },
        {
          label: "Pickup Window",
          value: "24h",
          detail: "North wing pharmacy",
        },
      ]}
      rows={[
        {
          eyebrow: "Daily medication",
          title: "Lisinopril 10mg",
          detail: "One tablet each morning. Renewal confirmed through Nov 24.",
          status: "Active",
        },
        {
          eyebrow: "Supplement",
          title: "Vitamin D 2,000 IU",
          detail: "Added after latest lab review. Available over the counter.",
          status: "New",
        },
        {
          eyebrow: "Respiratory",
          title: "Albuterol inhaler",
          detail: "Bring current inhaler list to the next follow-up appointment.",
          status: "Review",
        },
      ]}
      secondaryPanel={{
        title: "Medication questions stay in messages",
        body: "Prescription changes require clinical review. Use secure messages for renewals, side effect questions, or pharmacy transfer requests.",
        metadata: "Patient safety protocol",
      }}
    />
  );
}
