"use client";

import { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

const INTERACTIVE_SELECTOR = "a,button,input,select,textarea,[role='button'],[role='menuitem']";

interface DataTableBodyProps {
  rowHrefs?: (string | undefined)[];
  children: ReactNode;
}

export function DataTableBody({ rowHrefs, children }: DataTableBodyProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLTableSectionElement>) {
    if (!rowHrefs) return;
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;

    const row = (event.target as HTMLElement).closest<HTMLTableRowElement>("tr[data-row-index]");
    if (!row) return;

    const index = Number(row.dataset.rowIndex);
    const href = rowHrefs[index];
    if (href) router.push(href);
  }

  return <tbody onClick={handleClick}>{children}</tbody>;
}
