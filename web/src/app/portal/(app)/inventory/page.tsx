import { PortalSectionPage } from "../_components/portal-section-page";

export default function PortalInventoryPage() {
  return (
    <PortalSectionPage
      eyebrow="Patient Supplies"
      title="Home Care Inventory"
      description="Track patient-facing supplies, prescription pickup readiness, and items requested by the care team."
      primaryAction={{ label: "Open Pharmacy", href: "/portal/pharmacy" }}
      metrics={[
        {
          label: "Ready Items",
          value: "03",
          detail: "For pickup",
          tone: "primary",
        },
        {
          label: "Low Supplies",
          value: "01",
          detail: "Needs refill",
        },
        {
          label: "Next Review",
          value: "Nov 02",
          detail: "Care plan",
        },
      ]}
      rows={[
        {
          eyebrow: "Pharmacy pickup",
          title: "Vitamin D supplement",
          detail: "Recommended after lab review. Confirm availability with the pharmacy desk.",
          status: "Ready",
        },
        {
          eyebrow: "Home monitoring",
          title: "Peak flow meter log",
          detail: "Bring your latest readings to the upcoming allergy follow-up.",
          status: "Bring",
        },
        {
          eyebrow: "Medication list",
          title: "Current inhaler inventory",
          detail: "Update remaining doses before the next respiratory review.",
          status: "Review",
        },
      ]}
      secondaryPanel={{
        title: "Supply data is care-facing",
        body: "This page is not a hospital warehouse view. It only shows patient-facing items connected to current care plans.",
        metadata: "Portal inventory",
      }}
    />
  );
}
