"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import type { MeetingTypeCode } from "@/lib/meetings";
import type { ActionResult } from "@/types";

const meetingInclude = {
  client: { select: { id: true, companyName: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
} as const;

export async function getMeetings(params?: { assignedToId?: string }) {
  await requirePermission(PERMISSIONS.CLIENTS_VIEW);
  return prisma.meeting.findMany({
    where: params?.assignedToId ? { assignedToId: params.assignedToId } : undefined,
    orderBy: { date: "asc" },
    include: meetingInclude,
  });
}

export async function createMeeting(data: {
  clientId: string;
  title: string;
  description?: string;
  date: string;
  type: MeetingTypeCode;
  location?: string;
  onlinePlatform?: string;
  meetingLink?: string;
  attendees?: string;
  assignedToId?: string;
}): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.CLIENTS_UPDATE);

  if (data.type === "ONLINE" && !data.onlinePlatform?.trim()) {
    return { success: false, error: "Select an online platform" };
  }
  if (data.type === "ON_SITE" && !data.location?.trim()) {
    return { success: false, error: "Enter a location for on-site meetings" };
  }

  const meeting = await prisma.meeting.create({
    data: {
      clientId: data.clientId,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      type: data.type,
      location: data.type === "ON_SITE" ? data.location : null,
      onlinePlatform: data.type === "ONLINE" ? data.onlinePlatform : null,
      meetingLink: data.type === "ONLINE" ? data.meetingLink || null : null,
      attendees: data.attendees,
      assignedToId: data.assignedToId || null,
    },
  });
  revalidatePath(`/clients/${data.clientId}`);
  revalidatePath("/meetings");
  return { success: true, data: { id: meeting.id } };
}

export async function assignMeeting(
  id: string,
  clientId: string,
  assignedToId: string | null
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CLIENTS_UPDATE);
  await prisma.meeting.update({
    where: { id },
    data: { assignedToId: assignedToId || null },
  });
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/meetings");
  return { success: true, data: undefined };
}

export async function deleteMeeting(id: string, clientId: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CLIENTS_UPDATE);
  await prisma.meeting.delete({ where: { id } });
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/meetings");
  return { success: true, data: undefined };
}
