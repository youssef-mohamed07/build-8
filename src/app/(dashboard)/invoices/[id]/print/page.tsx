import { notFound } from "next/navigation";
import { getInvoiceById } from "@/server/actions/invoices.actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPreferredCurrency } from "@/lib/get-preferred-currency";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const currency = await getPreferredCurrency();
  const { id } = await params;
  const invoice = await getInvoiceById(id).catch(() => null);
  if (!invoice) notFound();

  return (
    <html lang="en">
      <head>
        <title>{invoice.number}</title>
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
        <h1>Invoice</h1>
        <p className="meta"><strong>{invoice.number}</strong></p>
        <p className="meta">Client: {invoice.client.companyName}</p>
        {invoice.project && <p className="meta">Project: {invoice.project.name}</p>}
        {invoice.dueDate && <p className="meta">Due: {formatDate(invoice.dueDate)}</p>}
        <table>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
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
          <p>Subtotal: {formatCurrency(Number(invoice.subtotal), currency)}</p>
          <p>Tax: {formatCurrency(Number(invoice.tax), currency)}</p>
          <p><strong>Total: {formatCurrency(Number(invoice.total), currency)}</strong></p>
        </div>
        {invoice.notes && <p style={{ marginTop: 24 }}>Notes: {invoice.notes}</p>}
        <script dangerouslySetInnerHTML={{ __html: "window.onload=()=>setTimeout(()=>window.print(),400)" }} />
      </body>
    </html>
  );
}
