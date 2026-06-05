"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MapPin, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assignMeeting, deleteMeeting } from "@/server/actions/meetings.actions";
import { formatMeetingPlace, type MeetingTypeCode } from "@/lib/meetings";
import { formatDate } from "@/lib/utils";

export function MeetingList({
  meetings,
  users,
  showClient = false,
}: {
  meetings: {
    id: string;
    clientId: string;
    title: string;
    description: string | null;
    date: Date;
    type: MeetingTypeCode | string;
    location: string | null;
    onlinePlatform: string | null;
    meetingLink: string | null;
    assignedToId: string | null;
    assignedTo: { id: string; name: string | null; email: string } | null;
    client?: { id: string; companyName: string };
  }[];
  users: { id: string; name: string | null; email: string }[];
  showClient?: boolean;
}) {
  const router = useRouter();

  if (meetings.length === 0) {
    return <p className="text-sm text-muted-foreground">No meetings scheduled.</p>;
  }

  async function handleAssign(meetingId: string, clientId: string, userId: string) {
    const result = await assignMeeting(meetingId, clientId, userId || null);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  async function handleDelete(meetingId: string, clientId: string, title: string) {
    if (!confirm(`Delete meeting "${title}"?`)) return;
    const result = await deleteMeeting(meetingId, clientId);
    if (result.success) {
      toast.success("Meeting deleted");
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <ul className="space-y-3">
      {meetings.map((m) => {
        const isOnline = m.type === "ONLINE";
        return (
          <li key={m.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{m.title}</p>
                  <Badge variant={isOnline ? "default" : "secondary"} className="gap-1 text-xs">
                    {isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {isOnline ? "Online" : "On-site"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(m.date)}</p>
                <p className="mt-1 text-sm">
                  {isOnline ? (
                    <>
                      <span className="text-muted-foreground">{m.onlinePlatform ?? "Online"}</span>
                      {m.meetingLink && (
                        <>
                          {" · "}
                          <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            Join meeting
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">{formatMeetingPlace(m)}</span>
                  )}
                </p>
                {showClient && m.client && (
                  <Link href={`/clients/${m.client.id}`} className="mt-1 inline-block text-xs text-primary hover:underline">
                    {m.client.companyName}
                  </Link>
                )}
                {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {m.assignedTo ? (
                  <Badge variant="outline">{m.assignedTo.name ?? m.assignedTo.email}</Badge>
                ) : (
                  <Badge variant="outline">Unassigned</Badge>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(m.id, m.clientId, m.title)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Assign:</span>
              <select
                value={m.assignedToId ?? ""}
                onChange={(e) => handleAssign(m.id, m.clientId, e.target.value)}
                className="h-8 flex-1 max-w-xs rounded-lg border px-2 text-sm"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
                ))}
              </select>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
