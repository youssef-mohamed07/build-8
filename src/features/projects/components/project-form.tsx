"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { projectSchema, type ProjectFormData } from "@/lib/validations/entities";
import { createProject, updateProject } from "@/server/actions/projects.actions";

export function ProjectForm({
  clients,
  defaultValues,
  projectId,
}: {
  clients: { id: string; companyName: string }[];
  defaultValues?: Partial<ProjectFormData>;
  projectId?: string;
}) {
  const router = useRouter();
  const isEditing = !!projectId;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: "PLANNING", ...defaultValues },
  });

  async function onSubmit(data: ProjectFormData) {
    if (isEditing) {
      const result = await updateProject(projectId, data);
      if (result.success) {
        toast.success("Project updated");
        router.push(`/projects/${projectId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createProject(data);
    if (result.success) {
      toast.success("Project created");
      router.push(`/projects/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Project Name *</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
          <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Input {...register("description")} /></div>
          <div className="space-y-2"><Label>Client *</Label>
            <select {...register("clientId")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              <option value="">Select client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Status</Label>
            <select {...register("status")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {["PLANNING", "ACTIVE", "REVIEW", "COMPLETED", "CANCELLED"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Budget ($)</Label><Input type="number" {...register("budget")} /></div>
          <div className="space-y-2"><Label>Start Date</Label><Input type="date" {...register("startDate")} /></div>
          <div className="space-y-2"><Label>Deadline</Label><Input type="date" {...register("deadline")} /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Create Project"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
