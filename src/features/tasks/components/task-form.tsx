"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { taskSchema, type TaskFormData } from "@/lib/validations/entities";
import { createTask, updateTask } from "@/server/actions/tasks.actions";

export function TaskForm({
  projects,
  users,
  defaultValues,
  taskId,
}: {
  projects: { id: string; name: string }[];
  users: { id: string; name: string | null }[];
  defaultValues?: Partial<TaskFormData>;
  taskId?: string;
}) {
  const router = useRouter();
  const isEditing = !!taskId;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "MEDIUM", status: "TODO", ...defaultValues },
  });

  async function onSubmit(data: TaskFormData) {
    if (isEditing) {
      const result = await updateTask(taskId, data);
      if (result.success) {
        toast.success("Task updated");
        router.push(`/tasks/${taskId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createTask(data);
    if (result.success) {
      toast.success("Task created");
      router.push(`/tasks/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Title *</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Input {...register("description")} /></div>
          <div className="space-y-2"><Label>Project</Label>
            <select {...register("projectId")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Assignee</Label>
            <select {...register("assigneeId")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name ?? u.id}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Due Date</Label><Input type="date" {...register("dueDate")} /></div>
          <div className="space-y-2"><Label>Priority</Label>
            <select {...register("priority")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Status</Label>
            <select {...register("status")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Create Task"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
