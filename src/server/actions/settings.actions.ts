"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { FOUNDERS, COMPANY_RESERVE_PERCENT } from "@/lib/founders";
import type { ActionResult } from "@/types";

export async function getCompanySettings() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);
  const setting = await prisma.setting.findUnique({ where: { key: "company" } });
  const defaults = {
    name: "Build8",
    email: "hello@build8.com",
    phone: "",
    address: "",
    taxId: "",
  };
  return { ...(defaults as Record<string, string>), ...((setting?.value as object) ?? {}) };
}

export async function updateCompanySettings(data: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  await prisma.setting.upsert({
    where: { key: "company" },
    update: { value: data },
    create: { key: "company", value: data },
  });
  revalidatePath("/settings");
  return { success: true, data: undefined };
}

export async function getEquitySettings() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);
  const setting = await prisma.setting.findUnique({ where: { key: "equity" } });
  return {
    youssef: FOUNDERS.youssef.equityPercent,
    saif: FOUNDERS.saif.equityPercent,
    companyReserve: COMPANY_RESERVE_PERCENT,
    ...((setting?.value as object) ?? {}),
  };
}

export async function getNotificationPrefs(userId: string) {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);
  const setting = await prisma.setting.findUnique({ where: { key: `notifications:${userId}` } });
  const defaults = {
    newClient: true,
    newPayment: true,
    projectDeadline: true,
    invoiceOverdue: true,
    newCandidate: true,
  };
  return { ...defaults, ...((setting?.value as object) ?? {}) };
}

export async function updateNotificationPrefs(
  userId: string,
  prefs: Record<string, boolean>
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  await prisma.setting.upsert({
    where: { key: `notifications:${userId}` },
    update: { value: prefs },
    create: { key: `notifications:${userId}`, value: prefs },
  });
  revalidatePath("/settings");
  return { success: true, data: undefined };
}
