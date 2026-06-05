import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { getClientsForSelect, getProjectsForSelect } from "@/server/actions/invoices.actions";

export default async function NewInvoicePage() {
  const [clients, projects] = await Promise.all([
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="New Invoice" description="Create a client invoice" />
      <InvoiceForm clients={clients} projects={projects} />
    </div>
  );
}
