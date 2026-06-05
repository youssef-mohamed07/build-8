import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { getProjects, getProjectStats, deleteProject } from "@/server/actions/projects.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function ProjectsPage() {
  const currency = await getPreferredCurrency();
  const [projects, stats] = await Promise.all([
    getProjects().catch(() => []),
    getProjectStats().catch(() => ({ planning: 0, active: 0, review: 0, completed: 0 })),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Manage client projects and deliverables" actions={
        <Button asChild><Link href="/projects/new"><Plus className="h-4 w-4" />New Project</Link></Button>
      } />
      <PageStats stats={[
        { label: "Planning", value: stats.planning }, { label: "Active", value: stats.active },
        { label: "Review", value: stats.review }, { label: "Completed", value: stats.completed },
      ]} />
      <DataTable data={projects} keyExtractor={(p) => p.id} rowHref={(p) => `/projects/${p.id}`} columns={[
        { key: "name", header: "Project", cell: (p) => <Link href={`/projects/${p.id}`} className="font-medium hover:underline">{p.name}</Link> },
        { key: "client", header: "Client", cell: (p) => <Link href={`/clients/${p.client.id}`} className="hover:underline">{p.client.companyName}</Link> },
        { key: "status", header: "Status", cell: (p) => <Badge variant={p.status === "ACTIVE" ? "success" : "default"}>{p.status}</Badge> },
        { key: "budget", header: "Budget", cell: (p) => p.budget ? formatCurrency(Number(p.budget), currency) : "—" },
        { key: "tasks", header: "Tasks", cell: (p) => p._count.tasks },
        { key: "deadline", header: "Deadline", cell: (p) => p.deadline ? formatDate(p.deadline) : "—" },
        { key: "actions", header: "", className: "w-12", cell: (p) => <ListActionsCell viewHref={`/projects/${p.id}`} editHref={`/projects/${p.id}/edit`} entityName={p.name} deleteAction={deleteProject.bind(null, p.id)} listPath="/projects" /> },
      ]} />
    </div>
  );
}
