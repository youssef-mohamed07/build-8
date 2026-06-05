"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { documentSchema, type DocumentFormData } from "@/lib/validations/entities";
import type { ActionResult } from "@/types";

export async function getDocuments() {
  await requirePermission(PERMISSIONS.DOCUMENTS_VIEW);

  return prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, companyName: true } },
      project: { select: { id: true, name: true } },
      uploader: { select: { name: true } },
    },
  });
}

export async function getDocumentById(id: string) {
  await requirePermission(PERMISSIONS.DOCUMENTS_VIEW);

  return prisma.document.findUnique({
    where: { id },
    include: {
      client: true,
      project: { include: { client: { select: { companyName: true } } } },
      uploader: { select: { name: true, email: true } },
    },
  });
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

async function resolveUploaderId(userId: string) {
  if (!userId.startsWith("dev")) return userId;
  const user = await prisma.user.findFirst({ select: { id: true } });
  return user?.id ?? userId;
}

function parseTags(tags?: string) {
  if (!tags?.trim()) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createDocument(input: DocumentFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD);
  const user = await requireAuth();
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { tags, clientId, projectId, folderPath, ...rest } = parsed.data;
  const doc = await prisma.document.create({
    data: {
      ...rest,
      folderPath: folderPath || "/",
      tags: parseTags(tags),
      clientId: clientId || null,
      projectId: projectId || null,
      uploaderId: await resolveUploaderId(user.id),
    },
  });

  revalidatePath("/documents");
  return { success: true, data: { id: doc.id } };
}

export async function updateDocument(id: string, input: DocumentFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD);
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { tags, clientId, projectId, folderPath, ...rest } = parsed.data;
  await prisma.document.update({
    where: { id },
    data: {
      ...rest,
      folderPath: folderPath || "/",
      tags: parseTags(tags),
      clientId: clientId || null,
      projectId: projectId || null,
    },
  });

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  return { success: true, data: undefined };
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.DOCUMENTS_DELETE);
  await prisma.document.delete({ where: { id } });
  revalidatePath("/documents");
  return { success: true, data: undefined };
}
