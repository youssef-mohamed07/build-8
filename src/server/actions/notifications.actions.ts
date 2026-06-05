"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac/check-permission";
import { resolveUserId } from "@/lib/resolve-user-id";
import type { ActionResult } from "@/types";

export async function getNotifications(limit = 20) {
  const user = await requireAuth();
  const userId = await resolveUserId(user.id);
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount() {
  const user = await requireAuth();
  const userId = await resolveUserId(user.id);
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const user = await requireAuth();
  const userId = await resolveUserId(user.id);
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await requireAuth();
  const userId = await resolveUserId(user.id);
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return { success: true, data: undefined };
}
