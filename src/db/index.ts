import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const isPooled = (connectionString ?? "").includes("pooler.supabase.com");

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

const explicitOpts = isPooled ? parseConnectionOptions(connectionString) : undefined;

const client = explicitOpts
  ? postgres({ ...explicitOpts, prepare: false })
  : postgres(connectionString);

export const db = drizzle(client, { schema });
