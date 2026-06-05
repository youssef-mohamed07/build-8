"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { personSchema, type PersonFormData } from "@/lib/validations/entities";
import type { ActionResult } from "@/types";

export async function getPeople() {
  await requirePermission(PERMISSIONS.PEOPLE_VIEW);

  return prisma.person.findMany({
    orderBy: { fullName: "asc" },
    include: {
      skills: { include: { skill: true } },
      candidate: true,
      user: { select: { email: true, role: { select: { name: true } } } },
    },
  });
}

export async function getPersonById(id: string) {
  await requirePermission(PERMISSIONS.PEOPLE_VIEW);

  return prisma.person.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      candidate: { include: { notes: { include: { author: { select: { name: true } } } } } },
      user: { select: { id: true, email: true, role: { select: { name: true } } } },
    },
  });
}

export async function getPeopleStats() {
  await requirePermission(PERMISSIONS.PEOPLE_VIEW);
  const [active, freelancer, onHold, former] = await Promise.all([
    prisma.person.count({ where: { status: "ACTIVE" } }),
    prisma.person.count({ where: { status: "FREELANCER" } }),
    prisma.person.count({ where: { status: "ON_HOLD" } }),
    prisma.person.count({ where: { status: "FORMER_MEMBER" } }),
  ]);
  return { active, freelancer, onHold, former };
}

export async function createPerson(input: PersonFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.PEOPLE_CREATE);
  const parsed = personSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const person = await prisma.person.create({ data: parsed.data });
  revalidatePath("/people");
  return { success: true, data: { id: person.id } };
}

export async function updatePerson(id: string, input: PersonFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PEOPLE_UPDATE);
  const parsed = personSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await prisma.person.update({ where: { id }, data: parsed.data });
  revalidatePath("/people");
  revalidatePath(`/people/${id}`);
  return { success: true, data: undefined };
}

export async function deletePerson(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.PEOPLE_DELETE);
  await prisma.person.delete({ where: { id } });
  revalidatePath("/people");
  return { success: true, data: undefined };
}
