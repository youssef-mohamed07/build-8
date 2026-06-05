import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const url = process.env.DATABASE_URL!;
  console.log("URL:", url.replace(/:[^:@]+@/, ":***@"));

  const adapter = new PrismaPg({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const [clients, leads, projects, tasks] = await Promise.all([
      prisma.client.count(),
      prisma.lead.count(),
      prisma.project.count(),
      prisma.task.count(),
    ]);
    console.log("OK — clients:", clients, "leads:", leads, "projects:", projects, "tasks:", tasks);
  } catch (e: unknown) {
    console.error("FAILED:", (e as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
