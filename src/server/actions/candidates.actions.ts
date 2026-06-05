"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac/check-permission";
import { resolveUserId } from "@/lib/resolve-user-id";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { candidateSchema, type CandidateFormData } from "@/lib/validations/entities";
import type { ActionResult } from "@/types";

export async function getCandidates() {
  await requirePermission(PERMISSIONS.CANDIDATES_VIEW);

  return prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: { person: true, notes: { take: 1, orderBy: { createdAt: "desc" } } },
  });
}

export async function getCandidateById(id: string) {
  await requirePermission(PERMISSIONS.CANDIDATES_VIEW);

  return prisma.candidate.findUnique({
    where: { id },
    include: {
      person: { include: { skills: { include: { skill: true } } } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
    },
  });
}

export async function getCandidateStats() {
  await requirePermission(PERMISSIONS.CANDIDATES_VIEW);
  const [newCount, interview, technicalTest, accepted] = await Promise.all([
    prisma.candidate.count({ where: { stage: "NEW" } }),
    prisma.candidate.count({ where: { stage: "INTERVIEW" } }),
    prisma.candidate.count({ where: { stage: "TECHNICAL_TEST" } }),
    prisma.candidate.count({ where: { stage: "ACCEPTED" } }),
  ]);
  return { newCount, interview, technicalTest, accepted };
}

export async function createCandidate(input: CandidateFormData): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.CANDIDATES_CREATE);
  const parsed = candidateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { fullName, email, phone, position, yearsExperience, experienceLevel, cvUrl, stage, interviewNotes, testResults } = parsed.data;

  const candidate = await prisma.$transaction(async (tx) => {
    const person = await tx.person.create({
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        position: position || null,
        yearsExperience: yearsExperience ?? null,
        status: "CANDIDATE",
      },
    });
    return tx.candidate.create({
      data: {
        personId: person.id,
        experienceLevel: experienceLevel || null,
        cvUrl: cvUrl || null,
        stage,
        interviewNotes: interviewNotes || null,
        testResults: testResults || null,
      },
    });
  });

  revalidatePath("/talent-pool");
  return { success: true, data: { id: candidate.id } };
}

export async function updateCandidateFull(id: string, input: CandidateFormData): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CANDIDATES_UPDATE);
  const parsed = candidateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (!candidate) return { success: false, error: "Candidate not found" };

  const { fullName, email, phone, position, yearsExperience, experienceLevel, cvUrl, stage, interviewNotes, testResults } = parsed.data;

  await prisma.$transaction([
    prisma.person.update({
      where: { id: candidate.personId },
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        position: position || null,
        yearsExperience: yearsExperience ?? null,
      },
    }),
    prisma.candidate.update({
      where: { id },
      data: {
        experienceLevel: experienceLevel || null,
        cvUrl: cvUrl || null,
        stage,
        interviewNotes: interviewNotes || null,
        testResults: testResults || null,
      },
    }),
  ]);

  revalidatePath("/talent-pool");
  revalidatePath(`/talent-pool/${id}`);
  return { success: true, data: undefined };
}

export async function updateCandidateStage(id: string, stage: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CANDIDATES_UPDATE);
  await prisma.candidate.update({ where: { id }, data: { stage: stage as never } });
  revalidatePath("/talent-pool");
  revalidatePath(`/talent-pool/${id}`);
  return { success: true, data: undefined };
}

export async function updateCandidate(
  id: string,
  data: { interviewNotes?: string; testResults?: string; experienceLevel?: string }
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CANDIDATES_UPDATE);
  await prisma.candidate.update({ where: { id }, data });
  revalidatePath(`/talent-pool/${id}`);
  return { success: true, data: undefined };
}

export async function deleteCandidate(id: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CANDIDATES_DELETE);
  const candidate = await prisma.candidate.findUnique({ where: { id } });
  if (candidate) await prisma.person.delete({ where: { id: candidate.personId } });
  revalidatePath("/talent-pool");
  return { success: true, data: undefined };
}

export async function addCandidateNote(candidateId: string, content: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CANDIDATES_UPDATE);
  const user = await requireAuth();
  const authorId = await resolveUserId(user.id);
  await prisma.candidateNote.create({ data: { candidateId, authorId, content } });
  revalidatePath(`/talent-pool/${candidateId}`);
  return { success: true, data: undefined };
}

export async function hireCandidate(candidateId: string): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CANDIDATES_UPDATE);
  await requirePermission(PERMISSIONS.PEOPLE_UPDATE);
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) return { success: false, error: "Candidate not found" };

  await prisma.$transaction([
    prisma.person.update({
      where: { id: candidate.personId },
      data: { status: "ACTIVE", joiningDate: new Date() },
    }),
    prisma.candidate.update({
      where: { id: candidateId },
      data: { stage: "HIRED" },
    }),
  ]);

  revalidatePath("/talent-pool");
  revalidatePath(`/talent-pool/${candidateId}`);
  revalidatePath("/people");
  revalidatePath(`/people/${candidate.personId}`);
  return { success: true, data: undefined };
}
