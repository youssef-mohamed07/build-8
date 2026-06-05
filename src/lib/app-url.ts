function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalUrl(url: string | undefined): boolean {
  if (!url) return true;
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Resolve the public app URL for Auth.js and client links.
 * On Vercel, ignores localhost values from copied .env files.
 */
export function resolveAppUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL;

  if (explicit && !isLocalUrl(explicit)) {
    return stripTrailingSlash(explicit);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return stripTrailingSlash(explicit ?? "http://localhost:3000");
}

export function syncAuthEnvUrls(): string {
  const appUrl = resolveAppUrl();
  process.env.AUTH_URL = appUrl;
  process.env.NEXTAUTH_URL = appUrl;

  if (isLocalUrl(process.env.NEXT_PUBLIC_APP_URL)) {
    process.env.NEXT_PUBLIC_APP_URL = appUrl;
  }

  return appUrl;
}
