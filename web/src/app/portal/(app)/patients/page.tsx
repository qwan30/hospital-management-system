import { PortalSectionPage } from "../_components/portal-section-page";

export default function PortalPatientsPage() {
  return (
    <PortalSectionPage
      eyebrow="Patient Identity"
      title="Patient Profile Access"
      description="Review the patient record connected to this portal session and the household contacts authorized for care coordination."
      primaryAction={{ label: "Edit Profile", href: "/portal/profile" }}
      metrics={[
        {
          label: "Linked Records",
          value: "01",
          detail: "Primary patient",
          tone: "primary",
        },
        {
          label: "Care Contacts",
          value: "02",
          detail: "Authorized",
        },
        {
          label: "Consent Status",
          value: "On",
          detail: "Portal sharing",
        },
      ]}
      rows={[
        {
          eyebrow: "Primary record",
          title: "Sarah Jenkins",
          detail: "Portal-visible summary with appointments, labs, messages, and billing.",
          status: "Active",
        },
        {
          eyebrow: "Emergency contact",
          title: "Sarah Jenkins-Vance",
          detail: "Phone and relationship details are managed in patient profile.",
          status: "Verified",
        },
        {
          eyebrow: "Care team",
          title: "Internal Medicine",
          detail: "Clinical messages are routed through the assigned care coordination team.",
          status: "Assigned",
        },
      ]}
      secondaryPanel={{
        title: "Household access policy",
        body: "Additional patient records require identity verification and explicit consent before they can appear in this portal.",
        metadata: "Privacy controls",
      }}
    />
  );
}
