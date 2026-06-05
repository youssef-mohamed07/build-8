import { PageHeader } from "@/components/layout/page-header";
import { ExpenseForm } from "@/features/finance/components/expense-form";

export default function NewExpensePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Record Expense" description="Log a new business expense" />
      <ExpenseForm />
    </div>
  );
}
