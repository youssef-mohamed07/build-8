"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FOUNDERS, DEV_PASSWORD } from "@/lib/founders";
import { SKIP_AUTH_COOKIE } from "@/lib/skip-auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import type { ActionResult } from "@/types";

async function clearSkipAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SKIP_AUTH_COOKIE);
}

function loginErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return "Invalid email or password";
  }

  const message = error instanceof Error ? error.message : "";
  if (/secret|configuration|AUTH_URL/i.test(message)) {
    return "Auth is not configured on the server. Set AUTH_SECRET on Vercel.";
  }

  if (/database|prisma|connect/i.test(message)) {
    return "Database connection failed. Check DATABASE_URL on Vercel.";
  }

  return "Sign in failed. Try Skip auth or check server environment variables.";
}

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    if (!process.env.AUTH_SECRET) {
      return {
        success: false,
        error: "AUTH_SECRET is missing. Add it in Vercel → Settings → Environment Variables.",
      };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    await clearSkipAuthCookie();
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[loginAction]", error);
    return { success: false, error: loginErrorMessage(error) };
  }
}

async function signInFounder(founder: "youssef" | "saif"): Promise<ActionResult> {
  const account = FOUNDERS[founder];
  for (const email of account.emails) {
    const result = await loginAction(email, DEV_PASSWORD);
    if (result.success) return result;
  }

  return {
    success: false,
    error: `${account.name} not found in this database. Run npm run db:setup locally using the same DATABASE_URL as Vercel, then check https://system.build8.dev/api/health`,
  };
}

export async function quickLoginAction(
  account: "youssef" | "saif" | "test"
): Promise<ActionResult> {
  if (account === "test") {
    return loginAction("test@build8.com", DEV_PASSWORD);
  }
  return signInFounder(account);
}

export async function skipAuthAction(): Promise<ActionResult> {
  try {
    const loginResult = await signInFounder("youssef");
    if (loginResult.success) return loginResult;
  } catch (error) {
    console.error("[skipAuthAction] founder login failed", error);
  }

  const cookieStore = await cookies();
  cookieStore.set(SKIP_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, data: undefined };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SKIP_AUTH_COOKIE);
  await signOut({ redirectTo: "/login" });
}

export async function forgotPasswordAction(
  email: string
): Promise<ActionResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether email exists
    return { success: true, data: undefined };
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const { resolveAppUrl } = await import("@/lib/app-url");
  const resetUrl = `${resolveAppUrl()}/reset-password?token=${token}`;
  if (process.env.NODE_ENV === "development") {
    console.log(`[dev] Password reset link for ${email}: ${resetUrl}`);
  }

  return { success: true, data: undefined };
}

export async function resetPasswordAction(
  token: string,
  password: string
): Promise<ActionResult> {
  const resetToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: resetToken.identifier },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return { success: true, data: undefined };
}
