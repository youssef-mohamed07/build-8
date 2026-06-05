import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusUpdater } from "@/components/shared/status-updater";
import { NoteForm } from "@/components/shared/note-form";
import { SubtaskPanel } from "@/features/tasks/components/subtask-form";
import { getTaskById, deleteTask, updateTaskStatus } from "@/server/actions/tasks.actions";
import { addTaskComment } from "@/server/actions/comments.actions";
import { formatDate } from "@/lib/utils";

const statuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((s) => ({ value: s, label: s.replace("_", " ") }));

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTaskById(id).catch(() => null);
  if (!task) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/tasks"
        backLabel="Tasks"
        title={task.title}
        subtitle={task.project?.name}
        badge={{ label: task.status.replace("_", " "), variant: task.status === "DONE" ? "success" : "default" }}
        actions={
          <>
            <StatusUpdater value={task.status} options={statuses} onUpdate={updateTaskStatus.bind(null, id)} />
            <Button variant="outline" size="sm" asChild><Link href={`/tasks/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link></Button>
            <DeleteEntityButton entityName={task.title} deleteAction={deleteTask.bind(null, id)} redirectTo="/tasks" />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailField label="Priority" value={<Badge variant={task.priority === "CRITICAL" ? "destructive" : "warning"}>{task.priority}</Badge>} />
              <DetailField label="Assignee" value={task.assignee?.name ?? "Unassigned"} />
              <DetailField label="Due Date" value={task.dueDate ? formatDate(task.dueDate) : "—"} />
              <DetailField label="Created By" value={task.creator.name} />
              <DetailField label="Project" value={task.project ? <Link href={`/projects/${task.project.id}`} className="text-primary hover:underline">{task.project.name}</Link> : "—"} />
              <DetailField label="Client" value={task.project?.client?.companyName} />
              <DetailField label="Description" value={task.description} className="sm:col-span-2 lg:col-span-3" />
            </DetailGrid>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Subtasks</CardTitle></CardHeader>
          <CardContent>
            <SubtaskPanel taskId={id} subtasks={task.subtasks} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Comments</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <NoteForm onSubmit={addTaskComment.bind(null, id)} placeholder="Add a comment..." />
          {task.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="space-y-3">{task.comments.map((c) => (
              <li key={c.id} className="rounded-lg border p-3">
                <p className="text-sm">{c.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.author.name} · {formatDate(c.createdAt)}</p>
              </li>
            ))}</ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
