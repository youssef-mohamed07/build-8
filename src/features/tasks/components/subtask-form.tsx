"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSubtask, deleteSubtask } from "@/server/actions/tasks.actions";
import { SubtaskList } from "./subtask-list";

export function SubtaskPanel({
  taskId,
  subtasks,
}: {
  taskId: string;
  subtasks: { id: string; title: string; completed: boolean }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const result = await addSubtask(taskId, title.trim());
    setLoading(false);
    if (result.success) {
      setTitle("");
      router.refresh();
    } else toast.error(result.error);
  }

  async function handleDelete(subtaskId: string) {
    const result = await deleteSubtask(subtaskId, taskId);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  return (
    <div className="space-y-3">
      <SubtaskList subtasks={subtasks} onDelete={handleDelete} />
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add subtask..." />
        <Button type="submit" size="sm" disabled={loading || !title.trim()}>Add</Button>
      </form>
    </div>
  );
}
