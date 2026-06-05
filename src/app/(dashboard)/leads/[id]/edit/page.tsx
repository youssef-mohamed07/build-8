import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LeadForm } from "@/features/leads/components/lead-form";
import { getLeadById } from "@/server/actions/leads.actions";

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id).catch(() => null);
  if (!lead) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Lead" description={lead.name} />
      <LeadForm leadId={id} defaultValues={{ name: lead.name, company: lead.company ?? "", email: lead.email ?? "", phone: lead.phone ?? "", source: lead.source ?? "", stage: lead.stage, notes: lead.notes ?? "" }} />
    </div>
  );
}
