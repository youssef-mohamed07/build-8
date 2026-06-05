"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/entities";
import { createExpense, updateExpense } from "@/server/actions/finance.actions";

const categories = ["MARKETING", "HOSTING", "DOMAINS", "SOFTWARE", "SALARIES", "OPERATIONS", "OTHER"];

export function ExpenseForm({
  defaultValues,
  expenseId,
}: {
  defaultValues?: Partial<ExpenseFormData>;
  expenseId?: string;
}) {
  const router = useRouter();
  const isEditing = !!expenseId;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: "OTHER", ...defaultValues },
  });

  async function onSubmit(data: ExpenseFormData) {
    if (isEditing) {
      const result = await updateExpense(expenseId, data);
      if (result.success) {
        toast.success("Expense updated");
        router.push(`/finance/expense/${expenseId}`);
        router.refresh();
      } else toast.error(result.error);
      return;
    }
    const result = await createExpense(data);
    if (result.success) {
      toast.success("Expense recorded");
      router.push(`/finance/expense/${result.data.id}`);
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <Card><CardContent className="pt-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Category *</Label>
            <select {...register("category")} className="flex h-9 w-full rounded-lg border border-input px-3 text-sm">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Amount ($) *</Label><Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
          <div className="space-y-2"><Label>Date *</Label><Input type="date" {...register("date")} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Input {...register("description")} /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : isEditing ? "Update" : "Record Expense"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}
