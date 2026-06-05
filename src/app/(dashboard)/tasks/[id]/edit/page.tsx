import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getTaskById, getProjectsForSelect } from "@/server/actions/tasks.actions";
import { getUsersForSelect } from "@/server/actions/users.actions";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, projects, users] = await Promise.all([
    getTaskById(id),
    getProjectsForSelect(),
    getUsersForSelect().catch(() => []),
  ]);
  if (!task) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Task" description={task.title} />
      <TaskForm
        taskId={id}
        projects={projects}
        users={users}
        defaultValues={{
          title: task.title,
          description: task.description ?? "",
          priority: task.priority,
          status: task.status,
          projectId: task.projectId ?? "",
          assigneeId: task.assigneeId ?? "",
          dueDate: task.dueDate?.toISOString().split("T")[0],
        }}
      />
    </div>
  );
}
