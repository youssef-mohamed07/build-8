"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClickableTableRow({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      className={cn(
        "border-b hover:bg-muted/30 cursor-pointer transition-colors last:border-0",
        className
      )}
    >
      {children}
    </tr>
  );
}
