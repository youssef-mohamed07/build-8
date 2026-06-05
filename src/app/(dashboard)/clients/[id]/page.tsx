import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { RelatedList } from "@/components/shared/related-list";
import { NoteForm } from "@/components/shared/note-form";
import { MeetingForm } from "@/features/clients/components/meeting-form";
import { MeetingList } from "@/features/clients/components/meeting-list";
import { getUsersForSelect } from "@/server/actions/users.actions";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { getClientById, addClientNote } from "@/server/actions/clients.actions";
import { deleteClient } from "@/server/actions/clients.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary"> = {
  LEAD: "secondary", PROSPECT: "warning", ACTIVE: "success", INACTIVE: "default",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const [client, users] = await Promise.all([
    getClientById(id).catch(() => null),
    getUsersForSelect().catch(() => []),
  ]);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/clients"
        backLabel="Clients"
        title={client.companyName}
        subtitle={client.contactPerson ?? undefined}
        badge={{ label: client.status.replace("_", " "), variant: statusVariant[client.status] }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/clients/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </Button>
            <DeleteEntityButton
              entityName={client.companyName}
              deleteAction={deleteClient.bind(null, id)}
              redirectTo="/clients"
            />
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes ({client.notes.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({client.projects.length})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
            <CardContent>
              <DetailGrid>
                <DetailField label="Email" value={client.email ? <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a> : null} />
                <DetailField label="Phone" value={client.phone} />
                <DetailField label="WhatsApp" value={client.whatsapp} />
                <DetailField label="Country" value={client.country} />
                <DetailField label="Website" value={client.website ? <a href={client.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{client.website}</a> : null} />
                <DetailField label="Address" value={client.address} className="sm:col-span-2" />
                <DetailField label="Created" value={formatDate(client.createdAt)} />
              </DetailGrid>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">Meetings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <MeetingForm clientId={id} users={users} />
              <MeetingList meetings={client.meetings} users={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader><CardTitle className="text-base">Client Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <NoteForm onSubmit={addClientNote.bind(null, id)} />
              {client.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                <ul className="space-y-3">
                  {client.notes.map((note) => (
                    <li key={note.id} className="rounded-lg border p-3">
                      <p className="text-sm">{note.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {note.author.name} · {formatDate(note.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <RelatedList
            title="Projects"
            items={client.projects.map((p) => ({
              id: p.id,
              href: `/projects/${p.id}`,
              title: p.name,
              subtitle: p.status,
              meta: p.budget ? formatCurrency(Number(p.budget), currency) : undefined,
            }))}
          />
        </TabsContent>

        <TabsContent value="billing" className="grid gap-4 lg:grid-cols-2">
          <RelatedList
            title="Invoices"
            items={client.invoices.map((i) => ({
              id: i.id,
              href: `/invoices/${i.id}`,
              title: i.number,
              subtitle: i.status,
              meta: formatCurrency(Number(i.total), currency),
            }))}
          />
          <RelatedList
            title="Quotations"
            items={client.quotations.map((q) => ({
              id: q.id,
              href: `/quotations/${q.id}`,
              title: q.number,
              subtitle: q.status,
              meta: formatCurrency(Number(q.total), currency),
            }))}
          />
          <RelatedList
            title="Payments"
            items={client.revenues.map((r) => ({
              id: r.id,
              href: `/finance/revenue/${r.id}`,
              title: r.description ?? "Payment",
              subtitle: formatDate(r.date),
              meta: formatCurrency(Number(r.amount), currency),
            }))}
          />
          <RelatedList
            title="Documents"
            items={client.documents.map((d) => ({
              id: d.id,
              href: `/documents/${d.id}`,
              title: d.name,
              subtitle: d.category,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
