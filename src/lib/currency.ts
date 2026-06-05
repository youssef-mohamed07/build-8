export type CurrencyCode = "USD" | "EGP";

export const CURRENCY_COOKIE = "build8_currency";

/** Amounts in the database are stored in USD. */
export const USD_TO_EGP_RATE = 48.5;

export const CURRENCIES: Record<
  CurrencyCode,
  { label: string; symbol: string; locale: string }
> = {
  USD: { label: "US Dollar", symbol: "$", locale: "en-US" },
  EGP: { label: "Egyptian Pound", symbol: "E£", locale: "ar-EG" },
};

export function convertAmount(amount: number, to: CurrencyCode): number {
  if (to === "USD") return amount;
  return amount * USD_TO_EGP_RATE;
}

export function formatCurrency(
  amount: number | string,
  currency: CurrencyCode = "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const value = convertAmount(num, currency);
  const { locale } = CURRENCIES[currency];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "EGP" ? 0 : 2,
  }).format(value);
}

export function isCurrencyCode(value: string | undefined): value is CurrencyCode {
  return value === "USD" || value === "EGP";
}
