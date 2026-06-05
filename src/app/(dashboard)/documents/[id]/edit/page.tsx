import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DocumentForm } from "@/features/documents/components/document-form";
import { getDocumentById, getClientsForSelect, getProjectsForSelect } from "@/server/actions/documents.actions";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc, clients, projects] = await Promise.all([
    getDocumentById(id).catch(() => null),
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  if (!doc) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Document" description={doc.name} />
      <DocumentForm
        clients={clients}
        projects={projects}
        documentId={id}
        defaultValues={{
          name: doc.name,
          description: doc.description ?? "",
          fileUrl: doc.fileUrl,
          category: doc.category,
          folderPath: doc.folderPath,
          tags: doc.tags.join(", "),
          clientId: doc.clientId ?? "",
          projectId: doc.projectId ?? "",
        }}
      />
    </div>
  );
}
