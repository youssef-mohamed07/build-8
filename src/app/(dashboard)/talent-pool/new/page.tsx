import { PageHeader } from "@/components/layout/page-header";
import { CandidateForm } from "@/features/candidates/components/candidate-form";

export default function NewCandidatePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Add Candidate" description="Add someone to the talent pool" />
      <CandidateForm />
    </div>
  );
}
