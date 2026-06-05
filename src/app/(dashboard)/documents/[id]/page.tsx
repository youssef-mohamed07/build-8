import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { getDocumentById, deleteDocument } from "@/server/actions/documents.actions";
import { formatDate } from "@/lib/utils";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocumentById(id).catch(() => null);
  if (!doc) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/documents"
        backLabel="Documents"
        title={doc.name}
        subtitle={doc.folderPath}
        badge={{ label: doc.category.replace("_", " ") }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/documents/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={doc.fileUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /> Download</a>
            </Button>
            <DeleteEntityButton entityName={doc.name} deleteAction={deleteDocument.bind(null, id)} redirectTo="/documents" />
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <DetailGrid>
            <DetailField label="Category" value={<Badge>{doc.category.replace("_", " ")}</Badge>} />
            <DetailField label="Folder" value={doc.folderPath} />
            <DetailField label="MIME Type" value={doc.mimeType} />
            <DetailField label="File Size" value={doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "—"} />
            <DetailField label="Uploaded By" value={doc.uploader.name} />
            <DetailField label="Uploaded" value={formatDate(doc.createdAt)} />
            <DetailField label="Client" value={doc.client ? <Link href={`/clients/${doc.client.id}`} className="text-primary hover:underline">{doc.client.companyName}</Link> : "—"} />
            <DetailField label="Project" value={doc.project ? <Link href={`/projects/${doc.project.id}`} className="text-primary hover:underline">{doc.project.name}</Link> : "—"} />
            <DetailField label="Description" value={doc.description} className="sm:col-span-2 lg:col-span-3" />
          </DetailGrid>
          {doc.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {doc.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
