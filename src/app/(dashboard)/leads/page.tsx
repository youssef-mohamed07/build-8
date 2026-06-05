import { Plus, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { LeadsKanban } from "@/features/leads/components/leads-kanban";
import { getLeads, getLeadStats, deleteLead } from "@/server/actions/leads.actions";

const stageLabels: Record<string, string> = {
  NEW: "New Lead", CONTACTED: "Contacted", MEETING_SCHEDULED: "Meeting Scheduled",
  PROPOSAL_SENT: "Proposal Sent", NEGOTIATION: "Negotiation", WON: "Won", LOST: "Lost",
};

const stageOptions = Object.entries(stageLabels).map(([value, label]) => ({ value, label }));

function queryString(params: Record<string, string | undefined>, extra?: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  Object.entries({ ...params, ...extra }).forEach(([k, v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; view?: string }>;
}) {
  const params = await searchParams;
  const [leads, stats] = await Promise.all([
    getLeads({ search: params.q, stage: params.stage }).catch(() => []),
    getLeadStats().catch(() => ({} as Record<string, number>)),
  ]);
  const isKanban = params.view === "kanban";

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Track and manage your sales pipeline" actions={
        <Button asChild><Link href="/leads/new"><Plus className="h-4 w-4" />Add Lead</Link></Button>
      } />
      <PageStats stats={[
        { label: "New", value: stats.NEW ?? 0 }, { label: "Contacted", value: stats.CONTACTED ?? 0 },
        { label: "Proposal Sent", value: stats.PROPOSAL_SENT ?? 0 }, { label: "Won", value: stats.WON ?? 0 },
      ]} />
      <ListToolbar
        searchPlaceholder="Search leads..."
        filters={[{ key: "stage", label: "All stages", options: stageOptions }]}
        viewToggle={
          <div className="flex gap-1">
            <Button variant={!isKanban ? "default" : "outline"} size="sm" asChild>
              <Link href={`/leads${queryString({ q: params.q, stage: params.stage })}`}><List className="h-4 w-4" /></Link>
            </Button>
            <Button variant={isKanban ? "default" : "outline"} size="sm" asChild>
              <Link href={`/leads${queryString({ q: params.q, stage: params.stage, view: "kanban" })}`}><LayoutGrid className="h-4 w-4" /></Link>
            </Button>
          </div>
        }
      />
      {isKanban ? (
        <LeadsKanban leads={leads} />
      ) : (
        <DataTable data={leads} keyExtractor={(l) => l.id} rowHref={(l) => `/leads/${l.id}`} columns={[
          { key: "name", header: "Name", cell: (l) => <Link href={`/leads/${l.id}`} className="font-medium hover:underline">{l.name}</Link> },
          { key: "company", header: "Company", cell: (l) => l.company ?? "—" },
          { key: "email", header: "Email", cell: (l) => l.email ?? "—" },
          { key: "source", header: "Source", cell: (l) => l.source ?? "—" },
          { key: "stage", header: "Stage", cell: (l) => <Badge variant={l.stage === "WON" ? "success" : l.stage === "LOST" ? "destructive" : "default"}>{stageLabels[l.stage] ?? l.stage}</Badge> },
          { key: "actions", header: "", className: "w-12", cell: (l) => <ListActionsCell viewHref={`/leads/${l.id}`} editHref={`/leads/${l.id}/edit`} entityName={l.name} deleteAction={deleteLead.bind(null, l.id)} listPath="/leads" /> },
        ]} />
      )}
    </div>
  );
}
