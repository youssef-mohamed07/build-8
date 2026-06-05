import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CandidateForm } from "@/features/candidates/components/candidate-form";
import { getCandidateById } from "@/server/actions/candidates.actions";

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidateById(id).catch(() => null);
  if (!candidate) notFound();
  const { person } = candidate;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Candidate" description={person.fullName} />
      <CandidateForm
        candidateId={id}
        defaultValues={{
          fullName: person.fullName,
          email: person.email ?? "",
          phone: person.phone ?? "",
          position: person.position ?? "",
          yearsExperience: person.yearsExperience ? Number(person.yearsExperience) : undefined,
          experienceLevel: candidate.experienceLevel ?? "",
          cvUrl: candidate.cvUrl ?? "",
          stage: candidate.stage,
          interviewNotes: candidate.interviewNotes ?? "",
          testResults: candidate.testResults ?? "",
        }}
      />
    </div>
  );
}
