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
import { revenueSchema, type RevenueFormData } from "@/lib/validations/entities";
import { createRevenue, updateRevenue } from "@/server/actions/finance.actions";

const methods = ["BANK_TRANSFER", "CASH", "CREDIT_CARD", "PAYPAL", "WISE", "OTHER"];

export function RevenueForm({
  clients,
  projects,
  defaultValues,
  revenueId,
}: {
  clients: { id: string; companyName: string }[];
  projects: { id: string; name: string; clientId: string }[];
  defaultValues?: Partial<RevenueFormData>;
  revenueId?: string;
}) {
  const router = useRouter();
  const isEditing = !!revenueId;
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RevenueFormData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: { paymentMethod: "BANK_TRANSFER", isAdvance: false, ...defaultValues },
  });

  const clientId = useWatch({ control, name: "clientId" });
  const filteredProjects = useMemo(
    () => (clientId ? projects.filter((p) => p.clientId === clientId) : projects),
    [clientId, projects]
  );

  async function onSubmit(data: RevenueFormData) {
    if (isEditing) {
      const result = await updateRevenue(revenueId, data);
      if (result.success) {
        toast.success("Revenue updated");
        router.push(`/finance/revenue/${revenueId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createRevenue(data);
    if (result.success) {
      toast.success("Revenue recorded");
      router.push(`/finance/revenue/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="space-y-2"><Label>Amount ($) *</Label><Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
          <div className="space-y-2"><Label>Date *</Label><Input type="date" {...register("date")} /></div>
          <div className="space-y-2"><Label>Payment Method</Label>
            <select {...register("paymentMethod")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {methods.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="space-y-2 flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("isAdvance")} className="rounded" />
              Advance payment
            </label>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Input {...register("description")} /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Record Revenue"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
