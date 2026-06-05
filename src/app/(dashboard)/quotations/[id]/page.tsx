import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusUpdater } from "@/components/shared/status-updater";
import { FileText } from "lucide-react";
import { ActionButton } from "@/components/shared/action-button";
import { getQuotationById, deleteQuotation, updateQuotationStatus } from "@/server/actions/quotations.actions";
import { createInvoiceFromQuotation } from "@/server/actions/invoices.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

const statuses = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"].map((s) => ({ value: s, label: s }));

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const quotation = await getQuotationById(id).catch(() => null);
  if (!quotation) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/quotations"
        backLabel="Quotations"
        title={quotation.title}
        subtitle={quotation.number}
        badge={{ label: quotation.status, variant: quotation.status === "ACCEPTED" ? "success" : "default" }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quotations/${id}/print`} target="_blank"><FileText className="h-4 w-4" /> Print</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quotations/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </Button>
            {quotation.status !== "REJECTED" && (
              <ActionButton
                label="Create Invoice"
                action={createInvoiceFromQuotation.bind(null, id)}
                redirectTo="/invoices"
              />
            )}
            <StatusUpdater value={quotation.status} options={statuses} onUpdate={updateQuotationStatus.bind(null, id)} />
            <DeleteEntityButton entityName={quotation.number} deleteAction={deleteQuotation.bind(null, id)} redirectTo="/quotations" />
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <DetailGrid>
            <DetailField label="Client" value={<Link href={`/clients/${quotation.client.id}`} className="text-primary hover:underline">{quotation.client.companyName}</Link>} />
            <DetailField label="Project" value={quotation.project ? <Link href={`/projects/${quotation.project.id}`} className="text-primary hover:underline">{quotation.project.name}</Link> : "—"} />
            <DetailField label="Valid Until" value={quotation.validUntil ? formatDate(quotation.validUntil) : "—"} />
            <DetailField label="Subtotal" value={formatCurrency(Number(quotation.subtotal), currency)} />
            <DetailField label="Tax" value={formatCurrency(Number(quotation.tax), currency)} />
            <DetailField label="Total" value={<span className="text-lg">{formatCurrency(Number(quotation.total), currency)}</span>} />
          </DetailGrid>
          {quotation.scope && <div className="mt-4"><p className="text-xs font-medium text-muted-foreground">Scope</p><p className="mt-1 text-sm whitespace-pre-wrap">{quotation.scope}</p></div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b">{["Description", "Qty", "Unit Price", "Total"].map((h) => <th key={h} className="pb-2 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{quotation.items.map((item) => (
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
