import { PortalSectionPage } from "../_components/portal-section-page";

export default function PortalStaffPage() {
  return (
    <PortalSectionPage
      eyebrow="Care Team"
      title="Assigned Staff"
      description="See the clinicians and coordinators connected to your upcoming visits and active care plan."
      primaryAction={{ label: "Message Care Team", href: "/portal/messages" }}
      metrics={[
        {
          label: "Assigned Clinicians",
          value: "04",
          detail: "Across active care",
          tone: "primary",
        },
        {
          label: "Primary Doctor",
          value: "01",
          detail: "Internal medicine",
        },
        {
          label: "Response SLA",
          value: "4h",
          detail: "Business day",
        },
      ]}
      rows={[
        {
          eyebrow: "Primary physician",
          title: "Dr. Nguyen Van An",
          detail: "Internal Medicine. Assigned to allergy and respiratory follow-up.",
          status: "Primary",
        },
        {
          eyebrow: "Nursing coordinator",
          title: "Le Thi Cuc",
          detail: "Coordinates intake, vitals, and appointment preparation.",
          status: "Care team",
        },
        {
          eyebrow: "Billing desk",
          title: "Patient finance office",
          detail: "Handles invoice questions and insurance document routing.",
          status: "Support",
        },
      ]}
      secondaryPanel={{
        title: "Contact through secure messages",
        body: "Direct staff contact details are limited for privacy. Messages route to the right queue with patient context attached.",
        metadata: "Communication policy",
      }}
    />
  );
}
