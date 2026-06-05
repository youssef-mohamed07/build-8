import { PageHeader } from "@/components/layout/page-header";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getProjectsForSelect } from "@/server/actions/tasks.actions";
import { getUsersForSelect } from "@/server/actions/users.actions";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const [projects, users] = await Promise.all([
    getProjectsForSelect().catch(() => []),
    getUsersForSelect().catch(() => []),
  ]);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New Task" description="Create a team task" />
      <TaskForm projects={projects} users={users} defaultValues={projectId ? { projectId } : undefined} />
    </div>
  );
}
