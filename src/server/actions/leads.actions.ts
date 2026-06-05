"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { leadSchema, type LeadFormData } from "@/lib/validations/entities";
import type { ActionResult } from "@/types";

export async function getLeads(params?: { stage?: string; search?: string }) {
  await requirePermission(PERMISSIONS.LEADS_VIEW);

  return prisma.lead.findMany({
    where: {
      ...(params?.stage && { stage: params.stage as never }),
      ...(params?.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { company: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });
}

export async function getLeadById(id: string) {
  await requirePermission(PERMISSIONS.LEADS_VIEW);
  return prisma.lead.findUnique({ where: { id }, include: { client: true } });
}

export async function getLeadStats() {
  await requirePermission(PERMISSIONS.LEADS_VIEW);
  const stages = ["NEW", "CONTACTED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"] as const;
  const counts = await Promise.all(stages.map((stage) => prisma.lead.count({ where: { stage } })));
  return Object.fromEntries(stages.map((stage, i) => [stage, counts[i]])) as Record<(typeof stages)[number], number>;
}

export async function createLead(input: LeadFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.LEADS_CREATE);
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const lead = await prisma.lead.create({ data: parsed.data });
  revalidatePath("/leads");
  return { success: true, data: { id: lead.id } };
}

export async function updateLead(id: string, input: LeadFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LEADS_UPDATE);
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.lead.update({ where: { id }, data: parsed.data });
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { success: true, data: undefined };
}

export async function updateLeadStage(id: string, stage: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LEADS_UPDATE);
  await prisma.lead.update({ where: { id }, data: { stage: stage as never } });
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { success: true, data: undefined };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.LEADS_DELETE);
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  return { success: true, data: undefined };
}

export async function convertLeadToClient(leadId: string): Promise<ActionResult<{ clientId: string }>> {
  await requirePermission(PERMISSIONS.LEADS_UPDATE);
  await requirePermission(PERMISSIONS.CLIENTS_CREATE);

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { success: false, error: "Lead not found" };
  if (lead.clientId) return { success: false, error: "Lead already converted" };

  const client = await prisma.client.create({
    data: {
      companyName: lead.company || lead.name,
      contactPerson: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: "PROSPECT",
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: { clientId: client.id, stage: "WON" },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/clients");
  revalidatePath(`/clients/${client.id}`);
  return { success: true, data: { clientId: client.id } };
}
