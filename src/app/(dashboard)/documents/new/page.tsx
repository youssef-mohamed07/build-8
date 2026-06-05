import { PageHeader } from "@/components/layout/page-header";
import { DocumentForm } from "@/features/documents/components/document-form";
import { getClientsForSelect, getProjectsForSelect } from "@/server/actions/documents.actions";

export default async function NewDocumentPage() {
  const [clients, projects] = await Promise.all([
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Upload Document" description="Add a document to the library" />
      <DocumentForm clients={clients} projects={projects} />
    </div>
  );
}
