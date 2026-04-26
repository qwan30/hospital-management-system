import { PortalSectionPage } from "../_components/portal-section-page";

export default function PatientSupportPage() {
  return (
    <PortalSectionPage
      eyebrow="Care Coordination"
      title="Support"
      description="Route non-urgent care, billing, portal access, and scheduling questions to the right hospital desk."
      primaryAction={{ label: "Open Messages", href: "/portal/messages" }}
      metrics={[
        {
          label: "Average Response",
          value: "4h",
          detail: "Business day",
          tone: "primary",
        },
        {
          label: "Open Threads",
          value: "03",
          detail: "Secure inbox",
        },
        {
          label: "Urgent Line",
          value: "24/7",
          detail: "Call reception",
          tone: "warning",
        },
      ]}
      rows={[
        {
          eyebrow: "Clinical support",
          title: "Questions about labs or medication",
          detail: "Use secure messages so the care team can review the right record context.",
          status: "Messages",
        },
        {
          eyebrow: "Scheduling desk",
          title: "Appointment changes",
          detail: "Review upcoming visits and request a reschedule from appointments.",
          status: "Appointments",
        },
        {
          eyebrow: "Billing desk",
          title: "Insurance or invoice questions",
          detail: "Send invoice references and payer details for faster review.",
          status: "Billing",
        },
      ]}
      secondaryPanel={{
        title: "Emergency guidance",
        body: "The portal is not monitored for emergencies. For urgent symptoms, call local emergency services or the hospital emergency desk directly.",
        metadata: "Safety notice",
      }}
    />
  );
}
