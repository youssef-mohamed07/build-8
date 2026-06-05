"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/types";

export function NoteForm({ onSubmit, placeholder = "Add a note..." }: {
  onSubmit: (content: string) => Promise<ActionResult>;
  placeholder?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const result = await onSubmit(content.trim());
    setLoading(false);
    if (result.success) {
      setContent("");
      toast.success("Note added");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder={placeholder} />
      <Button type="submit" size="sm" disabled={loading || !content.trim()}>Add</Button>
    </form>
  );
}
