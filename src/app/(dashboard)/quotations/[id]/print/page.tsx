import { notFound } from "next/navigation";
import { getQuotationById } from "@/server/actions/quotations.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function QuotationPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const quotation = await getQuotationById(id).catch(() => null);
  if (!quotation) notFound();

  return (
    <html lang="en">
      <head>
        <title>{quotation.number}</title>
        <style>{`
          body { font-family: system-ui, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
          h1 { margin: 0 0 4px; font-size: 28px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .totals { margin-top: 16px; text-align: right; }
          .meta { color: #555; font-size: 14px; }
        `}</style>
      </head>
      <body>
        <h1>Quotation</h1>
        <p className="meta"><strong>{quotation.number}</strong> — {quotation.title}</p>
        <p className="meta">Client: {quotation.client.companyName}</p>
        {quotation.project && <p className="meta">Project: {quotation.project.name}</p>}
        {quotation.validUntil && <p className="meta">Valid Until: {formatDate(quotation.validUntil)}</p>}
        {quotation.scope && <p className="meta" style={{ marginTop: 16 }}>Scope: {quotation.scope}</p>}
        <table>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {quotation.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(Number(item.unitPrice), currency)}</td>
                <td>{formatCurrency(Number(item.total), currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="totals">
          <p>Subtotal: {formatCurrency(Number(quotation.subtotal), currency)}</p>
          <p>Tax: {formatCurrency(Number(quotation.tax), currency)}</p>
          <p><strong>Total: {formatCurrency(Number(quotation.total), currency)}</strong></p>
        </div>
        {quotation.notes && <p style={{ marginTop: 24 }}>Notes: {quotation.notes}</p>}
        <script dangerouslySetInnerHTML={{ __html: "window.onload=()=>setTimeout(()=>window.print(),400)" }} />
      </body>
    </html>
  );
}
