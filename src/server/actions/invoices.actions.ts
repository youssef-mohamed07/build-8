"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations/entities";
import { calcLineItemsTotal, formatSequentialNumber } from "@/lib/number-utils";
import type { ActionResult } from "@/types";

export async function getInvoices() {
  await requirePermission(PERMISSIONS.INVOICES_VIEW);

  return prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, companyName: true } },
      project: { select: { id: true, name: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function getInvoiceById(id: string) {
  await requirePermission(PERMISSIONS.INVOICES_VIEW);

  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      project: true,
      items: { orderBy: { id: "asc" } },
    },
  });
}

export async function getInvoiceStats() {
  await requirePermission(PERMISSIONS.INVOICES_VIEW);
  const [draft, sent, paid, overdue] = await Promise.all([
    prisma.invoice.count({ where: { status: "DRAFT" } }),
    prisma.invoice.count({ where: { status: "SENT" } }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
  ]);
  return { draft, sent, paid, overdue };
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

async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { number: { startsWith: `INV-${year}` } },
  });
  return formatSequentialNumber("INV", count);
}

function buildInvoiceItems(items: InvoiceFormData["items"]) {
  return items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));
}

export async function createInvoice(input: InvoiceFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.INVOICES_CREATE);
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { dueDate, tax, projectId, items, ...rest } = parsed.data;
  const subtotal = calcLineItemsTotal(items);
  const taxAmount = tax ?? 0;

  const invoice = await prisma.invoice.create({
    data: {
      ...rest,
      number: await generateInvoiceNumber(),
      projectId: projectId || null,
      subtotal,
      tax: taxAmount,
      total: subtotal + taxAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
      items: { create: buildInvoiceItems(items) },
    },
  });

  revalidatePath("/invoices");
  return { success: true, data: { id: invoice.id } };
}

export async function updateInvoice(id: string, input: InvoiceFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.INVOICES_UPDATE);
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { dueDate, tax, projectId, items, ...rest } = parsed.data;
  const subtotal = calcLineItemsTotal(items);
  const taxAmount = tax ?? 0;

  const paidAt = rest.status === "PAID" ? new Date() : null;

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        ...rest,
        projectId: projectId || null,
        subtotal,
        tax: taxAmount,
        total: subtotal + taxAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        paidAt,
        items: { create: buildInvoiceItems(items) },
      },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true, data: undefined };
}

export async function updateInvoiceStatus(id: string, status: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.INVOICES_UPDATE);

  const data: { status: never; paidAt?: Date | null } = { status: status as never };
  if (status === "PAID") data.paidAt = new Date();
  if (status !== "PAID") data.paidAt = null;

  await prisma.invoice.update({ where: { id }, data });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true, data: undefined };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.INVOICES_DELETE);
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  return { success: true, data: undefined };
}

export async function createInvoiceFromQuotation(
  quotationId: string
): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.INVOICES_CREATE);
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { items: true },
  });
  if (!quotation) return { success: false, error: "Quotation not found" };

  const number = await generateInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId: quotation.clientId,
      projectId: quotation.projectId,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      total: quotation.total,
      status: "DRAFT",
      notes: quotation.notes,
      items: {
        create: quotation.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
  });

  await prisma.quotation.update({
    where: { id: quotationId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/invoices");
  revalidatePath(`/quotations/${quotationId}`);
  return { success: true, data: { id: invoice.id } };
}
