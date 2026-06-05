import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { getInvoices, getInvoiceStats, deleteInvoice } from "@/server/actions/invoices.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function InvoicesPage() {
  const currency = await getPreferredCurrency();
  const [invoices, stats] = await Promise.all([
    getInvoices().catch(() => []),
    getInvoiceStats().catch(() => ({ draft: 0, sent: 0, paid: 0, overdue: 0 })),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Create invoices and track payments" actions={
        <Button asChild><Link href="/invoices/new"><Plus className="h-4 w-4" />New Invoice</Link></Button>
      } />
      <PageStats stats={[
        { label: "Draft", value: stats.draft }, { label: "Sent", value: stats.sent },
        { label: "Paid", value: stats.paid }, { label: "Overdue", value: stats.overdue },
      ]} />
      <DataTable data={invoices} keyExtractor={(i) => i.id} rowHref={(i) => `/invoices/${i.id}`} columns={[
        { key: "number", header: "Number", cell: (i) => <Link href={`/invoices/${i.id}`} className="font-medium hover:underline">{i.number}</Link> },
        { key: "client", header: "Client", cell: (i) => <Link href={`/clients/${i.client.id}`} className="hover:underline">{i.client.companyName}</Link> },
        { key: "total", header: "Total", cell: (i) => formatCurrency(Number(i.total), currency) },
        { key: "status", header: "Status", cell: (i) => <Badge variant={i.status === "PAID" ? "success" : i.status === "OVERDUE" ? "destructive" : "warning"}>{i.status}</Badge> },
        { key: "due", header: "Due Date", cell: (i) => i.dueDate ? formatDate(i.dueDate) : "—" },
        { key: "paid", header: "Paid At", cell: (i) => i.paidAt ? formatDate(i.paidAt) : "—" },
        { key: "actions", header: "", className: "w-12", cell: (i) => <ListActionsCell viewHref={`/invoices/${i.id}`} editHref={`/invoices/${i.id}/edit`} entityName={i.number} deleteAction={deleteInvoice.bind(null, i.id)} listPath="/invoices" /> },
      ]} />
    </div>
  );
}
