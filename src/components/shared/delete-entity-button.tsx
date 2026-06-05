"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types";

export function DeleteEntityButton({
  entityName,
  deleteAction,
  redirectTo,
}: {
  entityName: string;
  deleteAction: () => Promise<ActionResult>;
  redirectTo: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete ${entityName}? This cannot be undone.`)) return;
    const result = await deleteAction();
    if (result.success) {
      toast.success("Deleted successfully");
      router.push(redirectTo);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="h-4 w-4" /> Delete
    </Button>
  );
}
