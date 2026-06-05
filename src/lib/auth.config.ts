import type { NextAuthConfig } from "next-auth";
import { isAuthSkippedFromCookie } from "@/lib/skip-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl, cookies } }) {
      if (isAuthSkippedFromCookie(cookies.get("build8_skip_auth")?.value)) {
        return true;
      }

      const isLoggedIn = !!auth?.user;
      const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
      const isPublicRoute = publicRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (isPublicRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        const callback = nextUrl.pathname + nextUrl.search;
        if (callback && callback !== "/") {
          loginUrl.searchParams.set("callbackUrl", callback);
        }
        return Response.redirect(loginUrl);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
