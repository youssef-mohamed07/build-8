"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateReport } from "@/server/actions/reports.actions";
import { downloadCsv } from "@/lib/export-csv";

export function ReportDownloadButton({ type, label }: { type: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const csv = await generateReport(type);
      downloadCsv(`${type}-report-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      toast.success("Report downloaded");
    } catch {
      toast.error("Failed to generate report");
    }
    setLoading(false);
  }

  return (
    <Button size="sm" variant="outline" disabled={loading} onClick={handleDownload}>
      <Download className="h-3 w-3" />
      {loading ? "..." : label}
    </Button>
  );
}
