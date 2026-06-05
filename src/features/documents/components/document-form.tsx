"use client";

import { useMemo } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileUploadField } from "@/components/shared/file-upload-field";
import { documentSchema, type DocumentFormData } from "@/lib/validations/entities";
import { createDocument, updateDocument } from "@/server/actions/documents.actions";

const categories = ["CONTRACT", "CLIENT_FILE", "PROJECT_FILE", "TEAM_DOCUMENT", "CANDIDATE_CV", "OTHER"];

export function DocumentForm({
  clients,
  projects,
  defaultValues,
  documentId,
}: {
  clients: { id: string; companyName: string }[];
  projects: { id: string; name: string; clientId: string }[];
  defaultValues?: Partial<DocumentFormData>;
  documentId?: string;
}) {
  const router = useRouter();
  const isEditing = !!documentId;
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: { category: "OTHER", folderPath: "/", fileUrl: "", ...defaultValues },
  });

  const clientId = useWatch({ control, name: "clientId" });
  const filteredProjects = useMemo(
    () => (clientId ? projects.filter((p) => p.clientId === clientId) : projects),
    [clientId, projects]
  );

  async function onSubmit(data: DocumentFormData) {
    if (isEditing) {
      const result = await updateDocument(documentId, data);
      if (result.success) {
        toast.success("Document updated");
        router.push(`/documents/${documentId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createDocument(data);
    if (result.success) {
      toast.success("Document created");
      router.push(`/documents/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Name *</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
          <div className="space-y-2 sm:col-span-2">
            <Controller
              name="fileUrl"
              control={control}
              render={({ field }) => (
                <FileUploadField value={field.value} onChange={field.onChange} label="File *" />
              )}
            />
            {errors.fileUrl && <p className="text-xs text-destructive">{errors.fileUrl.message}</p>}
          </div>
          <div className="space-y-2"><Label>Category</Label>
            <select {...register("category")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Folder Path</Label><Input {...register("folderPath")} placeholder="/contracts" /></div>
          <div className="space-y-2"><Label>Client</Label>
            <select {...register("clientId")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              <option value="">None</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Project</Label>
            <select {...register("projectId")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              <option value="">None</option>
              {filteredProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label>Tags (comma-separated)</Label><Input {...register("tags")} placeholder="contract, signed" /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Input {...register("description")} /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Upload Document"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
