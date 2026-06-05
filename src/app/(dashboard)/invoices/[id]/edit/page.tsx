import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { getInvoiceById, getClientsForSelect, getProjectsForSelect } from "@/server/actions/invoices.actions";
import { toInputDate } from "@/lib/utils";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, clients, projects] = await Promise.all([
    getInvoiceById(id).catch(() => null),
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Edit Invoice" description={invoice.number} />
      <InvoiceForm
        clients={clients}
        projects={projects}
        invoiceId={id}
        defaultValues={{
          clientId: invoice.clientId,
          projectId: invoice.projectId ?? "",
          tax: Number(invoice.tax),
          status: invoice.status,
          dueDate: toInputDate(invoice.dueDate),
          notes: invoice.notes ?? "",
          items: invoice.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
          })),
        }}
      />
    </div>
  );
}
