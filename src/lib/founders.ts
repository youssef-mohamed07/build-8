export const DEV_PASSWORD = "Build8@2026";

export const FOUNDERS = {
  youssef: {
    name: "Youssef",
    displayName: "يوسف",
    emails: ["youssef@build8.com", "founder-a@build8.com"],
    primaryEmail: "youssef@build8.com",
    equityPercent: 30,
  },
  saif: {
    name: "Saif",
    displayName: "سيف",
    emails: ["saif@build8.com", "founder-b@build8.com"],
    primaryEmail: "saif@build8.com",
    equityPercent: 30,
  },
} as const;

export const COMPANY_RESERVE_PERCENT = 40;

export function getFounderDisplayName(email: string, fallback?: string | null): string {
  if ((FOUNDERS.youssef.emails as readonly string[]).includes(email)) return FOUNDERS.youssef.name;
  if ((FOUNDERS.saif.emails as readonly string[]).includes(email)) return FOUNDERS.saif.name;
  return fallback ?? email;
}
