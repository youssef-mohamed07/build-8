"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FOUNDERS, DEV_PASSWORD } from "@/lib/founders";
import { SKIP_AUTH_COOKIE, isDevAuthEnabled } from "@/lib/skip-auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import type { ActionResult } from "@/types";

async function clearSkipAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SKIP_AUTH_COOKIE);
}

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    await clearSkipAuthCookie();
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function quickLoginAction(
  founder: "youssef" | "saif"
): Promise<ActionResult> {
  if (!isDevAuthEnabled()) {
    return { success: false, error: "Not available in production" };
  }

  const account = FOUNDERS[founder];
  for (const email of account.emails) {
    const result = await loginAction(email, DEV_PASSWORD);
    if (result.success) return result;
  }

  return {
    success: false,
    error: `${account.name} account not found. Run npm run db:seed first.`,
  };
}

export async function skipAuthAction(): Promise<ActionResult> {
  if (!isDevAuthEnabled()) {
    return { success: false, error: "Not available in production" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SKIP_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
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

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
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
