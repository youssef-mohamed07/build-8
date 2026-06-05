import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Pagination } from "@/components/shared/pagination";
import { getClients, deleteClient } from "@/server/actions/clients.actions";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary"> = {
  LEAD: "secondary", PROSPECT: "warning", ACTIVE: "success", INACTIVE: "default",
};

const statusOptions = ["LEAD", "PROSPECT", "ACTIVE", "INACTIVE"].map((s) => ({
  value: s,
  label: s.replace("_", " "),
}));

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { data: clients, totalPages } = await getClients({
    search: params.q,
    status: params.status,
    page,
    limit: 20,
  }).catch(() => ({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }));

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Manage your client relationships" actions={
        <Button asChild><Link href="/clients/new"><Plus className="h-4 w-4" />Add Client</Link></Button>
      } />
      <Suspense>
        <ListToolbar
          searchPlaceholder="Search clients..."
          filters={[{ key: "status", label: "All statuses", options: statusOptions }]}
        />
      </Suspense>
      <DataTable
        data={clients}
        keyExtractor={(c) => c.id}
        rowHref={(c) => `/clients/${c.id}`}
        columns={[
          { key: "company", header: "Company", cell: (c) => <Link href={`/clients/${c.id}`} className="font-medium hover:underline">{c.companyName}</Link> },
          { key: "contact", header: "Contact", cell: (c) => c.contactPerson ?? "—" },
          { key: "email", header: "Email", cell: (c) => c.email ?? "—" },
          { key: "status", header: "Status", cell: (c) => <Badge variant={statusVariant[c.status] ?? "default"}>{c.status.replace("_", " ")}</Badge> },
          { key: "projects", header: "Projects", cell: (c) => c._count.projects },
          { key: "created", header: "Created", cell: (c) => formatDate(c.createdAt) },
          { key: "actions", header: "", className: "w-12", cell: (c) => (
            <ListActionsCell viewHref={`/clients/${c.id}`} editHref={`/clients/${c.id}/edit`} entityName={c.companyName} deleteAction={deleteClient.bind(null, c.id)} listPath="/clients" />
          )},
        ]}
      />
      <Suspense>
        <Pagination page={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
