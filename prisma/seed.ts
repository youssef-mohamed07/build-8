import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
} from "../src/lib/rbac/permissions";
import { FOUNDERS, DEV_PASSWORD, COMPANY_RESERVE_PERCENT } from "../src/lib/founders";
import { seedDemoData } from "./seed-demo";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Build8 database...");

  // Create permissions
  const permissionEntries = Object.entries(PERMISSIONS).map(([key, slug]) => {
    const [module, action] = slug.split(":");
    return {
      name: key.replace(/_/g, " ").toLowerCase(),
      slug,
      module,
      action,
      description: `Permission to ${action} ${module}`,
    };
  });

  for (const perm of permissionEntries) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {},
      create: perm,
    });
  }

  // Create roles with permissions
  const roleDefinitions = [
    { name: "Founder", slug: ROLES.FOUNDER, description: "Full system access" },
    { name: "Admin", slug: ROLES.ADMIN, description: "Administrative access" },
    { name: "Project Manager", slug: ROLES.PROJECT_MANAGER, description: "Project and client management" },
    { name: "Developer", slug: ROLES.DEVELOPER, description: "Development tasks access" },
    { name: "Designer", slug: ROLES.DESIGNER, description: "Design tasks access" },
    { name: "Finance", slug: ROLES.FINANCE, description: "Financial management access" },
  ];

  for (const roleDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      update: {},
      create: {
        name: roleDef.name,
        slug: roleDef.slug,
        description: roleDef.description,
        isSystem: true,
      },
    });

    const slugs = ROLE_PERMISSIONS[roleDef.slug as keyof typeof ROLE_PERMISSIONS];
    const permissions = await prisma.permission.findMany({
      where: { slug: { in: slugs } },
    });

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Create founders — Youssef & Saif
  const youssefFounder = await prisma.founder.upsert({
    where: { email: FOUNDERS.youssef.primaryEmail },
    update: { name: FOUNDERS.youssef.name, equityPercent: FOUNDERS.youssef.equityPercent },
    create: {
      name: FOUNDERS.youssef.name,
      email: FOUNDERS.youssef.primaryEmail,
      equityPercent: FOUNDERS.youssef.equityPercent,
    },
  });

  const saifFounder = await prisma.founder.upsert({
    where: { email: FOUNDERS.saif.primaryEmail },
    update: { name: FOUNDERS.saif.name, equityPercent: FOUNDERS.saif.equityPercent },
    create: {
      name: FOUNDERS.saif.name,
      email: FOUNDERS.saif.primaryEmail,
      equityPercent: FOUNDERS.saif.equityPercent,
    },
  });

  // Fix legacy founder-a / founder-b display names
  await prisma.founder.updateMany({
    where: { email: { in: [...FOUNDERS.youssef.emails] } },
    data: { name: FOUNDERS.youssef.name, equityPercent: FOUNDERS.youssef.equityPercent },
  });
  await prisma.founder.updateMany({
    where: { email: { in: [...FOUNDERS.saif.emails] } },
    data: { name: FOUNDERS.saif.name, equityPercent: FOUNDERS.saif.equityPercent },
  });

  const founderRole = await prisma.role.findUnique({
    where: { slug: ROLES.FOUNDER },
  });

  if (!founderRole) throw new Error("Founder role not found");

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: FOUNDERS.youssef.primaryEmail },
    update: { name: FOUNDERS.youssef.name, founderId: youssefFounder.id },
    create: {
      email: FOUNDERS.youssef.primaryEmail,
      name: FOUNDERS.youssef.name,
      passwordHash,
      roleId: founderRole.id,
      founderId: youssefFounder.id,
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: FOUNDERS.saif.primaryEmail },
    update: { name: FOUNDERS.saif.name, founderId: saifFounder.id },
    create: {
      email: FOUNDERS.saif.primaryEmail,
      name: FOUNDERS.saif.name,
      passwordHash,
      roleId: founderRole.id,
      founderId: saifFounder.id,
      status: "ACTIVE",
    },
  });

  const TEST_ADMIN = {
    email: "test@build8.com",
    name: "Test Admin",
  };

  const founderEmails = [...FOUNDERS.youssef.emails, ...FOUNDERS.saif.emails];
  await prisma.user.updateMany({
    where: {
      email: { notIn: [...founderEmails, TEST_ADMIN.email] },
      founderId: null,
    },
    data: { status: "INACTIVE" },
  });

  const adminRole = await prisma.role.findUnique({
    where: { slug: ROLES.ADMIN },
  });
  if (!adminRole) throw new Error("Admin role not found");

  await prisma.user.upsert({
    where: { email: TEST_ADMIN.email },
    update: {
      name: TEST_ADMIN.name,
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVE",
    },
    create: {
      email: TEST_ADMIN.email,
      name: TEST_ADMIN.name,
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVE",
    },
  });

  // Company settings
  await prisma.setting.upsert({
    where: { key: "company" },
    update: {},
    create: {
      key: "company",
      value: {
        name: "Build8",
        email: "hello@build8.com",
        address: "",
        phone: "",
        taxId: "",
        logo: null,
      },
    },
  });

  await prisma.setting.upsert({
    where: { key: "equity" },
    update: {},
    create: {
      key: "equity",
      value: {
        youssef: FOUNDERS.youssef.equityPercent,
        saif: FOUNDERS.saif.equityPercent,
        companyReserve: COMPANY_RESERVE_PERCENT,
      },
    },
  });

  await seedDemoData(prisma);

  console.log("Seed completed successfully!");
  console.log("Login credentials:");
  console.log(`  ${FOUNDERS.youssef.primaryEmail} / ${DEV_PASSWORD}`);
  console.log(`  ${FOUNDERS.saif.primaryEmail} / ${DEV_PASSWORD}`);
  console.log(`  ${TEST_ADMIN.email} / ${DEV_PASSWORD} (admin)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
