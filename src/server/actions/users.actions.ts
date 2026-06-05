"use server";

import { prisma } from "@/lib/prisma";
import { FOUNDERS } from "@/lib/founders";
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";

const founderEmails = [...FOUNDERS.youssef.emails, ...FOUNDERS.saif.emails];

/** Only Youssef & Saif — the two founders. */
export async function getUsersForSelect() {
  await requirePermission(PERMISSIONS.PEOPLE_VIEW);
  return prisma.user.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { founderId: { not: null } },
        { email: { in: founderEmails } },
      ],
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}
