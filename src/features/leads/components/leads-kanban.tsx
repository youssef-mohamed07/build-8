"use client";

import { KanbanBoard } from "@/components/shared/kanban-board";
import { updateLeadStage } from "@/server/actions/leads.actions";

const STAGES = ["NEW", "CONTACTED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"] as const;
const stageLabels: Record<string, string> = {
  NEW: "New", CONTACTED: "Contacted", MEETING_SCHEDULED: "Meeting",
  PROPOSAL_SENT: "Proposal", NEGOTIATION: "Negotiation", WON: "Won", LOST: "Lost",
};

export function LeadsKanban({
  leads,
}: {
  leads: { id: string; name: string; company: string | null; stage: string }[];
}) {
  const columns = STAGES.map((stage) => ({
    id: stage,
    title: stageLabels[stage] ?? stage,
    items: leads
      .filter((l) => l.stage === stage)
      .map((l) => ({
        id: l.id,
        href: `/leads/${l.id}`,
        title: l.name,
        subtitle: l.company ?? undefined,
      })),
  }));

  return (
    <KanbanBoard
      columns={columns}
      onMove={async (itemId, columnId) => updateLeadStage(itemId, columnId)}
    />
  );
}
