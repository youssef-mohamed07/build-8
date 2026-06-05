"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LineItemsEditor } from "@/components/shared/line-items-editor";
import { quotationSchema, type QuotationFormData } from "@/lib/validations/entities";
import { createQuotation, updateQuotation } from "@/server/actions/quotations.actions";

export function QuotationForm({
  clients,
  projects,
  defaultValues,
  quotationId,
}: {
  clients: { id: string; companyName: string }[];
  projects: { id: string; name: string; clientId: string }[];
  defaultValues?: Partial<QuotationFormData>;
  quotationId?: string;
}) {
  const router = useRouter();
  const isEditing = !!quotationId;
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      status: "DRAFT",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  });

  const clientId = useWatch({ control, name: "clientId" });
  const filteredProjects = useMemo(
    () => (clientId ? projects.filter((p) => p.clientId === clientId) : projects),
    [clientId, projects]
  );

  async function onSubmit(data: QuotationFormData) {
    if (isEditing) {
      const result = await updateQuotation(quotationId, data);
      if (result.success) {
        toast.success("Quotation updated");
        router.push(`/quotations/${quotationId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createQuotation(data);
    if (result.success) {
      toast.success("Quotation created");
      router.push(`/quotations/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Title *</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="space-y-2"><Label>Client *</Label>
            <select {...register("clientId")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              <option value="">Select client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Project</Label>
            <select {...register("projectId")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              <option value="">None</option>
              {filteredProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Status</Label>
            <select {...register("status")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {["DRAFT", "SENT", "ACCEPTED", "REJECTED"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Valid Until</Label><Input type="date" {...register("validUntil")} /></div>
          <div className="space-y-2"><Label>Tax ($)</Label><Input type="number" step="0.01" {...register("tax", { valueAsNumber: true })} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Scope</Label><Input {...register("scope")} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Input {...register("notes")} /></div>
        </div>
        <LineItemsEditor control={control} register={register} errors={errors} />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Create Quotation"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
