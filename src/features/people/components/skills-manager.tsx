"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addPersonSkill, removePersonSkill, createSkill } from "@/server/actions/skills.actions";

export function SkillsManager({
  personId,
  personSkills,
  allSkills,
}: {
  personId: string;
  personSkills: { skillId: string; level: number; skill: { name: string } }[];
  allSkills: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [skillId, setSkillId] = useState("");
  const [level, setLevel] = useState(3);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const available = allSkills.filter((s) => !personSkills.some((ps) => ps.skillId === s.id));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!skillId) return;
    setLoading(true);
    const result = await addPersonSkill(personId, skillId, level);
    setLoading(false);
    if (result.success) {
      setSkillId("");
      router.refresh();
    } else toast.error(result.error);
  }

  async function handleRemove(sid: string) {
    const result = await removePersonSkill(personId, sid);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  async function handleCreateSkill() {
    if (!newSkill.trim()) return;
    setLoading(true);
    const result = await createSkill(newSkill.trim());
    setLoading(false);
    if (result.success) {
      setSkillId(result.data.id);
      setNewSkill("");
      router.refresh();
    } else toast.error(result.error);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {personSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills added.</p>
        ) : (
          personSkills.map((ps) => (
            <Badge key={ps.skillId} variant="secondary" className="gap-1 pr-1">
              {ps.skill.name} · L{ps.level}
              <button type="button" onClick={() => handleRemove(ps.skillId)} className="ml-1 rounded hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
        <select value={skillId} onChange={(e) => setSkillId(e.target.value)} className="h-9 rounded-lg border px-3 text-sm">
          <option value="">Select skill</option>
          {available.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="h-9 rounded-lg border px-3 text-sm">
          {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>Level {l}</option>)}
        </select>
        <Button type="submit" size="sm" disabled={loading || !skillId}>Add Skill</Button>
      </form>
      <div className="flex gap-2">
        <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="New skill name" className="max-w-xs" />
        <Button type="button" variant="outline" size="sm" disabled={loading || !newSkill.trim()} onClick={handleCreateSkill}>Create</Button>
      </div>
    </div>
  );
}
