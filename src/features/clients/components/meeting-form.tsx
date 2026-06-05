"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEETING_TYPES, ONLINE_PLATFORMS, type MeetingTypeCode } from "@/lib/meetings";
import { createMeeting } from "@/server/actions/meetings.actions";

export function MeetingForm({
  clientId,
  users,
}: {
  clientId: string;
  users: { id: string; name: string | null; email: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<MeetingTypeCode>("ON_SITE");
  const [location, setLocation] = useState("");
  const [onlinePlatform, setOnlinePlatform] = useState("");
  const [customPlatform, setCustomPlatform] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");

  const platformValue = onlinePlatform === "Other" ? customPlatform.trim() : onlinePlatform;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setLoading(true);
    const result = await createMeeting({
      clientId,
      title: title.trim(),
      date,
      type,
      location: type === "ON_SITE" ? location.trim() : undefined,
      onlinePlatform: type === "ONLINE" ? platformValue : undefined,
      meetingLink: type === "ONLINE" ? meetingLink.trim() || undefined : undefined,
      description,
      assignedToId: assignedToId || undefined,
    });
    setLoading(false);
    if (result.success) {
      toast.success("Meeting scheduled");
      setTitle("");
      setDate("");
      setLocation("");
      setOnlinePlatform("");
      setCustomPlatform("");
      setMeetingLink("");
      setDescription("");
      setAssignedToId("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Schedule Meeting</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Date *</Label>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Type *</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MeetingTypeCode)}
            className="flex h-9 w-full rounded-lg border border-input px-3 text-sm"
          >
            {MEETING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {type === "ON_SITE" ? (
          <div className="space-y-1 sm:col-span-2">
            <Label>Location *</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office, client site, address..." />
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <Label>Platform *</Label>
              <select
                value={onlinePlatform}
                onChange={(e) => setOnlinePlatform(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input px-3 text-sm"
              >
                <option value="">Select app</option>
                {ONLINE_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            {onlinePlatform === "Other" && (
              <div className="space-y-1">
                <Label>App name *</Label>
                <Input value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)} placeholder="e.g. Slack Huddle" />
              </div>
            )}
            <div className="space-y-1 sm:col-span-2">
              <Label>Meeting link</Label>
              <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/... or meet.google.com/..." />
            </div>
          </>
        )}

        <div className="space-y-1 sm:col-span-2">
          <Label>Assign to</Label>
          <select
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={loading || !title.trim() || !date}>Add Meeting</Button>
    </form>
  );
}
