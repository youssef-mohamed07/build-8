"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useCurrencyStore } from "@/stores/currency-store";
import { setCurrencyAction } from "@/server/actions/currency.actions";

export function CurrencySwitcher({ initialCurrency }: { initialCurrency: CurrencyCode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { currency, setCurrency } = useCurrencyStore();

  useEffect(() => {
    if (currency !== initialCurrency) {
      setCurrency(initialCurrency);
    }
  }, [initialCurrency, currency, setCurrency]);

  async function handleSelect(next: CurrencyCode) {
    if (next === currency) {
      setOpen(false);
      return;
    }
    setCurrency(next);
    setOpen(false);
    startTransition(async () => {
      await setCurrencyAction(next);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 px-2"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
      >
        <Coins className="h-4 w-4" />
        <span className="text-xs font-medium">{currency}</span>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border bg-popover p-1 shadow-md">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted ${
                  currency === code ? "bg-muted font-medium" : ""
                }`}
              >
                <span>{code}</span>
                <span className="text-xs text-muted-foreground">{CURRENCIES[code].symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
