import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { StatusUpdater } from "@/components/shared/status-updater";
import { ActionButton } from "@/components/shared/action-button";
import { getLeadById, deleteLead, updateLeadStage, convertLeadToClient } from "@/server/actions/leads.actions";
import { formatDate } from "@/lib/utils";

const stages = ["NEW", "CONTACTED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"].map((s) => ({
  value: s, label: s.replace(/_/g, " "),
}));

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id).catch(() => null);
  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/leads"
        backLabel="Leads"
        title={lead.name}
        subtitle={lead.company ?? undefined}
        badge={{ label: lead.stage.replace(/_/g, " "), variant: lead.stage === "WON" ? "success" : lead.stage === "LOST" ? "destructive" : "default" }}
        actions={
          <>
            <StatusUpdater value={lead.stage} options={stages} onUpdate={updateLeadStage.bind(null, id)} label="Stage" />
            {!lead.client && lead.stage !== "LOST" && (
              <ActionButton
                label="Convert to Client"
                action={convertLeadToClient.bind(null, id)}
                confirmMessage="Convert this lead to a client?"
                redirectTo={`/clients`}
              />
            )}
            <Button variant="outline" size="sm" asChild><Link href={`/leads/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link></Button>
            <DeleteEntityButton entityName={lead.name} deleteAction={deleteLead.bind(null, id)} redirectTo="/leads" />
          </>
        }
      />
      <Card>
        <CardHeader><CardTitle className="text-base">Lead Details</CardTitle></CardHeader>
        <CardContent>
          <DetailGrid>
            <DetailField label="Company" value={lead.company} />
            <DetailField label="Email" value={lead.email} />
            <DetailField label="Phone" value={lead.phone} />
            <DetailField label="Source" value={lead.source} />
            <DetailField label="Created" value={formatDate(lead.createdAt)} />
            {lead.client && (
              <DetailField label="Converted Client" value={<Link href={`/clients/${lead.client.id}`} className="text-primary hover:underline">{lead.client.companyName}</Link>} />
            )}
            {lead.notes && <DetailField label="Notes" value={lead.notes} className="sm:col-span-2 lg:col-span-3" />}
          </DetailGrid>
        </CardContent>
      </Card>
    </div>
  );
}
