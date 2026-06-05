"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { ActionResult } from "@/types";

export interface KanbanColumn<T extends { id: string }> {
  id: string;
  title: string;
  items: T[];
}

export function KanbanBoard<T extends { id: string; href: string; title: string; subtitle?: string }>({
  columns,
  onMove,
}: {
  columns: KanbanColumn<T>[];
  onMove: (itemId: string, columnId: string) => Promise<ActionResult>;
}) {
  const router = useRouter();

  async function handleDrop(itemId: string, columnId: string) {
    const result = await onMove(itemId, columnId);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div
          key={col.id}
          className="min-w-[260px] flex-1 rounded-xl border bg-muted/20"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const itemId = e.dataTransfer.getData("itemId");
            if (itemId) handleDrop(itemId, col.id);
          }}
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">{col.title}</span>
            <Badge variant="secondary">{col.items.length}</Badge>
          </div>
          <div className="space-y-2 p-2">
            {col.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("itemId", item.id)}
                className="cursor-grab rounded-lg border bg-background p-3 shadow-sm active:cursor-grabbing"
              >
                <Link href={item.href} className="font-medium text-sm hover:underline">{item.title}</Link>
                {item.subtitle && <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
