import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { MeetingList } from "@/features/clients/components/meeting-list";
import { getMeetings } from "@/server/actions/meetings.actions";
import { getUsersForSelect } from "@/server/actions/users.actions";

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignee?: string }>;
}) {
  const { assignee } = await searchParams;
  const [meetings, users] = await Promise.all([
    getMeetings(assignee ? { assignedToId: assignee } : undefined).catch(() => []),
    getUsersForSelect().catch(() => []),
  ]);

  const upcoming = meetings.filter((m) => new Date(m.date) >= new Date());
  const past = meetings.filter((m) => new Date(m.date) < new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Schedule and assign client meetings"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/clients"><Plus className="h-4 w-4" />Schedule via Client</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by assignee:</span>
        <Link
          href="/meetings"
          className={`rounded-lg border px-3 py-1.5 text-sm ${!assignee ? "bg-muted font-medium" : "hover:bg-muted/50"}`}
        >
          All
        </Link>
        {users.map((u) => (
          <Link
            key={u.id}
            href={`/meetings?assignee=${u.id}`}
            className={`rounded-lg border px-3 py-1.5 text-sm ${assignee === u.id ? "bg-muted font-medium" : "hover:bg-muted/50"}`}
          >
            {u.name ?? u.email}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Upcoming ({upcoming.length})</h2>
          <MeetingList meetings={upcoming} users={users} showClient />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Past ({past.length})</h2>
          <MeetingList meetings={past} users={users} showClient />
        </div>
      </div>
    </div>
  );
}
