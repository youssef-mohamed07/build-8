"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { toCsv } from "@/lib/export-csv";
import { FOUNDERS, COMPANY_RESERVE_PERCENT } from "@/lib/founders";

export async function generateReport(type: string): Promise<string> {
  await requirePermission(PERMISSIONS.REPORTS_EXPORT);

  switch (type) {
    case "revenue": {
      const rows = await prisma.revenue.findMany({
        include: { client: true, project: true },
        orderBy: { date: "desc" },
      });
      return toCsv(
        rows.map((r) => ({
          date: r.date.toISOString().slice(0, 10),
          client: r.client.companyName,
          project: r.project?.name ?? "",
          amount: Number(r.amount),
          method: r.paymentMethod,
          description: r.description ?? "",
        }))
      );
    }
    case "expenses": {
      const rows = await prisma.expense.findMany({ orderBy: { date: "desc" } });
      return toCsv(
        rows.map((e) => ({
          date: e.date.toISOString().slice(0, 10),
          category: e.category,
          amount: Number(e.amount),
          description: e.description ?? "",
        }))
      );
    }
    case "clients": {
      const rows = await prisma.client.findMany({ orderBy: { companyName: "asc" } });
      return toCsv(
        rows.map((c) => ({
          company: c.companyName,
          contact: c.contactPerson ?? "",
          email: c.email ?? "",
          status: c.status,
        }))
      );
    }
    case "projects": {
      const rows = await prisma.project.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
      });
      return toCsv(
        rows.map((p) => ({
          name: p.name,
          client: p.client.companyName,
          status: p.status,
          budget: p.budget ? Number(p.budget) : "",
          deadline: p.deadline?.toISOString().slice(0, 10) ?? "",
        }))
      );
    }
    case "founders": {
      const stats = await prisma.revenue.aggregate({ _sum: { amount: true } });
      const expenses = await prisma.expense.aggregate({ _sum: { amount: true } });
      const net = Number(stats._sum.amount ?? 0) - Number(expenses._sum.amount ?? 0);
      return toCsv([
        { founder: FOUNDERS.youssef.name, percent: FOUNDERS.youssef.equityPercent, amount: net * 0.3 },
        { founder: FOUNDERS.saif.name, percent: FOUNDERS.saif.equityPercent, amount: net * 0.3 },
        { founder: "Company Reserve", percent: COMPANY_RESERVE_PERCENT, amount: net * 0.4 },
      ]);
    }
    default: {
      const rows = await prisma.invoice.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
      });
      return toCsv(
        rows.map((i) => ({
          number: i.number,
          client: i.client.companyName,
          total: Number(i.total),
          status: i.status,
          due: i.dueDate?.toISOString().slice(0, 10) ?? "",
        }))
      );
    }
  }
}
