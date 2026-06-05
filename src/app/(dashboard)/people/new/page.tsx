import { PageHeader } from "@/components/layout/page-header";
import { PersonForm } from "@/features/people/components/person-form";

export default function NewPersonPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Add Person" description="Add a team member or contact" />
      <PersonForm />
    </div>
  );
}
