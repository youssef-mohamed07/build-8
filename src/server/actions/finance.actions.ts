"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { revenueSchema, expenseSchema, type RevenueFormData, type ExpenseFormData } from "@/lib/validations/entities";
import { calculateProfitDistribution } from "@/server/services/equity.service";
import type { ActionResult } from "@/types";

export async function getRevenues() {
  await requirePermission(PERMISSIONS.FINANCE_VIEW);
  return prisma.revenue.findMany({
    orderBy: { date: "desc" },
    include: { client: true, project: true },
  });
}

export async function getExpenses() {
  await requirePermission(PERMISSIONS.FINANCE_VIEW);
  return prisma.expense.findMany({ orderBy: { date: "desc" } });
}

export async function getRevenueById(id: string) {
  await requirePermission(PERMISSIONS.FINANCE_VIEW);
  return prisma.revenue.findUnique({
    where: { id },
    include: { client: true, project: true },
  });
}

export async function getExpenseById(id: string) {
  await requirePermission(PERMISSIONS.FINANCE_VIEW);
  return prisma.expense.findUnique({ where: { id } });
}

export async function getClientsForSelect() {
  await requirePermission(PERMISSIONS.CLIENTS_VIEW);
  return prisma.client.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: "asc" } });
}

export async function getProjectsForSelect() {
  await requirePermission(PERMISSIONS.PROJECTS_VIEW);
  return prisma.project.findMany({
    select: { id: true, name: true, clientId: true },
    orderBy: { name: "asc" },
  });
}

export async function createRevenue(input: RevenueFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.FINANCE_CREATE);
  const parsed = revenueSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { date, projectId, ...rest } = parsed.data;
  const revenue = await prisma.revenue.create({
    data: {
      ...rest,
      projectId: projectId || null,
      date: new Date(date),
      paymentMethod: rest.paymentMethod as never,
    },
  });

  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { success: true, data: { id: revenue.id } };
}

export async function updateRevenue(id: string, input: RevenueFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.FINANCE_UPDATE);
  const parsed = revenueSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { date, projectId, ...rest } = parsed.data;
  await prisma.revenue.update({
    where: { id },
    data: {
      ...rest,
      projectId: projectId || null,
      date: new Date(date),
      paymentMethod: rest.paymentMethod as never,
    },
  });

  revalidatePath("/finance");
  revalidatePath(`/finance/revenue/${id}`);
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function deleteRevenue(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.FINANCE_DELETE);
  await prisma.revenue.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function createExpense(input: ExpenseFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.FINANCE_CREATE);
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { date, ...rest } = parsed.data;
  const expense = await prisma.expense.create({
    data: {
      category: rest.category as never,
      amount: rest.amount,
      description: rest.description,
      date: new Date(date),
    },
  });

  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { success: true, data: { id: expense.id } };
}

export async function updateExpense(id: string, input: ExpenseFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.FINANCE_UPDATE);
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { date, ...rest } = parsed.data;
  await prisma.expense.update({
    where: { id },
    data: {
      category: rest.category as never,
      amount: rest.amount,
      description: rest.description,
      date: new Date(date),
    },
  });

  revalidatePath("/finance");
  revalidatePath(`/finance/expense/${id}`);
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.FINANCE_DELETE);
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function getFinanceStats() {
  await requirePermission(PERMISSIONS.FINANCE_VIEW);

  const [revenues, expenses] = await Promise.all([
    prisma.revenue.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);

  const totalRevenue = Number(revenues._sum.amount ?? 0);
  const totalExpenses = Number(expenses._sum.amount ?? 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    cashFlow: totalRevenue - totalExpenses,
  };
}

export async function getProfitDistribution(periodStart: Date, periodEnd: Date) {
  await requirePermission(PERMISSIONS.EQUITY_VIEW);
  return calculateProfitDistribution(periodStart, periodEnd);
}
