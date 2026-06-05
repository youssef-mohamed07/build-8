import { Plus, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { TasksKanban } from "@/features/tasks/components/tasks-kanban";
import { getTasks, getTaskStats, deleteTask } from "@/server/actions/tasks.actions";
import { formatDate } from "@/lib/utils";

const statusOptions = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((s) => ({
  value: s,
  label: s.replace("_", " "),
}));

function queryString(params: Record<string, string | undefined>, extra?: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  Object.entries({ ...params, ...extra }).forEach(([k, v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; view?: string }>;
}) {
  const params = await searchParams;
  const [tasks, stats] = await Promise.all([
    getTasks({ search: params.q, status: params.status }).catch(() => []),
    getTaskStats().catch(() => ({ todo: 0, inProgress: 0, review: 0, done: 0 })),
  ]);
  const isKanban = params.view === "kanban";

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Track and manage team tasks" actions={
        <Button asChild><Link href="/tasks/new"><Plus className="h-4 w-4" />New Task</Link></Button>
      } />
      <PageStats stats={[
        { label: "Todo", value: stats.todo }, { label: "In Progress", value: stats.inProgress },
        { label: "Review", value: stats.review }, { label: "Done", value: stats.done },
      ]} />
      <ListToolbar
        searchPlaceholder="Search tasks..."
        filters={[{ key: "status", label: "All statuses", options: statusOptions }]}
        viewToggle={
          <div className="flex gap-1">
            <Button variant={!isKanban ? "default" : "outline"} size="sm" asChild>
              <Link href={`/tasks${queryString({ q: params.q, status: params.status })}`}><List className="h-4 w-4" /></Link>
            </Button>
            <Button variant={isKanban ? "default" : "outline"} size="sm" asChild>
              <Link href={`/tasks${queryString({ q: params.q, status: params.status, view: "kanban" })}`}><LayoutGrid className="h-4 w-4" /></Link>
            </Button>
          </div>
        }
      />
      {isKanban ? (
        <TasksKanban tasks={tasks} />
      ) : (
        <DataTable data={tasks} keyExtractor={(t) => t.id} rowHref={(t) => `/tasks/${t.id}`} columns={[
          { key: "title", header: "Task", cell: (t) => <Link href={`/tasks/${t.id}`} className="font-medium hover:underline">{t.title}</Link> },
          { key: "project", header: "Project", cell: (t) => t.project ? <Link href={`/projects/${t.project.id}`} className="hover:underline">{t.project.name}</Link> : "—" },
          { key: "assignee", header: "Assignee", cell: (t) => t.assignee?.name ?? "Unassigned" },
          { key: "priority", header: "Priority", cell: (t) => <Badge variant={t.priority === "CRITICAL" ? "destructive" : "default"}>{t.priority}</Badge> },
          { key: "status", header: "Status", cell: (t) => <Badge variant={t.status === "DONE" ? "success" : "default"}>{t.status.replace("_", " ")}</Badge> },
          { key: "due", header: "Due", cell: (t) => t.dueDate ? formatDate(t.dueDate) : "—" },
          { key: "actions", header: "", className: "w-12", cell: (t) => <ListActionsCell viewHref={`/tasks/${t.id}`} editHref={`/tasks/${t.id}/edit`} entityName={t.title} deleteAction={deleteTask.bind(null, t.id)} listPath="/tasks" /> },
        ]} />
      )}
    </div>
  );
}
