import { prisma } from "@/lib/prisma";

export async function resolveUserId(userId: string): Promise<string> {
  if (!userId.startsWith("dev")) return userId;
  const user = await prisma.user.findFirst({ select: { id: true } });
  if (!user) throw new Error("No user found in database");
  return user.id;
}
