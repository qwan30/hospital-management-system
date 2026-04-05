import type { Metadata } from "next";
import { CmsSectionEditorScreen } from "../../../../features/cms/cms-section-editor-screen";

type CmsSectionEditorPageProps = {
  readonly params: Promise<{
    readonly sectionId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Section Editor | Clinical Atelier",
  description: "Detailed editor for homepage section content."
};

export default async function CmsSectionEditorPage({
  params
}: CmsSectionEditorPageProps) {
  const { sectionId } = await params;
  return <CmsSectionEditorScreen sectionId={sectionId} />;
}
