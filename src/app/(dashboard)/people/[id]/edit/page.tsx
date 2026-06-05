import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { PersonForm } from "@/features/people/components/person-form";
import { getPersonById } from "@/server/actions/people.actions";

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPersonById(id).catch(() => null);
  if (!person) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Person" description={person.fullName} />
      <PersonForm personId={id} defaultValues={{
        fullName: person.fullName, email: person.email ?? "", phone: person.phone ?? "",
        whatsapp: person.whatsapp ?? "", address: person.address ?? "",
        position: person.position ?? "", status: person.status,
        yearsExperience: person.yearsExperience ?? undefined,
        currentSalary: person.currentSalary ? Number(person.currentSalary) : undefined,
        expectedSalary: person.expectedSalary ? Number(person.expectedSalary) : undefined,
        portfolioUrl: person.portfolioUrl ?? "", linkedinUrl: person.linkedinUrl ?? "", githubUrl: person.githubUrl ?? "",
      }} />
    </div>
  );
}
