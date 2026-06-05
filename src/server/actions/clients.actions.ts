"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { clientSchema, type ClientFormData } from "@/lib/validations/client";
import type { ActionResult } from "@/types";

export async function getClients(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await requirePermission(PERMISSIONS.CLIENTS_VIEW);

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(params?.status && { status: params.status as never }),
    ...(params?.search && {
      OR: [
        { companyName: { contains: params.search, mode: "insensitive" as const } },
        { contactPerson: { contains: params.search, mode: "insensitive" as const } },
        { email: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { projects: true, notes: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getClientById(id: string) {
  await requirePermission(PERMISSIONS.CLIENTS_VIEW);

  return prisma.client.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
      meetings: {
        orderBy: { date: "desc" },
        include: { assignedTo: { select: { id: true, name: true, email: true } } },
      },
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      quotations: { orderBy: { createdAt: "desc" }, take: 10 },
      revenues: { orderBy: { date: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
      leads: true,
    },
  });
}

export async function createClient(input: ClientFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.CLIENTS_CREATE);
  const user = await requireAuth();

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const client = await prisma.client.create({ data: parsed.data });

  await prisma.activity.create({
    data: {
      type: "CLIENT_CREATED",
      title: `New client: ${client.companyName}`,
      actorId: user.id.startsWith("dev") ? undefined : user.id,
      metadata: { clientId: client.id },
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, data: { id: client.id } };
}

export async function updateClient(id: string, input: ClientFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CLIENTS_UPDATE);

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.client.update({ where: { id }, data: parsed.data });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { success: true, data: undefined };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CLIENTS_DELETE);
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  return { success: true, data: undefined };
}

export async function addClientNote(clientId: string, content: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CLIENTS_UPDATE);
  const user = await requireAuth();

  if (!content.trim()) return { success: false, error: "Note cannot be empty" };

  await prisma.clientNote.create({
    data: { clientId, authorId: user.id.startsWith("dev") ? (await prisma.user.findFirst())!.id : user.id, content },
  });

  revalidatePath(`/clients/${clientId}`);
  return { success: true, data: undefined };
}
