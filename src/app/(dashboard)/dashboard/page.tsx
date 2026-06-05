import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FOUNDERS, COMPANY_RESERVE_PERCENT } from "@/lib/founders";
import { formatCurrency } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";
import {
  getDashboardStats,
  getMonthlyFinancialData,
  getRecentActivities,
} from "@/server/actions/dashboard.actions";

export default async function DashboardPage() {
  const currency = await getPreferredCurrency();
  const [stats, chartData, activities] = await Promise.all([
    getDashboardStats().catch(() => ({
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      totalClients: 0,
      activeProjects: 0,
      pendingTasks: 0,
      teamMembers: 0,
      candidatesCount: 0,
      founderEarnings: {
        youssef: 0,
        saif: 0,
        youssefName: "Youssef",
        saifName: "Saif",
        companyReserve: 0,
      },
    })),
    getMonthlyFinancialData().catch(() => []),
    getRecentActivities().catch(() => []),
  ]);

  const activityItems = activities.map((a) => ({
    id: a.id,
    type: mapActivityType(a.type),
    title: a.title,
    description: a.description ?? undefined,
    createdAt: a.createdAt,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your business performance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          format="currency"
          icon="dollar-sign"
          change={12}
        />
        <StatCard
          title="Net Profit"
          value={stats.netProfit}
          format="currency"
          icon="trending-up"
          change={8}
        />
        <StatCard
          title="Active Clients"
          value={stats.totalClients}
          format="number"
          icon="building-2"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          format="number"
          icon="folder-kanban"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          format="number"
          icon="check-square"
        />
        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          format="number"
          icon="users"
        />
        <StatCard
          title="Candidates"
          value={stats.candidatesCount}
          format="number"
          icon="graduation-cap"
        />
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses}
          format="currency"
          icon="wallet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            data={
              chartData.length > 0
                ? chartData
                : [
                    { month: "Jan", revenue: 0, expenses: 0, profit: 0 },
                    { month: "Feb", revenue: 0, expenses: 0, profit: 0 },
                    { month: "Mar", revenue: 0, expenses: 0, profit: 0 },
                    { month: "Apr", revenue: 0, expenses: 0, profit: 0 },
                    { month: "May", revenue: 0, expenses: 0, profit: 0 },
                    { month: "Jun", revenue: 0, expenses: 0, profit: 0 },
                  ]
            }
          />
        </div>
        <ActivityFeed activities={activityItems} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Founder Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">{FOUNDERS.youssef.name} ({FOUNDERS.youssef.equityPercent}%)</p>
              <p className="text-xl font-bold">
                {formatCurrency(stats.founderEarnings.youssef, currency)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">{FOUNDERS.saif.name} ({FOUNDERS.saif.equityPercent}%)</p>
              <p className="text-xl font-bold">
                {formatCurrency(stats.founderEarnings.saif, currency)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Company Reserve ({COMPANY_RESERVE_PERCENT}%)</p>
              <p className="text-xl font-bold">
                {formatCurrency(stats.founderEarnings.companyReserve, currency)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function mapActivityType(
  type: string
): "CLIENT_CREATED" | "PAYMENT_RECEIVED" | "PROJECT_CREATED" | "CANDIDATE_ADDED" | "TEAM_MEMBER_ADDED" {
  const map: Record<string, typeof type> = {
    CLIENT_CREATED: "CLIENT_CREATED",
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
    PROJECT_CREATED: "PROJECT_CREATED",
    CANDIDATE_ADDED: "CANDIDATE_ADDED",
    TEAM_MEMBER_ADDED: "TEAM_MEMBER_ADDED",
  };
  return (map[type] ?? "CLIENT_CREATED") as never;
}
