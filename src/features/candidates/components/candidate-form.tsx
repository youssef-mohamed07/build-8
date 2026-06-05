"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { candidateSchema, type CandidateFormData } from "@/lib/validations/entities";
import { createCandidate, updateCandidateFull } from "@/server/actions/candidates.actions";

const stages = ["NEW", "CONTACTED", "INTERVIEW", "TECHNICAL_TEST", "ACCEPTED", "REJECTED", "HIRED"];

export function CandidateForm({
  defaultValues,
  candidateId,
}: {
  defaultValues?: Partial<CandidateFormData>;
  candidateId?: string;
}) {
  const router = useRouter();
  const isEditing = !!candidateId;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { stage: "NEW", ...defaultValues },
  });

  async function onSubmit(data: CandidateFormData) {
    if (isEditing) {
      const result = await updateCandidateFull(candidateId, data);
      if (result.success) {
        toast.success("Candidate updated");
        router.push(`/talent-pool/${candidateId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createCandidate(data);
    if (result.success) {
      toast.success("Candidate added");
      router.push(`/talent-pool/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label>Full Name *</Label><Input {...register("fullName")} />{errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}</div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input {...register("phone")} /></div>
          <div className="space-y-2"><Label>Position</Label><Input {...register("position")} /></div>
          <div className="space-y-2"><Label>Experience Level</Label><Input {...register("experienceLevel")} placeholder="Junior, Mid, Senior" /></div>
          <div className="space-y-2"><Label>Years Experience</Label><Input type="number" {...register("yearsExperience", { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>CV URL</Label><Input {...register("cvUrl")} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>Stage</Label>
            <select {...register("stage")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {stages.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label>Interview Notes</Label><Input {...register("interviewNotes")} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Test Results</Label><Input {...register("testResults")} /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Add Candidate"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
