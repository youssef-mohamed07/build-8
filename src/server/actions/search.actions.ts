"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac/check-permission";

export async function globalSearch(query: string) {
  if (!query.trim()) return [];
  await requireAuth();
  const q = query.trim();

  const [clients, leads, projects, tasks, people, invoices, quotations] = await Promise.all([
    prisma.client.findMany({
      where: { companyName: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, companyName: true },
    }),
    prisma.lead.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] },
      take: 5,
      select: { id: true, name: true, company: true },
    }),
    prisma.project.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true },
    }),
    prisma.task.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, title: true },
    }),
    prisma.person.findMany({
      where: { fullName: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, fullName: true },
    }),
    prisma.invoice.findMany({
      where: { number: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, number: true },
    }),
    prisma.quotation.findMany({
      where: { OR: [{ number: { contains: q, mode: "insensitive" } }, { title: { contains: q, mode: "insensitive" } }] },
      take: 5,
      select: { id: true, number: true, title: true },
    }),
  ]);

  return [
    ...clients.map((c) => ({ type: "Client", label: c.companyName, href: `/clients/${c.id}` })),
    ...leads.map((l) => ({ type: "Lead", label: l.company ? `${l.name} — ${l.company}` : l.name, href: `/leads/${l.id}` })),
    ...projects.map((p) => ({ type: "Project", label: p.name, href: `/projects/${p.id}` })),
    ...tasks.map((t) => ({ type: "Task", label: t.title, href: `/tasks/${t.id}` })),
    ...people.map((p) => ({ type: "Person", label: p.fullName, href: `/people/${p.id}` })),
    ...invoices.map((i) => ({ type: "Invoice", label: i.number, href: `/invoices/${i.id}` })),
    ...quotations.map((q) => ({ type: "Quotation", label: `${q.number} — ${q.title}`, href: `/quotations/${q.id}` })),
  ];
}
