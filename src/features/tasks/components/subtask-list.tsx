"use client";

import { useRouter } from "next/navigation";
import { toggleSubtask } from "@/server/actions/tasks.actions";

export function SubtaskList({
  subtasks,
  onDelete,
}: {
  subtasks: { id: string; title: string; completed: boolean }[];
  onDelete?: (id: string) => void;
}) {
  const router = useRouter();

  if (subtasks.length === 0) return <p className="text-sm text-muted-foreground">No subtasks.</p>;

  return (
    <ul className="space-y-2">
      {subtasks.map((s) => (
        <li key={s.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={s.completed}
            onChange={async () => {
              await toggleSubtask(s.id, !s.completed);
              router.refresh();
            }}
            className="h-4 w-4 rounded"
          />
          <span className={`flex-1 ${s.completed ? "text-sm text-muted-foreground line-through" : "text-sm"}`}>{s.title}</span>
          {onDelete && (
            <button type="button" onClick={() => onDelete(s.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
          )}
        </li>
      ))}
    </ul>
  );
}
