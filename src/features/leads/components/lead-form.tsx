"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { leadSchema, type LeadFormData } from "@/lib/validations/entities";
import { createLead, updateLead } from "@/server/actions/leads.actions";

const stages = ["NEW", "CONTACTED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"];

export function LeadForm({ defaultValues, leadId }: { defaultValues?: Partial<LeadFormData>; leadId?: string }) {
  const router = useRouter();
  const isEditing = !!leadId;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { stage: "NEW", ...defaultValues },
  });

  async function onSubmit(data: LeadFormData) {
    if (isEditing) {
      const result = await updateLead(leadId, data);
      if (result.success) {
        toast.success("Lead updated");
        router.push(`/leads/${leadId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createLead(data);
    if (result.success) {
      toast.success("Lead created");
      router.push(`/leads/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Name *</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label>Company</Label><Input {...register("company")} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input {...register("phone")} /></div>
          <div className="space-y-2"><Label>Source</Label><Input {...register("source")} placeholder="Referral, LinkedIn..." /></div>
          <div className="space-y-2"><Label>Stage</Label>
            <select {...register("stage")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {stages.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Input {...register("notes")} /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Create Lead"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
