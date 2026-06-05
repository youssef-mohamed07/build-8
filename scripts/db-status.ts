import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { isDatabaseConfigured } from "../src/lib/db";

async function main() {
  console.log("Build8 database status\n");

  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is missing or has a placeholder.");
    process.exit(1);
  }

  const masked = process.env.DATABASE_URL!.replace(/:[^:@]+@/, ":***@");
  console.log("DATABASE_URL:", masked);
  console.log("AUTH_SECRET set:", Boolean(process.env.AUTH_SECRET));

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.DATABASE_URL!.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({
      select: { email: true, status: true, role: { select: { slug: true } } },
      orderBy: { email: "asc" },
    });

    console.log(`\nUsers (${users.length}):`);
    for (const user of users) {
      console.log(`  - ${user.email} [${user.status}] (${user.role.slug})`);
    }

    if (users.filter((u) => u.status === "ACTIVE").length === 0) {
      console.error("\nNo active users. Run: npm run db:setup");
      process.exit(1);
    }

    console.log("\nOK — database is ready for login.");
  } catch (error) {
    console.error("\nConnection failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
