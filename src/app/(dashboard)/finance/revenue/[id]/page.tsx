import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DetailHeader } from "@/components/shared/detail-header";
import { DetailField, DetailGrid } from "@/components/shared/detail-field";
import { DeleteEntityButton } from "@/components/shared/delete-entity-button";
import { getRevenueById, deleteRevenue } from "@/server/actions/finance.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function RevenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const revenue = await getRevenueById(id).catch(() => null);
  if (!revenue) notFound();

  return (
    <div className="space-y-6">
      <DetailHeader
        backHref="/finance"
        backLabel="Finance"
        title={revenue.description ?? "Revenue"}
        subtitle={revenue.client.companyName}
        badge={{ label: "Revenue", variant: "success" }}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/finance/revenue/${id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
            </Button>
            <DeleteEntityButton entityName="revenue entry" deleteAction={deleteRevenue.bind(null, id)} redirectTo="/finance" />
          </>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <DetailGrid>
            <DetailField label="Amount" value={<span className="text-lg font-semibold text-emerald-600">{formatCurrency(Number(revenue.amount), currency)}</span>} />
            <DetailField label="Date" value={formatDate(revenue.date)} />
            <DetailField label="Client" value={<Link href={`/clients/${revenue.client.id}`} className="text-primary hover:underline">{revenue.client.companyName}</Link>} />
            <DetailField label="Project" value={revenue.project ? <Link href={`/projects/${revenue.project.id}`} className="text-primary hover:underline">{revenue.project.name}</Link> : "—"} />
            <DetailField label="Payment Method" value={revenue.paymentMethod.replace(/_/g, " ")} />
            <DetailField label="Advance Payment" value={revenue.isAdvance ? <Badge variant="warning">Yes</Badge> : "No"} />
            <DetailField label="Description" value={revenue.description} className="sm:col-span-2" />
          </DetailGrid>
        </CardContent>
      </Card>
    </div>
  );
}
