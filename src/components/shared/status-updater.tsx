"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/types";

interface StatusUpdaterProps {
  value: string;
  options: { value: string; label: string }[];
  onUpdate: (value: string) => Promise<ActionResult>;
  label?: string;
}

export function StatusUpdater({ value, options, onUpdate, label = "Status" }: StatusUpdaterProps) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const result = await onUpdate(e.target.value);
    if (result.success) {
      toast.success(`${label} updated`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
