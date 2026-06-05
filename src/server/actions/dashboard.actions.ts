"use server";

import { prisma } from "@/lib/prisma";
import { FOUNDERS, COMPANY_RESERVE_PERCENT } from "@/lib/founders";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    revenues,
    expenses,
    totalClients,
    activeProjects,
    pendingTasks,
    teamMembers,
    candidatesCount,
    founders,
  ] = await Promise.all([
    prisma.revenue.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.task.count({
      where: { status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] } },
    }),
    prisma.person.count({ where: { status: "ACTIVE" } }),
    prisma.candidate.count(),
    prisma.founder.findMany(),
  ]);

  const totalRevenue = Number(revenues._sum.amount ?? 0);
  const totalExpenses = Number(expenses._sum.amount ?? 0);
  const netProfit = totalRevenue - totalExpenses;

  const youssefFounder = founders.find((f) =>
    FOUNDERS.youssef.emails.includes(f.email as (typeof FOUNDERS.youssef.emails)[number])
  ) ?? founders[0];
  const saifFounder = founders.find((f) =>
    FOUNDERS.saif.emails.includes(f.email as (typeof FOUNDERS.saif.emails)[number])
  ) ?? founders[1];

  const youssefPercent = (youssefFounder?.equityPercent.toNumber() ?? FOUNDERS.youssef.equityPercent) / 100;
  const saifPercent = (saifFounder?.equityPercent.toNumber() ?? FOUNDERS.saif.equityPercent) / 100;
  const reservePercent = COMPANY_RESERVE_PERCENT / 100;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    totalClients,
    activeProjects,
    pendingTasks,
    teamMembers,
    candidatesCount,
    founderEarnings: {
      youssef: netProfit * youssefPercent,
      saif: netProfit * saifPercent,
      youssefName: FOUNDERS.youssef.name,
      saifName: FOUNDERS.saif.name,
      companyReserve: netProfit * reservePercent,
    },
  };
}

export async function getMonthlyFinancialData() {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW);

  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [revenue, expense] = await Promise.all([
      prisma.revenue.aggregate({
        where: { date: { gte: date, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: date, lte: endDate } },
        _sum: { amount: true },
      }),
    ]);

    const rev = Number(revenue._sum.amount ?? 0);
    const exp = Number(expense._sum.amount ?? 0);

    months.push({
      month: date.toLocaleString("en-US", { month: "short" }),
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
    });
  }

  return months;
}

export async function getRecentActivities() {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW);

  return prisma.activity.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { name: true, image: true } } },
  });
}
