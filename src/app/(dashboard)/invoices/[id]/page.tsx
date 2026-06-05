import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusUpdater } from "@/components/shared/status-updater";
import { getInvoiceById, deleteInvoice, updateInvoiceStatus } from "@/server/actions/invoices.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

const statuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((s) => ({ value: s, label: s }));

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const invoice = await getInvoiceById(id).catch(() => null);
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/invoices"
        backLabel="Invoices"
        title={invoice.number}
        subtitle={invoice.client.companyName}
        badge={{ label: invoice.status, variant: invoice.status === "PAID" ? "success" : invoice.status === "OVERDUE" ? "destructive" : "warning" }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/invoices/${id}/print`} target="_blank"><FileText className="h-4 w-4" /> Print</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/invoices/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </Button>
            <StatusUpdater value={invoice.status} options={statuses} onUpdate={updateInvoiceStatus.bind(null, id)} />
            <DeleteEntityButton entityName={invoice.number} deleteAction={deleteInvoice.bind(null, id)} redirectTo="/invoices" />
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <DetailGrid>
            <DetailField label="Client" value={<Link href={`/clients/${invoice.client.id}`} className="text-primary hover:underline">{invoice.client.companyName}</Link>} />
            <DetailField label="Project" value={invoice.project ? <Link href={`/projects/${invoice.project.id}`} className="text-primary hover:underline">{invoice.project.name}</Link> : "—"} />
            <DetailField label="Due Date" value={invoice.dueDate ? formatDate(invoice.dueDate) : "—"} />
            <DetailField label="Paid At" value={invoice.paidAt ? formatDate(invoice.paidAt) : "—"} />
            <DetailField label="Subtotal" value={formatCurrency(Number(invoice.subtotal), currency)} />
            <DetailField label="Tax" value={formatCurrency(Number(invoice.tax), currency)} />
            <DetailField label="Total" value={<span className="text-lg font-bold">{formatCurrency(Number(invoice.total), currency)}</span>} />
          </DetailGrid>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b">{["Description", "Qty", "Unit Price", "Total"].map((h) => <th key={h} className="pb-2 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{invoice.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatCurrency(Number(item.unitPrice), currency)}</td>
                <td className="py-2 font-medium">{formatCurrency(Number(item.total), currency)}</td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
