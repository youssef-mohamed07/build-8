"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { resolveUserId } from "@/lib/resolve-user-id";
import type { ActionResult } from "@/types";

export async function addTaskComment(taskId: string, content: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TASKS_UPDATE);
  const user = await requireAuth();
  const authorId = await resolveUserId(user.id);
  await prisma.comment.create({ data: { content, authorId, taskId } });
  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data: undefined };
}

export async function addProjectComment(projectId: string, content: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PROJECTS_UPDATE);
  const user = await requireAuth();
  const authorId = await resolveUserId(user.id);
  await prisma.comment.create({ data: { content, authorId, projectId } });
  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: undefined };
}
