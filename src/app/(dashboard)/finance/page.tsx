import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { FinanceEquityPanel } from "@/features/finance/components/finance-equity-panel";
import {
  getRevenues,
  getExpenses,
  getFinanceStats,
  getProfitDistribution,
  deleteRevenue,
  deleteExpense,
} from "@/server/actions/finance.actions";
import { getWithdrawals, getFoundersForSelect } from "@/server/actions/withdrawals.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function FinancePage() {
  const currency = await getPreferredCurrency();
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const now = new Date();

  const [revenues, expenses, stats, distribution, withdrawals, founders] = await Promise.all([
    getRevenues().catch(() => []),
    getExpenses().catch(() => []),
    getFinanceStats().catch(() => ({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, cashFlow: 0 })),
    getProfitDistribution(yearStart, now).catch(() => ({ netProfit: 0, youssef: 0, saif: 0, companyReserve: 0 })),
    getWithdrawals().catch(() => []),
    getFoundersForSelect().catch(() => []),
  ]);

  const transactions = [
    ...revenues.map((r) => ({
      id: r.id,
      type: "Revenue" as const,
      description: r.description ?? r.client.companyName,
      amount: Number(r.amount),
      date: r.date,
      category: r.paymentMethod.replace(/_/g, " "),
      viewHref: `/finance/revenue/${r.id}`,
      editHref: `/finance/revenue/${r.id}/edit`,
      deleteAction: deleteRevenue.bind(null, r.id),
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: "Expense" as const,
      description: e.description ?? e.category,
      amount: -Number(e.amount),
      date: e.date,
      category: e.category,
      viewHref: `/finance/expense/${e.id}`,
      editHref: `/finance/expense/${e.id}/edit`,
      deleteAction: deleteExpense.bind(null, e.id),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Track revenue, expenses, and founder equity"
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/finance/revenue/new"><Plus className="h-4 w-4" />Revenue</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/finance/expense/new"><Plus className="h-4 w-4" />Expense</Link>
            </Button>
          </div>
        }
      />
      <PageStats
        stats={[
          { label: "Total Revenue", value: formatCurrency(stats.totalRevenue, currency) },
          { label: "Total Expenses", value: formatCurrency(stats.totalExpenses, currency) },
          { label: "Net Profit", value: formatCurrency(stats.netProfit, currency) },
          { label: "Cash Flow", value: formatCurrency(stats.cashFlow, currency) },
        ]}
      />
      <FinanceEquityPanel
        distribution={distribution}
        founders={founders}
        withdrawals={withdrawals}
      />
      <DataTable
        data={transactions}
        keyExtractor={(t) => `${t.type}-${t.id}`}
        rowHref={(t) => t.viewHref}
        columns={[
          {
            key: "type",
            header: "Type",
            cell: (t) => (
              <Badge variant={t.type === "Revenue" ? "success" : "destructive"}>{t.type}</Badge>
            ),
          },
          {
            key: "description",
            header: "Description",
            cell: (t) => <Link href={t.viewHref} className="font-medium hover:underline">{t.description}</Link>,
          },
          {
            key: "amount",
            header: "Amount",
            cell: (t) => (
              <span className={t.amount >= 0 ? "text-emerald-600" : "text-red-600"}>
                {formatCurrency(Math.abs(t.amount), currency)}
              </span>
            ),
          },
          { key: "category", header: "Category", cell: (t) => t.category },
          { key: "date", header: "Date", cell: (t) => formatDate(t.date) },
          {
            key: "actions",
            header: "",
            className: "w-12",
            cell: (t) => (
              <ListActionsCell
                viewHref={t.viewHref}
                editHref={t.editHref}
                entityName={t.description}
                deleteAction={t.deleteAction}
                listPath="/finance"
              />
            ),
          },
        ]}
      />
    </div>
  );
}
