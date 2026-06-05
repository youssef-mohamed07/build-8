import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/features/projects/components/project-form";
import { getClientsForSelect } from "@/server/actions/projects.actions";

export default async function NewProjectPage() {
  const clients = await getClientsForSelect().catch(() => []);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New Project" description="Create a client project" />
      <ProjectForm clients={clients} />
    </div>
  );
}
