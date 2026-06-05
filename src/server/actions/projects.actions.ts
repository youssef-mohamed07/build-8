"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { projectSchema, type ProjectFormData } from "@/lib/validations/entities";
import type { ActionResult } from "@/types";

export async function getProjects(params?: { status?: string }) {
  await requirePermission(PERMISSIONS.PROJECTS_VIEW);

  return prisma.project.findMany({
    where: params?.status ? { status: params.status as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, companyName: true } },
      lead: { select: { name: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });
}

export async function getProjectById(id: string) {
  await requirePermission(PERMISSIONS.PROJECTS_VIEW);

  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      lead: { select: { name: true, email: true } },
      members: { include: { user: { select: { name: true, email: true } } } },
      tasks: { orderBy: { createdAt: "desc" }, include: { assignee: { select: { name: true } } } },
      comments: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } }, take: 20 },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
      revenues: { orderBy: { date: "desc" }, take: 5 },
    },
  });
}

export async function getProjectStats() {
  await requirePermission(PERMISSIONS.PROJECTS_VIEW);
  const [planning, active, review, completed] = await Promise.all([
    prisma.project.count({ where: { status: "PLANNING" } }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "REVIEW" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
  ]);
  return { planning, active, review, completed };
}

export async function getClientsForSelect() {
  await requirePermission(PERMISSIONS.CLIENTS_VIEW);
  return prisma.client.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: "asc" } });
}

export async function createProject(input: ProjectFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.PROJECTS_CREATE);
  const user = await requireAuth();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { startDate, deadline, budget, ...rest } = parsed.data;
  const project = await prisma.project.create({
    data: {
      ...rest,
      budget,
      leadId: user.id.startsWith("dev") ? undefined : user.id,
      startDate: startDate ? new Date(startDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
    },
  });

  await prisma.activity.create({
    data: {
      type: "PROJECT_CREATED",
      title: `New project: ${project.name}`,
      actorId: user.id.startsWith("dev") ? undefined : user.id,
      metadata: { projectId: project.id },
    },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true, data: { id: project.id } };
}

export async function updateProject(id: string, input: ProjectFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PROJECTS_UPDATE);
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { startDate, deadline, budget, ...rest } = parsed.data;
  await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      budget,
      startDate: startDate ? new Date(startDate) : null,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, data: undefined };
}

export async function updateProjectStatus(id: string, status: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PROJECTS_UPDATE);
  await prisma.project.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { success: true, data: undefined };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PROJECTS_DELETE);
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  return { success: true, data: undefined };
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role?: string
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PROJECTS_UPDATE);
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: { role },
    create: { projectId, userId, role },
  });
  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: undefined };
}

export async function removeProjectMember(projectId: string, userId: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PROJECTS_UPDATE);
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: undefined };
}
