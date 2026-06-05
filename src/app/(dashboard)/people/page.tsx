import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { getPeople, getPeopleStats, deletePerson } from "@/server/actions/people.actions";
import { formatCurrency } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function PeoplePage() {
  const currency = await getPreferredCurrency();
  const [people, stats] = await Promise.all([
    getPeople().catch(() => []),
    getPeopleStats().catch(() => ({ active: 0, freelancer: 0, onHold: 0, former: 0 })),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="People" description="Manage founders, employees, and freelancers" actions={
        <Button asChild><Link href="/people/new"><Plus className="h-4 w-4" />Add Person</Link></Button>
      } />
      <PageStats stats={[
        { label: "Active", value: stats.active }, { label: "Freelancers", value: stats.freelancer },
        { label: "On Hold", value: stats.onHold }, { label: "Former", value: stats.former },
      ]} />
      <DataTable data={people} keyExtractor={(p) => p.id} rowHref={(p) => `/people/${p.id}`} columns={[
        { key: "name", header: "Name", cell: (p) => <Link href={`/people/${p.id}`} className="font-medium hover:underline">{p.fullName}</Link> },
        { key: "position", header: "Position", cell: (p) => p.position ?? "—" },
        { key: "email", header: "Email", cell: (p) => p.email ?? "—" },
        { key: "status", header: "Status", cell: (p) => <Badge variant={p.status === "ACTIVE" ? "success" : "default"}>{p.status.replace("_", " ")}</Badge> },
        { key: "salary", header: "Salary", cell: (p) => p.currentSalary ? formatCurrency(Number(p.currentSalary), currency) : "—" },
        { key: "actions", header: "", className: "w-12", cell: (p) => <ListActionsCell viewHref={`/people/${p.id}`} editHref={`/people/${p.id}/edit`} entityName={p.fullName} deleteAction={deletePerson.bind(null, p.id)} listPath="/people" /> },
      ]} />
    </div>
  );
}
