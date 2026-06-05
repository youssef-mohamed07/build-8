"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addProjectMember, removeProjectMember } from "@/server/actions/projects.actions";

export function ProjectTeamPanel({
  projectId,
  members,
  users,
}: {
  projectId: string;
  members: { id: string; userId: string; role: string | null; user: { name: string | null } }[];
  users: { id: string; name: string | null }[];
}) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const available = users.filter((u) => !members.some((m) => m.userId === u.id));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const result = await addProjectMember(projectId, userId, role || undefined);
    setLoading(false);
    if (result.success) {
      setUserId("");
      setRole("");
      router.refresh();
    } else toast.error(result.error);
  }

  async function handleRemove(memberUserId: string) {
    const result = await removeProjectMember(projectId, memberUserId);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No team members assigned.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <span className="font-medium">{m.user.name ?? "Unknown"}</span>
                {m.role && <span className="ml-2 text-sm text-muted-foreground">{m.role}</span>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(m.userId)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {available.length > 0 && (
        <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="h-9 rounded-lg border px-3 text-sm">
            <option value="">Select member</option>
            {available.map((u) => <option key={u.id} value={u.id}>{u.name ?? u.id}</option>)}
          </select>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="w-32" />
          <Button type="submit" size="sm" disabled={loading || !userId}>Add</Button>
        </form>
      )}
    </div>
  );
}
