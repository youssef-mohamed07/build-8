import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ExpenseForm } from "@/features/finance/components/expense-form";
import { getExpenseById } from "@/server/actions/finance.actions";
import { toInputDate } from "@/lib/utils";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await getExpenseById(id).catch(() => null);
  if (!expense) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit Expense" description={expense.category} />
      <ExpenseForm
        expenseId={id}
        defaultValues={{
          category: expense.category,
          amount: Number(expense.amount),
          date: toInputDate(expense.date),
          description: expense.description ?? "",
        }}
      />
    </div>
  );
}
