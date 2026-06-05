import type { NextConfig } from "next";
import { resolveAppUrl } from "./src/lib/app-url";

const appUrl = resolveAppUrl();

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    AUTH_URL: appUrl,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL &&
      !/localhost|127\.0\.0\.1/i.test(process.env.NEXT_PUBLIC_APP_URL)
        ? process.env.NEXT_PUBLIC_APP_URL
        : appUrl,
    NEXT_PUBLIC_SKIP_AUTH: process.env.NEXT_PUBLIC_SKIP_AUTH ?? process.env.SKIP_AUTH ?? "false",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
