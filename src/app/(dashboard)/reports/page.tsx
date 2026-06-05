import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportDownloadButton } from "@/features/reports/components/report-download-button";

const reports = [
  { type: "revenue", title: "Monthly Revenue Report", description: "Revenue breakdown by client and project" },
  { type: "expenses", title: "Expense Report", description: "Expenses by category and period" },
  { type: "profit", title: "Profit Report", description: "Net profit and margin analysis" },
  { type: "clients", title: "Client Report", description: "Client activity and revenue contribution" },
  { type: "projects", title: "Project Report", description: "Project status, budget, and timeline" },
  { type: "founders", title: "Founder Earnings Report", description: "Equity distribution and withdrawals" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export business reports" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <ReportDownloadButton type={report.type} label="CSV" />
              <ReportDownloadButton type={report.type} label="Excel" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
