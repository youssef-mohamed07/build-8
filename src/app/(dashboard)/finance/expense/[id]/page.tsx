import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { getExpenseById, deleteExpense } from "@/server/actions/finance.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const expense = await getExpenseById(id).catch(() => null);
  if (!expense) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/finance"
        backLabel="Finance"
        title={expense.description ?? expense.category}
        subtitle={expense.category.replace(/_/g, " ")}
        badge={{ label: "Expense", variant: "destructive" }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/finance/expense/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </Button>
            <DeleteEntityButton entityName="expense entry" deleteAction={deleteExpense.bind(null, id)} redirectTo="/finance" />
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <DetailGrid>
            <DetailField label="Amount" value={<span className="text-lg font-semibold text-red-600">{formatCurrency(Number(expense.amount), currency)}</span>} />
            <DetailField label="Date" value={formatDate(expense.date)} />
            <DetailField label="Category" value={<Badge>{expense.category}</Badge>} />
            <DetailField label="Description" value={expense.description} className="sm:col-span-2" />
          </DetailGrid>
        </CardContent>
      </Card>
    </div>
  );
}
