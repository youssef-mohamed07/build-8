import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dbConfigured = isDatabaseConfigured();
  const authSecretSet = Boolean(process.env.AUTH_SECRET);

  if (!dbConfigured) {
    return NextResponse.json({
      ok: false,
      dbConfigured: false,
      authSecretSet,
      userCount: 0,
      founders: [],
      hint: "DATABASE_URL is missing or still has a placeholder on Vercel.",
    });
  }

  try {
    const [userCount, founders] = await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { email: true, role: { select: { slug: true } } },
        orderBy: { email: "asc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      ok: userCount > 0 && authSecretSet,
      dbConfigured: true,
      authSecretSet,
      userCount,
      founders: founders.map((u) => ({ email: u.email, role: u.role.slug })),
      hint:
        userCount === 0
          ? "Database is empty. Run npm run db:setup with the same DATABASE_URL as Vercel."
          : !authSecretSet
            ? "Set AUTH_SECRET on Vercel."
            : "OK",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      dbConfigured: true,
      authSecretSet,
      userCount: 0,
      founders: [],
      hint: `Database connection failed: ${error instanceof Error ? error.message : "unknown error"}`,
    });
  }
}
