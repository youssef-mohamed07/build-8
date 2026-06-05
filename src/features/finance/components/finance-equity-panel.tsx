"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWithdrawal, updateWithdrawalStatus } from "@/server/actions/withdrawals.actions";
import { FOUNDERS } from "@/lib/founders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCurrencyStore } from "@/stores/currency-store";

export function FinanceEquityPanel({
  distribution,
  founders,
  withdrawals,
}: {
  distribution: { netProfit: number; youssef: number; saif: number; companyReserve: number };
  founders: { id: string; name: string }[];
  withdrawals: {
    id: string;
    amount: number | string | { toString(): string };
    status: string;
    notes: string | null;
    createdAt: Date;
    founder: { name: string };
    requester: { name: string | null };
  }[];
}) {
  const router = useRouter();
  const currency = useCurrencyStore((s) => s.currency);
  const [founderId, setFounderId] = useState(founders[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!founderId || !amt) return;
    setLoading(true);
    const result = await createWithdrawal({ founderId, amount: amt, notes: notes || undefined });
    setLoading(false);
    if (result.success) {
      setAmount("");
      setNotes("");
      toast.success("Withdrawal requested");
      router.refresh();
    } else toast.error(result.error);
  }

  async function handleStatus(id: string, status: "APPROVED" | "REJECTED") {
    const result = await updateWithdrawalStatus(id, status);
    if (result.success) router.refresh();
    else toast.error(result.error);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Founder Equity (YTD)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span>{FOUNDERS.youssef.name} ({FOUNDERS.youssef.equityPercent}%)</span><span className="font-medium">{formatCurrency(distribution.youssef, currency)}</span></div>
          <div className="flex justify-between text-sm"><span>{FOUNDERS.saif.name} ({FOUNDERS.saif.equityPercent}%)</span><span className="font-medium">{formatCurrency(distribution.saif, currency)}</span></div>
          <div className="flex justify-between text-sm border-t pt-2"><span>Company Reserve (40%)</span><span className="font-medium">{formatCurrency(distribution.companyReserve, currency)}</span></div>
          <div className="flex justify-between text-sm font-semibold"><span>Net Profit</span><span>{formatCurrency(distribution.netProfit, currency)}</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Request Withdrawal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleRequest} className="space-y-3">
            <div className="space-y-1">
              <Label>Founder</Label>
              <select value={founderId} onChange={(e) => setFounderId(e.target.value)} className="h-9 w-full rounded-lg border px-3 text-sm">
                {founders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Amount</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="space-y-1"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <Button type="submit" size="sm" disabled={loading || !amount}>Submit Request</Button>
          </form>
        </CardContent>
      </Card>
      {withdrawals.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Withdrawal Requests</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {withdrawals.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{w.founder.name} — {formatCurrency(Number(w.amount), currency)}</p>
                    <p className="text-xs text-muted-foreground">{w.requester.name ?? "Unknown"} · {formatDate(w.createdAt)}{w.notes ? ` · ${w.notes}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={w.status === "APPROVED" ? "success" : w.status === "REJECTED" ? "destructive" : "secondary"}>{w.status}</Badge>
                    {w.status === "PENDING" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleStatus(w.id, "APPROVED")}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatus(w.id, "REJECTED")}>Reject</Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
