import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PageStats } from "@/components/shared/page-stats";
import { DataTable } from "@/components/shared/data-table";
import { ListActionsCell } from "@/components/shared/list-actions-cell";
import { getCandidates, getCandidateStats, deleteCandidate } from "@/server/actions/candidates.actions";

const stageLabels: Record<string, string> = {
  NEW: "New", CONTACTED: "Contacted", INTERVIEW: "Interview",
  TECHNICAL_TEST: "Technical Test", ACCEPTED: "Accepted", REJECTED: "Rejected", HIRED: "Hired",
};

export default async function TalentPoolPage() {
  const [candidates, stats] = await Promise.all([
    getCandidates().catch(() => []),
    getCandidateStats().catch(() => ({ newCount: 0, interview: 0, technicalTest: 0, accepted: 0 })),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Talent Pool" description="Manage candidates and hiring pipeline" actions={
        <Button asChild><Link href="/talent-pool/new"><Plus className="h-4 w-4" />Add Candidate</Link></Button>
      } />
      <PageStats stats={[
        { label: "New", value: stats.newCount }, { label: "Interview", value: stats.interview },
        { label: "Technical Test", value: stats.technicalTest }, { label: "Accepted", value: stats.accepted },
      ]} />
      <DataTable data={candidates} keyExtractor={(c) => c.id} rowHref={(c) => `/talent-pool/${c.id}`} columns={[
        { key: "name", header: "Candidate", cell: (c) => <Link href={`/talent-pool/${c.id}`} className="font-medium hover:underline">{c.person.fullName}</Link> },
        { key: "position", header: "Position", cell: (c) => c.person.position ?? "—" },
        { key: "level", header: "Level", cell: (c) => c.experienceLevel ?? "—" },
        { key: "stage", header: "Stage", cell: (c) => <Badge variant={c.stage === "ACCEPTED" ? "success" : "default"}>{stageLabels[c.stage] ?? c.stage}</Badge> },
        { key: "notes", header: "Notes", cell: (c) => c.interviewNotes ?? "—" },
        { key: "actions", header: "", className: "w-12", cell: (c) => <ListActionsCell viewHref={`/talent-pool/${c.id}`} editHref={`/talent-pool/${c.id}/edit`} entityName={c.person.fullName} deleteAction={deleteCandidate.bind(null, c.id)} listPath="/talent-pool" /> },
      ]} />
    </div>
  );
}
