"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  rowHref?: (item: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const NON_CLICKABLE_COLUMNS = new Set(["actions"]);

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  rowHref,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or add a new record.",
}: DataTableProps<T>) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border">
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  function handleRowClick(item: T) {
    const href = rowHref?.(item);
    if (href) router.push(href);
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left font-medium text-muted-foreground",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => handleRowClick(item)}
              className={cn(
                "border-b border-border last:border-0 transition-colors",
                rowHref ? "cursor-pointer hover:bg-muted/30" : "hover:bg-muted/30"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3", col.className)}
                  onClick={NON_CLICKABLE_COLUMNS.has(col.key) ? (e) => e.stopPropagation() : undefined}
                >
                  {col.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
