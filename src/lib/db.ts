export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return (
    url.length > 0 &&
    !url.includes("[YOUR-PASSWORD]") &&
    !url.includes("[password]") &&
    !url.includes("[PASSWORD]")
  );
}

export async function safeQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await query();
  } catch {
    return fallback;
  }
}
