import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { RevenueForm } from "@/features/finance/components/revenue-form";
import { getRevenueById, getClientsForSelect, getProjectsForSelect } from "@/server/actions/finance.actions";
import { toInputDate } from "@/lib/utils";

export default async function EditRevenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [revenue, clients, projects] = await Promise.all([
    getRevenueById(id).catch(() => null),
    getClientsForSelect().catch(() => []),
    getProjectsForSelect().catch(() => []),
  ]);
  if (!revenue) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Revenue" description={revenue.client.companyName} />
      <RevenueForm
        clients={clients}
        projects={projects}
        revenueId={id}
        defaultValues={{
          clientId: revenue.clientId,
          projectId: revenue.projectId ?? "",
          amount: Number(revenue.amount),
          date: toInputDate(revenue.date),
          paymentMethod: revenue.paymentMethod,
          description: revenue.description ?? "",
          isAdvance: revenue.isAdvance,
        }}
      />
    </div>
  );
}
