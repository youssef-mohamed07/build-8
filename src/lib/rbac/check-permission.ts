import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FOUNDERS } from "@/lib/founders";
import {
  devPermissions,
  getDevSessionUser,
  isAuthSkipped,
} from "@/lib/skip-auth";

const founderEmails = [...FOUNDERS.youssef.emails, ...FOUNDERS.saif.emails];
import type { Permission } from "./permissions";

async function getSkipAuthUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { email: { in: founderEmails } },
          { founderId: { not: null } },
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (user) {
      return { ...user, permissions: devPermissions };
    }
  } catch {
    // Database may be unavailable during local UI development
  }

  const dev = getDevSessionUser();
  return {
    id: dev.id,
    email: dev.email,
    name: dev.name,
    permissions: devPermissions,
  };
}

export async function getCurrentUserWithPermissions() {
  if (await isAuthSkipped()) {
    return getSkipAuthUser();
  }

  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  const permissions = user.role.permissions.map((rp) => rp.permission.slug);

  return {
    ...user,
    permissions,
  };
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  if (await isAuthSkipped()) return true;

  const user = await getCurrentUserWithPermissions();
  if (!user) return false;
  return user.permissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
  if (await isAuthSkipped()) return;

  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}

export async function requireAuth() {
  const user = await getCurrentUserWithPermissions();
  if (!user) {
    throw new Error("Unauthorized: not authenticated");
  }
  return user;
}
