import { PortalSectionPage } from "../_components/portal-section-page";

export default function PatientAdmitPage() {
  return (
    <PortalSectionPage
      eyebrow="Visit Request"
      title="Admission And Booking"
      description="Start a new visit request, review intake requirements, and prepare the documents needed before arrival."
      primaryAction={{ label: "Start Booking", href: "/booking" }}
      metrics={[
        {
          label: "Intake Steps",
          value: "04",
          detail: "Symptoms to confirmation",
          tone: "primary",
        },
        {
          label: "Documents",
          value: "03",
          detail: "ID, insurance, records",
        },
        {
          label: "Queue Status",
          value: "Low",
          detail: "Today",
        },
      ]}
      rows={[
        {
          eyebrow: "Step 1",
          title: "Describe symptoms and care need",
          detail: "The booking workflow estimates duration and routes the visit to a department.",
          status: "Required",
        },
        {
          eyebrow: "Step 2",
          title: "Select department and doctor",
          detail: "Available slots are shown after the clinical intake details are complete.",
          status: "Required",
        },
        {
          eyebrow: "Step 3",
          title: "Confirm patient contact details",
          detail: "Use the same email and phone number linked to your portal profile.",
          status: "Required",
        },
      ]}
      secondaryPanel={{
        title: "Bring records on arrival",
        body: "Carry a government ID, insurance card, medication list, and any outside lab or imaging results related to the visit.",
        metadata: "Front desk checklist",
      }}
    />
  );
}
