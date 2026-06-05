import { PageHeader } from "@/components/layout/page-header";
import { QuotationForm } from "@/features/quotations/components/quotation-form";
import { getClientsForSelect, getProjectsForSelect } from "@/server/actions/quotations.actions";

export default async function NewQuotationPage() {
  const [clients, projects] = await Promise.all([
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="New Quotation" description="Create a client quotation" />
      <QuotationForm clients={clients} projects={projects} />
    </div>
  );
}
