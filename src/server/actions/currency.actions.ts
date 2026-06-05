"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CURRENCY_COOKIE, isCurrencyCode, type CurrencyCode } from "@/lib/currency";
import type { ActionResult } from "@/types";

export async function setCurrencyAction(currency: CurrencyCode): Promise<ActionResult> {
  if (!isCurrencyCode(currency)) {
    return { success: false, error: "Invalid currency" };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENCY_COOKIE, currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { success: true, data: undefined };
}
