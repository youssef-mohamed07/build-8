"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { quotationSchema, type QuotationFormData } from "@/lib/validations/entities";
import { calcLineItemsTotal, formatSequentialNumber } from "@/lib/number-utils";
import type { ActionResult } from "@/types";

export async function getQuotations() {
  await requirePermission(PERMISSIONS.QUOTATIONS_VIEW);

  return prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, companyName: true } },
      project: { select: { id: true, name: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function getQuotationById(id: string) {
  await requirePermission(PERMISSIONS.QUOTATIONS_VIEW);

  return prisma.quotation.findUnique({
    where: { id },
    include: {
      client: true,
      project: true,
      items: { orderBy: { id: "asc" } },
    },
  });
}

export async function getQuotationStats() {
  await requirePermission(PERMISSIONS.QUOTATIONS_VIEW);
  const [draft, sent, accepted, rejected] = await Promise.all([
    prisma.quotation.count({ where: { status: "DRAFT" } }),
    prisma.quotation.count({ where: { status: "SENT" } }),
    prisma.quotation.count({ where: { status: "ACCEPTED" } }),
    prisma.quotation.count({ where: { status: "REJECTED" } }),
  ]);
  return { draft, sent, accepted, rejected };
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

async function generateQuotationNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quotation.count({
    where: { number: { startsWith: `QUO-${year}` } },
  });
  return formatSequentialNumber("QUO", count);
}

function buildQuotationItems(items: QuotationFormData["items"]) {
  return items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));
}

export async function createQuotation(input: QuotationFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.QUOTATIONS_CREATE);
  const parsed = quotationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { validUntil, tax, projectId, items, ...rest } = parsed.data;
  const subtotal = calcLineItemsTotal(items);
  const taxAmount = tax ?? 0;

  const quotation = await prisma.quotation.create({
    data: {
      ...rest,
      number: await generateQuotationNumber(),
      projectId: projectId || null,
      subtotal,
      tax: taxAmount,
      total: subtotal + taxAmount,
      validUntil: validUntil ? new Date(validUntil) : null,
      items: { create: buildQuotationItems(items) },
    },
  });

  revalidatePath("/quotations");
  return { success: true, data: { id: quotation.id } };
}

export async function updateQuotation(id: string, input: QuotationFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.QUOTATIONS_UPDATE);
  const parsed = quotationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { validUntil, tax, projectId, items, ...rest } = parsed.data;
  const subtotal = calcLineItemsTotal(items);
  const taxAmount = tax ?? 0;

  await prisma.$transaction([
    prisma.quotationItem.deleteMany({ where: { quotationId: id } }),
    prisma.quotation.update({
      where: { id },
      data: {
        ...rest,
        projectId: projectId || null,
        subtotal,
        tax: taxAmount,
        total: subtotal + taxAmount,
        validUntil: validUntil ? new Date(validUntil) : null,
        items: { create: buildQuotationItems(items) },
      },
    }),
  ]);

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
  return { success: true, data: undefined };
}

export async function updateQuotationStatus(id: string, status: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.QUOTATIONS_UPDATE);
  await prisma.quotation.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
  return { success: true, data: undefined };
}

export async function deleteQuotation(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.QUOTATIONS_DELETE);
  await prisma.quotation.delete({ where: { id } });
  revalidatePath("/quotations");
  return { success: true, data: undefined };
}
