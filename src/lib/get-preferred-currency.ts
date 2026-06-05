import { cookies } from "next/headers";
import { cache } from "react";
import { CURRENCY_COOKIE, isCurrencyCode, type CurrencyCode } from "@/lib/currency";

export const getPreferredCurrency = cache(async (): Promise<CurrencyCode> => {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value;
  return isCurrencyCode(value) ? value : "USD";
});
