import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const isPooled = (connectionString ?? "").includes("pooler.supabase.com");

const client = postgres(connectionString, {
  ...(isPooled ? { prepare: false } : {}),
});

export const db = drizzle(client, { schema });
