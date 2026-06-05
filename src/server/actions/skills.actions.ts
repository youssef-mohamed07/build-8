"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import type { ActionResult } from "@/types";

export async function getSkills() {
  await requirePermission(PERMISSIONS.PEOPLE_VIEW);
  return prisma.skill.findMany({ orderBy: { name: "asc" } });
}

export async function addPersonSkill(
  personId: string,
  skillId: string,
  level: number
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PEOPLE_UPDATE);
  await prisma.personSkill.upsert({
    where: { personId_skillId: { personId, skillId } },
    update: { level },
    create: { personId, skillId, level },
  });
  revalidatePath(`/people/${personId}`);
  return { success: true, data: undefined };
}

export async function removePersonSkill(personId: string, skillId: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PEOPLE_UPDATE);
  await prisma.personSkill.delete({
    where: { personId_skillId: { personId, skillId } },
  });
  revalidatePath(`/people/${personId}`);
  return { success: true, data: undefined };
}

export async function createSkill(name: string): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.PEOPLE_UPDATE);
  const existing = await prisma.skill.findUnique({ where: { name } });
  if (existing) return { success: true, data: { id: existing.id } };
  const skill = await prisma.skill.create({ data: { name } });
  return { success: true, data: { id: skill.id } };
}
