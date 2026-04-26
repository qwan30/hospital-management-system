import { PortalSectionPage } from "../_components/portal-section-page";

export default function PatientBillingPage() {
  return (
    <PortalSectionPage
      eyebrow="Financial Records"
      title="Billing"
      description="Track recent invoices, insurance processing, and patient balances from one patient-facing workspace."
      primaryAction={{ label: "Contact Billing", href: "/portal/support" }}
      metrics={[
        {
          label: "Open Balance",
          value: "$184",
          detail: "Due Nov 15",
          tone: "primary",
        },
        {
          label: "Insurance Claims",
          value: "03",
          detail: "In processing",
        },
        {
          label: "Paid This Year",
          value: "$2.4k",
          detail: "Receipts available",
        },
      ]}
      rows={[
        {
          eyebrow: "Invoice HMS-2024-1042",
          title: "Annual physical examination",
          detail: "Insurance applied. Remaining patient responsibility: $84.",
          status: "Open",
        },
        {
          eyebrow: "Invoice HMS-2024-0988",
          title: "Comprehensive metabolic panel",
          detail: "Submitted to insurer on Oct 14 with supporting diagnostic code.",
          status: "Pending",
        },
        {
          eyebrow: "Receipt HMS-2024-0871",
          title: "Specialist consultation",
          detail: "Paid by card ending 0422. Receipt is available for download.",
          status: "Paid",
        },
      ]}
      secondaryPanel={{
        title: "Billing support hours",
        body: "The finance desk responds Monday through Friday, 08:00 to 17:00. Urgent coverage questions can be routed through secure support.",
        metadata: "Revenue cycle desk",
      }}
    />
  );
}
