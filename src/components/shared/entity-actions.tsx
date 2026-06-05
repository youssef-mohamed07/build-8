"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActionResult } from "@/types";

interface EntityActionsProps {
  viewHref: string;
  editHref?: string;
  entityName: string;
  deleteAction?: () => Promise<ActionResult>;
  redirectAfterDelete?: string;
}

export function EntityActions({
  viewHref,
  editHref,
  entityName,
  deleteAction,
  redirectAfterDelete,
}: EntityActionsProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDelete() {
    if (!deleteAction) return;
    if (!confirm(`Delete ${entityName}? This cannot be undone.`)) return;

    const result = await deleteAction();
    if (result.success) {
      toast.success(`${entityName} deleted`);
      router.push(redirectAfterDelete ?? (viewHref.split("/").slice(0, -1).join("/") || "/"));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={viewHref} className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> View
          </Link>
        </DropdownMenuItem>
        {editHref && (
          <DropdownMenuItem asChild>
            <Link href={editHref} className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </DropdownMenuItem>
        )}
        {deleteAction && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
