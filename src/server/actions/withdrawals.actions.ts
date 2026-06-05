"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { resolveUserId } from "@/lib/resolve-user-id";
import { getFounderDisplayName } from "@/lib/founders";
import type { ActionResult } from "@/types";

export async function getWithdrawals() {
  await requirePermission(PERMISSIONS.EQUITY_VIEW);
  const rows = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      founder: { select: { name: true, email: true } },
      requester: { select: { name: true } },
      approver: { select: { name: true } },
    },
  });
  return rows.map((r) => ({
    ...r,
    founder: {
      name: getFounderDisplayName(r.founder.email, r.founder.name),
    },
  }));
}

export async function createWithdrawal(data: {
  founderId: string;
  amount: number;
  notes?: string;
}): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.WITHDRAWAL_REQUEST);
  const user = await requireAuth();
  const requesterId = await resolveUserId(user.id);
  await prisma.withdrawalRequest.create({
    data: {
      founderId: data.founderId,
      requesterId,
      amount: data.amount,
      notes: data.notes,
    },
  });
  revalidatePath("/finance");
  return { success: true, data: undefined };
}

export async function updateWithdrawalStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.WITHDRAWAL_APPROVE);
  const user = await requireAuth();
  const approverId = await resolveUserId(user.id);
  await prisma.withdrawalRequest.update({
    where: { id },
    data: { status, approverId },
  });
  revalidatePath("/finance");
  return { success: true, data: undefined };
}

export async function getFoundersForSelect() {
  await requirePermission(PERMISSIONS.EQUITY_VIEW);
  const founders = await prisma.founder.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return founders.map((f) => ({ id: f.id, name: getFounderDisplayName(f.email, f.name) }));
}
