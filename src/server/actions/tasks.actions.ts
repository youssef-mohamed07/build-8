"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { taskSchema, type TaskFormData } from "@/lib/validations/entities";
import type { ActionResult } from "@/types";

export async function getTasks(params?: { search?: string; status?: string }) {
  await requirePermission(PERMISSIONS.TASKS_VIEW);

  return prisma.task.findMany({
    where: {
      ...(params?.status && { status: params.status as never }),
      ...(params?.search && {
        OR: [
          { title: { contains: params.search, mode: "insensitive" } },
          { description: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: {
      assignee: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      creator: { select: { name: true } },
      _count: { select: { subtasks: true, comments: true } },
    },
  });
}

export async function getTaskById(id: string) {
  await requirePermission(PERMISSIONS.TASKS_VIEW);

  return prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { name: true } },
      project: { select: { id: true, name: true, client: { select: { companyName: true } } } },
      subtasks: { orderBy: { position: "asc" } },
      comments: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
    },
  });
}

export async function getTaskStats() {
  await requirePermission(PERMISSIONS.TASKS_VIEW);
  const [todo, inProgress, review, done] = await Promise.all([
    prisma.task.count({ where: { status: "TODO" } }),
    prisma.task.count({ where: { status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { status: "REVIEW" } }),
    prisma.task.count({ where: { status: "DONE" } }),
  ]);
  return { todo, inProgress, review, done };
}

export async function getProjectsForSelect() {
  await requirePermission(PERMISSIONS.PROJECTS_VIEW);
  return prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function createTask(input: TaskFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.TASKS_CREATE);
  const user = await requireAuth();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { dueDate, projectId, assigneeId, ...rest } = parsed.data;
  const creatorId = user.id.startsWith("dev") ? (await prisma.user.findFirst())!.id : user.id;
  const task = await prisma.task.create({
    data: {
      ...rest,
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      creatorId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  revalidatePath("/tasks");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  return { success: true, data: { id: task.id } };
}

export async function updateTask(id: string, input: TaskFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TASKS_UPDATE);
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { dueDate, projectId, assigneeId, ...rest } = parsed.data;
  await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  return { success: true, data: undefined };
}

export async function updateTaskStatus(id: string, status: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TASKS_UPDATE);
  await prisma.task.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  return { success: true, data: undefined };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TASKS_DELETE);
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  return { success: true, data: undefined };
}

export async function toggleSubtask(subtaskId: string, completed: boolean): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TASKS_UPDATE);
  await prisma.subtask.update({ where: { id: subtaskId }, data: { completed } });
  revalidatePath("/tasks");
  return { success: true, data: undefined };
}

export async function addSubtask(taskId: string, title: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TASKS_UPDATE);
  const count = await prisma.subtask.count({ where: { taskId } });
  await prisma.subtask.create({ data: { taskId, title, position: count } });
  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data: undefined };
}

export async function deleteSubtask(subtaskId: string, taskId: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.TASKS_UPDATE);
  await prisma.subtask.delete({ where: { id: subtaskId } });
  revalidatePath(`/tasks/${taskId}`);
  return { success: true, data: undefined };
}
