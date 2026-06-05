import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { getQuotations, getQuotationStats, deleteQuotation } from "@/server/actions/quotations.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function QuotationsPage() {
  const currency = await getPreferredCurrency();
  const [quotations, stats] = await Promise.all([
    getQuotations().catch(() => []),
    getQuotationStats().catch(() => ({ draft: 0, sent: 0, accepted: 0, rejected: 0 })),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Quotations" description="Create and manage client quotations" actions={
        <Button asChild><Link href="/quotations/new"><Plus className="h-4 w-4" />New Quotation</Link></Button>
      } />
      <PageStats stats={[
        { label: "Draft", value: stats.draft }, { label: "Sent", value: stats.sent },
        { label: "Accepted", value: stats.accepted }, { label: "Rejected", value: stats.rejected },
      ]} />
      <DataTable data={quotations} keyExtractor={(q) => q.id} rowHref={(q) => `/quotations/${q.id}`} columns={[
        { key: "number", header: "Number", cell: (q) => <Link href={`/quotations/${q.id}`} className="font-medium hover:underline">{q.number}</Link> },
        { key: "title", header: "Title", cell: (q) => q.title },
        { key: "client", header: "Client", cell: (q) => <Link href={`/clients/${q.client.id}`} className="hover:underline">{q.client.companyName}</Link> },
        { key: "total", header: "Total", cell: (q) => formatCurrency(Number(q.total), currency) },
        { key: "status", header: "Status", cell: (q) => <Badge variant={q.status === "ACCEPTED" ? "success" : "default"}>{q.status}</Badge> },
        { key: "valid", header: "Valid Until", cell: (q) => q.validUntil ? formatDate(q.validUntil) : "—" },
        { key: "actions", header: "", className: "w-12", cell: (q) => <ListActionsCell viewHref={`/quotations/${q.id}`} editHref={`/quotations/${q.id}/edit`} entityName={q.number} deleteAction={deleteQuotation.bind(null, q.id)} listPath="/quotations" /> },
      ]} />
    </div>
  );
}
