import type { PrismaClient } from "../src/generated/prisma/client";
import { FOUNDERS } from "../src/lib/founders";

export async function seedDemoData(prisma: PrismaClient) {
  const existing = await prisma.setting.findUnique({ where: { key: "demo_seeded" } });
  if (existing) {
    console.log("Demo data already seeded, skipping...");
    return;
  }

  const founderUser = await prisma.user.findFirst({
    where: {
      email: { in: [...FOUNDERS.youssef.emails] },
    },
  });
  if (!founderUser) throw new Error("Founder user required before demo seed");

  const pmRole = await prisma.role.findUnique({ where: { slug: "project_manager" } });
  const devRole = await prisma.role.findUnique({ where: { slug: "developer" } });

  // Skills
  const skillNames = ["React", "TypeScript", "Node.js", "Figma", "PostgreSQL", "Next.js"];
  const skills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // Clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        companyName: "Acme Corp",
        contactPerson: "Sarah Johnson",
        email: "sarah@acmecorp.com",
        phone: "+1 555-0101",
        country: "USA",
        status: "ACTIVE",
        website: "https://acmecorp.com",
      },
    }),
    prisma.client.create({
      data: {
        companyName: "TechFlow Solutions",
        contactPerson: "Michael Chen",
        email: "michael@techflow.io",
        phone: "+1 555-0102",
        country: "Canada",
        status: "ACTIVE",
      },
    }),
    prisma.client.create({
      data: {
        companyName: "GreenLeaf Retail",
        contactPerson: "Emma Williams",
        email: "emma@greenleaf.com",
        country: "UK",
        status: "PROSPECT",
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Nova Digital",
        contactPerson: "James Park",
        email: "james@novadigital.com",
        country: "South Korea",
        status: "LEAD",
      },
    }),
    prisma.client.create({
      data: {
        companyName: "Summit Logistics",
        contactPerson: "Lisa Brown",
        email: "lisa@summitlog.com",
        country: "USA",
        status: "INACTIVE",
      },
    }),
  ]);

  // Leads
  await prisma.lead.createMany({
    data: [
      { name: "David Miller", company: "StartupXYZ", email: "david@startupxyz.com", source: "Referral", stage: "NEW" },
      { name: "Anna Kowalski", company: "PolskaTech", email: "anna@polskatech.pl", source: "LinkedIn", stage: "CONTACTED" },
      { name: "Robert Kim", company: "Kim Ventures", source: "Website", stage: "MEETING_SCHEDULED" },
      { name: "Sophie Laurent", company: "Paris Design Co", email: "sophie@parisdesign.fr", source: "Conference", stage: "PROPOSAL_SENT" },
      { name: "Tom Anderson", company: "Anderson Group", stage: "NEGOTIATION" },
      { name: "Maria Garcia", company: "Garcia Holdings", stage: "WON", clientId: clients[0].id },
    ],
  });

  // People (team)
  const people = await Promise.all([
    prisma.person.create({
      data: {
        fullName: "Alex Rivera",
        email: "alex@build8.com",
        position: "Senior Developer",
        status: "ACTIVE",
        yearsExperience: 6,
        currentSalary: 85000,
        joiningDate: new Date("2024-03-15"),
        skills: { create: [{ skillId: skills[0].id, level: 5 }, { skillId: skills[1].id, level: 5 }] },
      },
    }),
    prisma.person.create({
      data: {
        fullName: "Jordan Lee",
        email: "jordan@build8.com",
        position: "UI/UX Designer",
        status: "ACTIVE",
        yearsExperience: 4,
        currentSalary: 72000,
        joiningDate: new Date("2024-06-01"),
        skills: { create: [{ skillId: skills[3].id, level: 5 }] },
      },
    }),
    prisma.person.create({
      data: {
        fullName: "Sam Patel",
        email: "sam@build8.com",
        position: "Project Manager",
        status: "ACTIVE",
        yearsExperience: 8,
        currentSalary: 90000,
        joiningDate: new Date("2023-11-01"),
      },
    }),
    prisma.person.create({
      data: {
        fullName: "Chris Morgan",
        email: "chris@freelance.dev",
        position: "Backend Developer",
        status: "FREELANCER",
        yearsExperience: 5,
        expectedSalary: 75,
      },
    }),
    prisma.person.create({
      data: {
        fullName: "Taylor Brooks",
        email: "taylor@former.com",
        position: "Junior Developer",
        status: "FORMER_MEMBER",
        yearsExperience: 2,
      },
    }),
  ]);

  // Candidates
  const candidatePeople = await Promise.all([
    prisma.person.create({
      data: { fullName: "Nina Hoffmann", email: "nina.h@email.com", position: "Full Stack Developer", status: "CANDIDATE", yearsExperience: 3 },
    }),
    prisma.person.create({
      data: { fullName: "Omar Hassan", email: "omar.h@email.com", position: "React Developer", status: "CANDIDATE", yearsExperience: 4 },
    }),
    prisma.person.create({
      data: { fullName: "Priya Sharma", email: "priya.s@email.com", position: "Product Designer", status: "CANDIDATE", yearsExperience: 5 },
    }),
    prisma.person.create({
      data: { fullName: "Lucas Ferreira", email: "lucas.f@email.com", position: "DevOps Engineer", status: "CANDIDATE", yearsExperience: 6 },
    }),
  ]);

  await prisma.candidate.createMany({
    data: [
      { personId: candidatePeople[0].id, stage: "NEW", experienceLevel: "Mid", interviewNotes: "Strong portfolio" },
      { personId: candidatePeople[1].id, stage: "INTERVIEW", experienceLevel: "Mid", testResults: "Passed coding challenge" },
      { personId: candidatePeople[2].id, stage: "TECHNICAL_TEST", experienceLevel: "Senior" },
      { personId: candidatePeople[3].id, stage: "ACCEPTED", experienceLevel: "Senior", interviewNotes: "Excellent system design skills" },
    ],
  });

  // Projects
  const now = new Date();
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Acme E-Commerce Platform",
        description: "Full-stack e-commerce rebuild with Next.js",
        clientId: clients[0].id,
        leadId: founderUser.id,
        status: "ACTIVE",
        budget: 45000,
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        deadline: new Date(now.getFullYear(), now.getMonth() + 2, 15),
      },
    }),
    prisma.project.create({
      data: {
        name: "TechFlow Dashboard",
        description: "Analytics dashboard for SaaS metrics",
        clientId: clients[1].id,
        leadId: founderUser.id,
        status: "ACTIVE",
        budget: 28000,
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        deadline: new Date(now.getFullYear(), now.getMonth() + 1, 30),
      },
    }),
    prisma.project.create({
      data: {
        name: "GreenLeaf Mobile App",
        description: "React Native shopping app",
        clientId: clients[2].id,
        status: "PLANNING",
        budget: 35000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1),
      },
    }),
    prisma.project.create({
      data: {
        name: "Summit API Integration",
        description: "Legacy system API bridge",
        clientId: clients[4].id,
        status: "COMPLETED",
        budget: 12000,
        startDate: new Date(now.getFullYear() - 1, 6, 1),
        deadline: new Date(now.getFullYear() - 1, 9, 1),
      },
    }),
  ]);

  const saifUser = await prisma.user.findFirst({
    where: { email: { in: [...FOUNDERS.saif.emails] } },
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      { title: "Design product listing page", priority: "HIGH", status: "IN_PROGRESS", projectId: projects[0].id, assigneeId: saifUser?.id, creatorId: founderUser.id, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5) },
      { title: "Implement checkout flow", priority: "CRITICAL", status: "TODO", projectId: projects[0].id, creatorId: founderUser.id, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10) },
      { title: "Build analytics charts", priority: "HIGH", status: "IN_PROGRESS", projectId: projects[1].id, assigneeId: saifUser?.id, creatorId: founderUser.id, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7) },
      { title: "API endpoint documentation", priority: "MEDIUM", status: "REVIEW", projectId: projects[1].id, creatorId: founderUser.id },
      { title: "Wireframe mobile screens", priority: "MEDIUM", status: "TODO", projectId: projects[2].id, creatorId: founderUser.id },
      { title: "Set up CI/CD pipeline", priority: "HIGH", status: "DONE", projectId: projects[0].id, assigneeId: saifUser?.id, creatorId: founderUser.id },
      { title: "Client onboarding docs", priority: "LOW", status: "DONE", creatorId: founderUser.id },
      { title: "Security audit review", priority: "CRITICAL", status: "TODO", projectId: projects[0].id, creatorId: founderUser.id, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3) },
    ],
  });

  // Revenues (spread over 6 months for charts)
  const revenueData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
    revenueData.push(
      { clientId: clients[0].id, projectId: projects[0].id, amount: 8000 + i * 500, date, paymentMethod: "BANK_TRANSFER" as const, description: `Milestone payment month ${6 - i}` },
      { clientId: clients[1].id, projectId: projects[1].id, amount: 5000 + i * 300, date: new Date(date.getFullYear(), date.getMonth(), 20), paymentMethod: "BANK_TRANSFER" as const }
    );
  }
  await prisma.revenue.createMany({ data: revenueData });

  // Expenses
  await prisma.expense.createMany({
    data: [
      { category: "SOFTWARE", amount: 299, date: new Date(now.getFullYear(), now.getMonth(), 1), description: "Figma Team plan" },
      { category: "HOSTING", amount: 150, date: new Date(now.getFullYear(), now.getMonth(), 1), description: "Vercel Pro" },
      { category: "SALARIES", amount: 15000, date: new Date(now.getFullYear(), now.getMonth(), 1), description: "Monthly payroll" },
      { category: "MARKETING", amount: 500, date: new Date(now.getFullYear(), now.getMonth() - 1, 10), description: "LinkedIn ads" },
      { category: "DOMAINS", amount: 45, date: new Date(now.getFullYear(), now.getMonth() - 2, 5), description: "Domain renewals" },
      { category: "OPERATIONS", amount: 200, date: new Date(now.getFullYear(), now.getMonth() - 1, 1), description: "Office supplies" },
      { category: "SOFTWARE", amount: 99, date: new Date(now.getFullYear(), now.getMonth() - 3, 1), description: "GitHub Team" },
      { category: "HOSTING", amount: 75, date: new Date(now.getFullYear(), now.getMonth() - 4, 1), description: "Supabase Pro" },
    ],
  });

  // Quotations
  const quo1 = await prisma.quotation.create({
    data: {
      number: `QUO-${now.getFullYear()}-0001`,
      clientId: clients[2].id,
      projectId: projects[2].id,
      title: "GreenLeaf Mobile App Proposal",
      scope: "Design and development of iOS/Android shopping app",
      subtotal: 35000,
      tax: 3500,
      total: 38500,
      status: "SENT",
      validUntil: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      items: {
        create: [
          { description: "UI/UX Design", quantity: 1, unitPrice: 8000, total: 8000 },
          { description: "React Native Development", quantity: 1, unitPrice: 22000, total: 22000 },
          { description: "QA & Testing", quantity: 1, unitPrice: 5000, total: 5000 },
        ],
      },
    },
  });

  await prisma.quotation.create({
    data: {
      number: `QUO-${now.getFullYear()}-0002`,
      clientId: clients[3].id,
      title: "Nova Digital Website Redesign",
      subtotal: 18000,
      tax: 1800,
      total: 19800,
      status: "DRAFT",
      items: {
        create: [
          { description: "Website redesign", quantity: 1, unitPrice: 12000, total: 12000 },
          { description: "CMS integration", quantity: 1, unitPrice: 6000, total: 6000 },
        ],
      },
    },
  });

  // Invoices
  await prisma.invoice.create({
    data: {
      number: `INV-${now.getFullYear()}-0001`,
      clientId: clients[0].id,
      projectId: projects[0].id,
      subtotal: 15000,
      tax: 1500,
      total: 16500,
      status: "PAID",
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      items: {
        create: [
          { description: "Phase 1 - Design & Architecture", quantity: 1, unitPrice: 15000, total: 15000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: `INV-${now.getFullYear()}-0002`,
      clientId: clients[1].id,
      projectId: projects[1].id,
      subtotal: 10000,
      tax: 1000,
      total: 11000,
      status: "SENT",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      items: {
        create: [
          { description: "Dashboard MVP delivery", quantity: 1, unitPrice: 10000, total: 10000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: `INV-${now.getFullYear()}-0003`,
      clientId: clients[0].id,
      subtotal: 8000,
      tax: 800,
      total: 8800,
      status: "OVERDUE",
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      items: {
        create: [
          { description: "Additional feature work", quantity: 1, unitPrice: 8000, total: 8000 },
        ],
      },
    },
  });

  // Documents
  await prisma.document.createMany({
    data: [
      { name: "Acme Corp - Service Agreement.pdf", category: "CONTRACT", fileUrl: "/docs/acme-contract.pdf", clientId: clients[0].id, uploaderId: founderUser.id, folderPath: "/contracts", tags: ["contract", "acme"] },
      { name: "TechFlow - NDA.pdf", category: "CONTRACT", fileUrl: "/docs/techflow-nda.pdf", clientId: clients[1].id, uploaderId: founderUser.id, folderPath: "/contracts", tags: ["nda"] },
      { name: "E-Commerce Wireframes.fig", category: "PROJECT_FILE", fileUrl: "/docs/acme-wireframes.fig", clientId: clients[0].id, projectId: projects[0].id, uploaderId: founderUser.id, folderPath: "/projects/acme", tags: ["design"] },
      { name: "Build8 Employee Handbook.pdf", category: "TEAM_DOCUMENT", fileUrl: "/docs/handbook.pdf", uploaderId: founderUser.id, folderPath: "/team", tags: ["hr"] },
      { name: "Nina Hoffmann - CV.pdf", category: "CANDIDATE_CV", fileUrl: "/docs/nina-cv.pdf", uploaderId: founderUser.id, folderPath: "/candidates", tags: ["cv", "developer"] },
    ],
  });

  // Client notes & meetings
  await prisma.clientNote.create({
    data: { clientId: clients[0].id, authorId: founderUser.id, content: "Great kickoff meeting. Client wants mobile-first approach." },
  });
  await prisma.meeting.create({
    data: { clientId: clients[0].id, title: "Sprint Review", date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3), description: "Reviewed Phase 1 deliverables" },
  });

  // Activities
  await prisma.activity.createMany({
    data: [
      { type: "CLIENT_CREATED", title: "New client: Acme Corp", actorId: founderUser.id },
      { type: "PROJECT_CREATED", title: "New project: Acme E-Commerce Platform", actorId: founderUser.id },
      { type: "PAYMENT_RECEIVED", title: "Payment received: $16,500 from Acme Corp", actorId: founderUser.id },
      { type: "CANDIDATE_ADDED", title: "New candidate: Nina Hoffmann", actorId: founderUser.id },
      { type: "TEAM_MEMBER_ADDED", title: "New team member: Alex Rivera", actorId: founderUser.id },
      { type: "INVOICE_PAID", title: "Invoice INV-2026-0001 marked as paid", actorId: founderUser.id },
      { type: "TASK_COMPLETED", title: "Task completed: Set up CI/CD pipeline", actorId: founderUser.id },
      { type: "QUOTATION_SENT", title: `Quotation sent: ${quo1.title}`, actorId: founderUser.id },
    ],
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: founderUser.id, type: "NEW_CLIENT", title: "New Client Added", message: "Acme Corp has been added to your CRM", link: "/clients" },
      { userId: founderUser.id, type: "NEW_PAYMENT", title: "Payment Received", message: "$16,500 payment from Acme Corp", link: "/finance" },
      { userId: founderUser.id, type: "INVOICE_OVERDUE", title: "Invoice Overdue", message: "INV-2026-0003 is past due", link: "/invoices", read: false },
      { userId: founderUser.id, type: "PROJECT_DEADLINE", title: "Deadline Approaching", message: "Acme E-Commerce Platform due in 60 days", link: "/projects" },
      { userId: founderUser.id, type: "NEW_CANDIDATE", title: "New Candidate", message: "Nina Hoffmann added to talent pool", link: "/talent-pool", read: true },
    ],
  });

  // Equity distribution
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const youssefFounder = await prisma.founder.findFirst({
    where: { email: { in: [...FOUNDERS.youssef.emails] } },
  });
  const saifFounder = await prisma.founder.findFirst({
    where: { email: { in: [...FOUNDERS.saif.emails] } },
  });

  if (youssefFounder && saifFounder) {
    await prisma.equityDistribution.createMany({
      data: [
        { founderId: youssefFounder.id, periodStart, periodEnd, totalRevenue: 42000, totalExpenses: 16200, netProfit: 25800, founderShare: 7740, reserveShare: 0, isReserve: false },
        { founderId: saifFounder.id, periodStart, periodEnd, totalRevenue: 42000, totalExpenses: 16200, netProfit: 25800, founderShare: 7740, reserveShare: 0, isReserve: false },
        { founderId: null, periodStart, periodEnd, totalRevenue: 42000, totalExpenses: 16200, netProfit: 25800, founderShare: 0, reserveShare: 10320, isReserve: true },
      ],
    });
  }

  await prisma.setting.create({
    data: { key: "demo_seeded", value: { at: new Date().toISOString() } },
  });

  console.log("Demo data seeded successfully!");
}
