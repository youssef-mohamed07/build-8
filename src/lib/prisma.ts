import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function normalizeDatabaseUrl(url: string): string {
  if (
    url.includes("pooler.supabase.com:6543") &&
    !url.includes("pgbouncer=true")
  ) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}pgbouncer=true`;
  }
  return url;
}

function createPrismaClient() {
  const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL!);
  const adapter = new PrismaPg({
    connectionString,
    ...(connectionString.includes("supabase")
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ??
  (isDatabaseConfigured() ? createPrismaClient() : (null as unknown as PrismaClient));

if (process.env.NODE_ENV !== "production" && isDatabaseConfigured()) {
  globalForPrisma.prisma = prisma;
}
