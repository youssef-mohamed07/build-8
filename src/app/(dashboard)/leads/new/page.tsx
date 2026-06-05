import { PageHeader } from "@/components/layout/page-header";
import { LeadForm } from "@/features/leads/components/lead-form";

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Add Lead" description="Track a new sales opportunity" />
      <LeadForm />
    </div>
  );
}
