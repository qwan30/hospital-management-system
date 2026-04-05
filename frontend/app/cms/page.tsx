import type { Metadata } from "next";
import { CmsScreen } from "../../features/cms/cms-screen";

export const metadata: Metadata = {
  title: "CMS | Clinical Atelier",
  description: "Content management workspace for homepage sections and public announcements."
};

export default function CmsPage() {
  return <CmsScreen />;
}
