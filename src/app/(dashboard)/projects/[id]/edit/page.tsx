import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/features/projects/components/project-form";
import { getProjectById, getClientsForSelect } from "@/server/actions/projects.actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, clients] = await Promise.all([getProjectById(id), getClientsForSelect()]);
  if (!project) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Project" description={project.name} />
      <ProjectForm
        projectId={id}
        clients={clients}
        defaultValues={{
          name: project.name,
          description: project.description ?? "",
          clientId: project.clientId,
          status: project.status,
          budget: project.budget ? Number(project.budget) : undefined,
          startDate: project.startDate?.toISOString().split("T")[0],
          deadline: project.deadline?.toISOString().split("T")[0],
        }}
      />
    </div>
  );
}
