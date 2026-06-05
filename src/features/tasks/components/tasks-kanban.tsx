"use client";

import { KanbanBoard } from "@/components/shared/kanban-board";
import { updateTaskStatus } from "@/server/actions/tasks.actions";

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export function TasksKanban({
  tasks,
}: {
  tasks: { id: string; title: string; assignee?: { name: string | null } | null; status: string }[];
}) {
  const columns = STATUSES.map((status) => ({
    id: status,
    title: status.replace("_", " "),
    items: tasks
      .filter((t) => t.status === status)
      .map((t) => ({
        id: t.id,
        href: `/tasks/${t.id}`,
        title: t.title,
        subtitle: t.assignee?.name ?? undefined,
      })),
  }));

  return (
    <KanbanBoard
      columns={columns}
      onMove={async (itemId, columnId) => updateTaskStatus(itemId, columnId)}
    />
  );
}
