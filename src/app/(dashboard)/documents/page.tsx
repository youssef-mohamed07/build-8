import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { getDocuments, deleteDocument } from "@/server/actions/documents.actions";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage() {
  const documents = await getDocuments().catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Store and organize company documents" actions={
        <Button asChild><Link href="/documents/new"><Plus className="h-4 w-4" />Upload Document</Link></Button>
      } />
      <DataTable data={documents} keyExtractor={(d) => d.id} rowHref={(d) => `/documents/${d.id}`} columns={[
        { key: "name", header: "Name", cell: (d) => <Link href={`/documents/${d.id}`} className="font-medium hover:underline">{d.name}</Link> },
        { key: "category", header: "Category", cell: (d) => <Badge variant="default">{d.category.replace("_", " ")}</Badge> },
        { key: "folder", header: "Folder", cell: (d) => d.folderPath },
        { key: "client", header: "Client", cell: (d) => d.client ? <Link href={`/clients/${d.client.id}`} className="hover:underline">{d.client.companyName}</Link> : "—" },
        { key: "project", header: "Project", cell: (d) => d.project ? <Link href={`/projects/${d.project.id}`} className="hover:underline">{d.project.name}</Link> : "—" },
        { key: "uploader", header: "Uploaded By", cell: (d) => d.uploader.name ?? "—" },
        { key: "date", header: "Date", cell: (d) => formatDate(d.createdAt) },
        { key: "actions", header: "", className: "w-12", cell: (d) => <ListActionsCell viewHref={`/documents/${d.id}`} editHref={`/documents/${d.id}/edit`} entityName={d.name} deleteAction={deleteDocument.bind(null, d.id)} listPath="/documents" /> },
      ]} />
    </div>
  );
}
