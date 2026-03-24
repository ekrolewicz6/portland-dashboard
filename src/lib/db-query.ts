import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL ||
  "postgresql://edankrolewicz@localhost:5432/portland_dashboard";
const isPooled = databaseUrl.includes("pooler.supabase.com");

// Parse connection string explicitly to avoid URL parser issues with special
// characters in passwords (e.g. * getting misinterpreted)
function parseConnectionOptions(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 5432,
      database: parsed.pathname.slice(1) || "postgres",
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: "prefer" as const,
    };
  } catch {
    return undefined;
  }
}

const explicitOpts = isPooled ? parseConnectionOptions(databaseUrl) : undefined;

if (explicitOpts) {
  console.log(`[db] Connecting to Supabase pooler: ${explicitOpts.host}:${explicitOpts.port}/${explicitOpts.database} (user: ${explicitOpts.username})`);
} else {
  // Mask password in log
  const safeUrl = databaseUrl.replace(/:([^@]+)@/, ":***@");
  console.log(`[db] Connecting via URL: ${safeUrl}`);
}

const sql = explicitOpts
  ? postgres({
      ...explicitOpts,
      prepare: false,
      onnotice: () => {}, // suppress NOTICE messages
    })
  : postgres(databaseUrl);

export default sql;

/**
 * Check the dashboard_cache table for a cached response.
 * Returns the cached data if found and updated within the last hour, otherwise null.
 */
export async function getCachedData<T>(question: string): Promise<T | null> {
  try {
    const rows = await sql`
      SELECT data, updated_at
      FROM public.dashboard_cache
      WHERE question = ${question}
    `;
    if (rows.length === 0) return null;

    const row = rows[0];
    const updatedAt = new Date(row.updated_at as string);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (updatedAt < oneHourAgo) return null;

    return row.data as T;
  } catch {
    return null;
  }
}

/**
 * Store computed data in the dashboard_cache table.
 * Refuses to cache responses that look like error/empty states.
 */
export async function setCachedData(
  question: string,
  data: unknown,
): Promise<void> {
  // Don't cache error responses — they'll poison the cache
  const d = data as Record<string, unknown> | null;
  if (!d || d.dataStatus === "unavailable" || (!d.headline && !d.dataAvailable)) {
    return;
  }
  try {
    await sql`
      INSERT INTO public.dashboard_cache (question, data, updated_at)
      VALUES (${question}, ${JSON.stringify(data)}::jsonb, NOW())
      ON CONFLICT (question)
      DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, updated_at = NOW()
    `;
  } catch {
    // Silently ignore cache write failures
  }
}
