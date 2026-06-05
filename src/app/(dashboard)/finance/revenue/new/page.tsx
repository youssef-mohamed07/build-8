import { PageHeader } from "@/components/layout/page-header";
import { RevenueForm } from "@/features/finance/components/revenue-form";
import { getClientsForSelect, getProjectsForSelect } from "@/server/actions/finance.actions";

export default async function NewRevenuePage() {
  const [clients, projects] = await Promise.all([
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Record Revenue" description="Log a new payment received" />
      <RevenueForm clients={clients} projects={projects} />
    </div>
  );
}
