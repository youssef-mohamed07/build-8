import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { QuotationForm } from "@/features/quotations/components/quotation-form";
import { getQuotationById, getClientsForSelect, getProjectsForSelect } from "@/server/actions/quotations.actions";
import { toInputDate } from "@/lib/utils";

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quotation, clients, projects] = await Promise.all([
    getQuotationById(id).catch(() => null),
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  if (!quotation) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Edit Quotation" description={quotation.number} />
      <QuotationForm
        clients={clients}
        projects={projects}
        quotationId={id}
        defaultValues={{
          clientId: quotation.clientId,
          projectId: quotation.projectId ?? "",
          title: quotation.title,
          scope: quotation.scope ?? "",
          tax: Number(quotation.tax),
          status: quotation.status,
          validUntil: toInputDate(quotation.validUntil),
          notes: quotation.notes ?? "",
          items: quotation.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
          })),
        }}
      />
    </div>
  );
}
