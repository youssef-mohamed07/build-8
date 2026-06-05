"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types";

export function ActionButton({
  label,
  action,
  redirectTo,
  variant = "outline",
  size = "sm",
  confirmMessage,
}: {
  label: string;
  action: () => Promise<ActionResult<unknown>>;
  redirectTo?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "sm" | "default";
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setLoading(true);
    const result = await action();
    setLoading(false);
    if (result.success) {
      toast.success("Done");
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Button variant={variant} size={size} disabled={loading} onClick={handleClick}>
      {loading ? "..." : label}
    </Button>
  );
}
