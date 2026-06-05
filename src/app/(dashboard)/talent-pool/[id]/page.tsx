import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusUpdater } from "@/components/shared/status-updater";
import { NoteForm } from "@/components/shared/note-form";
import { ActionButton } from "@/components/shared/action-button";
import { getCandidateById, deleteCandidate, updateCandidateStage, addCandidateNote, hireCandidate } from "@/server/actions/candidates.actions";
import { formatDate } from "@/lib/utils";

const stages = ["NEW", "CONTACTED", "INTERVIEW", "TECHNICAL_TEST", "ACCEPTED", "REJECTED", "HIRED"].map((s) => ({
  value: s, label: s.replace(/_/g, " "),
}));

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidateById(id).catch(() => null);
  if (!candidate) notFound();
  const { person } = candidate;

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/talent-pool"
        backLabel="Talent Pool"
        title={person.fullName}
        subtitle={person.position ?? undefined}
        badge={{ label: candidate.stage.replace(/_/g, " "), variant: candidate.stage === "ACCEPTED" ? "success" : candidate.stage === "REJECTED" ? "destructive" : "default" }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/talent-pool/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </Button>
            <StatusUpdater value={candidate.stage} options={stages} onUpdate={updateCandidateStage.bind(null, id)} label="Pipeline" />
            {candidate.stage !== "HIRED" && candidate.stage !== "REJECTED" && (
              <ActionButton
                label="Hire"
                action={hireCandidate.bind(null, id)}
                confirmMessage={`Hire ${person.fullName} as team member?`}
                redirectTo={`/people/${person.id}`}
              />
            )}
            <DeleteEntityButton entityName={person.fullName} deleteAction={deleteCandidate.bind(null, id)} redirectTo="/talent-pool" />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailField label="Email" value={person.email} />
              <DetailField label="Phone" value={person.phone} />
              <DetailField label="Experience Level" value={candidate.experienceLevel} />
              <DetailField label="Years Experience" value={person.yearsExperience ? `${person.yearsExperience} yrs` : "—"} />
              <DetailField label="CV" value={candidate.cvUrl ? <a href={candidate.cvUrl} className="text-primary hover:underline">Download</a> : "—"} />
            </DetailGrid>
            {person.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {person.skills.map((ps) => <Badge key={ps.skillId} variant="secondary">{ps.skill.name}</Badge>)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Interview & Test</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs font-medium text-muted-foreground">Interview Notes</p><p className="mt-1 text-sm">{candidate.interviewNotes ?? "—"}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground">Test Results</p><p className="mt-1 text-sm">{candidate.testResults ?? "—"}</p></div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <NoteForm onSubmit={addCandidateNote.bind(null, id)} />
            {candidate.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="space-y-3">{candidate.notes.map((n) => (
                <li key={n.id} className="rounded-lg border p-3">
                  <p className="text-sm">{n.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.author.name} · {formatDate(n.createdAt)}</p>
                </li>
              ))}</ul>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Link href={`/people/${person.id}`} className="text-sm text-primary hover:underline">View full person profile →</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
