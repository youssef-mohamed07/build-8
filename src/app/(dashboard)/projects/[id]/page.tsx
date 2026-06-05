import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { RelatedList } from "@/components/shared/related-list";
import { ClickableTableRow } from "@/components/shared/clickable-table-row";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusUpdater } from "@/components/shared/status-updater";
import { NoteForm } from "@/components/shared/note-form";
import { ProjectTeamPanel } from "@/features/projects/components/project-team-panel";
import { getProjectById, deleteProject, updateProjectStatus } from "@/server/actions/projects.actions";
import { addProjectComment } from "@/server/actions/comments.actions";
import { getUsersForSelect } from "@/server/actions/users.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

const statuses = ["PLANNING", "ACTIVE", "REVIEW", "COMPLETED", "CANCELLED"].map((s) => ({ value: s, label: s }));

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const [project, users] = await Promise.all([
    getProjectById(id).catch(() => null),
    getUsersForSelect().catch(() => []),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/projects"
        backLabel="Projects"
        title={project.name}
        subtitle={project.client.companyName}
        badge={{ label: project.status, variant: project.status === "ACTIVE" ? "success" : "default" }}
        actions={
          <>
            <StatusUpdater value={project.status} options={statuses} onUpdate={updateProjectStatus.bind(null, id)} />
            <Button variant="outline" size="sm" asChild><Link href={`/projects/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link></Button>
            <DeleteEntityButton entityName={project.name} deleteAction={deleteProject.bind(null, id)} redirectTo="/projects" />
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({project.tasks.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({project.members.length})</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="comments">Comments ({project.comments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <DetailGrid>
                <DetailField label="Client" value={<Link href={`/clients/${project.client.id}`} className="text-primary hover:underline">{project.client.companyName}</Link>} />
                <DetailField label="Budget" value={project.budget ? formatCurrency(Number(project.budget), currency) : "—"} />
                <DetailField label="Start Date" value={project.startDate ? formatDate(project.startDate) : "—"} />
                <DetailField label="Deadline" value={project.deadline ? formatDate(project.deadline) : "—"} />
                <DetailField label="Project Lead" value={project.lead?.name} />
                <DetailField label="Description" value={project.description} className="sm:col-span-2 lg:col-span-3" />
              </DetailGrid>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="mb-4 flex justify-end">
            <Button size="sm" asChild><Link href={`/tasks/new?projectId=${id}`}><Plus className="h-4 w-4" /> Add Task</Link></Button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">{["Task", "Assignee", "Priority", "Status", "Due"].map((h) => <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
              <tbody>
                {project.tasks.map((t) => (
                  <ClickableTableRow key={t.id} href={`/tasks/${t.id}`}>
                    <td className="px-4 py-3 font-medium">{t.title}</td>
                    <td className="px-4 py-3">{t.assignee?.name ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant={t.priority === "CRITICAL" ? "destructive" : "default"}>{t.priority}</Badge></td>
                    <td className="px-4 py-3">{t.status.replace("_", " ")}</td>
                    <td className="px-4 py-3">{t.dueDate ? formatDate(t.dueDate) : "—"}</td>
                  </ClickableTableRow>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <Card><CardContent className="pt-6">
            <ProjectTeamPanel projectId={id} members={project.members} users={users} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="finance" className="grid gap-4 lg:grid-cols-2">
          <RelatedList title="Invoices" items={project.invoices.map((i) => ({ id: i.id, href: `/invoices/${i.id}`, title: i.number, subtitle: i.status, meta: formatCurrency(Number(i.total), currency) }))} />
          <RelatedList title="Revenue" items={project.revenues.map((r) => ({ id: r.id, href: `/finance/revenue/${r.id}`, title: r.description ?? "Payment", subtitle: formatDate(r.date), meta: formatCurrency(Number(r.amount), currency) }))} />
          <RelatedList title="Documents" items={project.documents.map((d) => ({ id: d.id, href: `/documents/${d.id}`, title: d.name, subtitle: d.category }))} />
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <NoteForm onSubmit={addProjectComment.bind(null, id)} placeholder="Add a comment..." />
              {project.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                <ul className="space-y-3">{project.comments.map((c) => (
                  <li key={c.id} className="rounded-lg border p-3">
                    <p className="text-sm">{c.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.author.name} · {formatDate(c.createdAt)}</p>
                  </li>
                ))}</ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
