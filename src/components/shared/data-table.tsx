import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableBody } from "@/components/shared/data-table-body";

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

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  rowHref,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or add a new record.",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border">
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  const rowHrefs = rowHref ? data.map((item) => rowHref(item)) : undefined;

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
        <DataTableBody rowHrefs={rowHrefs}>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              data-row-index={index}
              className={cn(
                "border-b border-border last:border-0 transition-colors hover:bg-muted/30",
                rowHref && "cursor-pointer"
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3", col.className)}
                >
                  {col.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </DataTableBody>
      </table>
    </div>
  );
}
