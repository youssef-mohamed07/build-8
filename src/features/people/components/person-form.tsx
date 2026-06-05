"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { personSchema, type PersonFormData } from "@/lib/validations/entities";
import { createPerson, updatePerson } from "@/server/actions/people.actions";

export function PersonForm({ defaultValues, personId }: { defaultValues?: Partial<PersonFormData>; personId?: string }) {
  const router = useRouter();
  const isEditing = !!personId;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: { status: "ACTIVE", ...defaultValues },
  });

  async function onSubmit(data: PersonFormData) {
    if (isEditing) {
      const result = await updatePerson(personId, data);
      if (result.success) {
        toast.success("Updated");
        router.push(`/people/${personId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createPerson(data);
    if (result.success) {
      toast.success("Person created");
      router.push(`/people/${result.data.id}`);
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
          <div className="space-y-2"><Label>WhatsApp</Label><Input {...register("whatsapp")} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input {...register("address")} /></div>
          <div className="space-y-2"><Label>Position</Label><Input {...register("position")} /></div>
          <div className="space-y-2"><Label>Status</Label>
            <select {...register("status")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {["CANDIDATE", "ACTIVE", "ON_HOLD", "FREELANCER", "FORMER_MEMBER"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Years Experience</Label><Input type="number" {...register("yearsExperience", { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>Current Salary</Label><Input type="number" {...register("currentSalary", { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>Expected Salary</Label><Input type="number" {...register("expectedSalary", { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>Portfolio URL</Label><Input {...register("portfolioUrl")} placeholder="https://..." /></div>
          <div className="space-y-2"><Label>LinkedIn</Label><Input {...register("linkedinUrl")} placeholder="https://linkedin.com/in/..." /></div>
          <div className="space-y-2"><Label>GitHub</Label><Input {...register("githubUrl")} placeholder="https://github.com/..." /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Add Person"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
