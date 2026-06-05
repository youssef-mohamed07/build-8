import { cookies } from "next/headers";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { FOUNDERS } from "@/lib/founders";

export const SKIP_AUTH_COOKIE = "build8_skip_auth";

export function isDevAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function isEnvSkipEnabled(): boolean {
  return (
    process.env.SKIP_AUTH === "true" ||
    process.env.NEXT_PUBLIC_SKIP_AUTH === "true"
  );
}

export function isAuthSkippedFromCookie(cookieValue?: string): boolean {
  if (isEnvSkipEnabled()) return true;
  return cookieValue === "1";
}

export async function isAuthSkipped(): Promise<boolean> {
  if (isEnvSkipEnabled()) return true;
  const cookieStore = await cookies();
  return cookieStore.get(SKIP_AUTH_COOKIE)?.value === "1";
}

export function getDevSessionUser() {
  return {
    id: "dev",
    name: FOUNDERS.youssef.name,
    email: FOUNDERS.youssef.primaryEmail,
    image: null,
    role: "founder",
  };
}

export const devPermissions = Object.values(PERMISSIONS);
