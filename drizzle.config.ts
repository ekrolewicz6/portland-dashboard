import { defineConfig } from "drizzle-kit";
import { requireDatabaseUrl } from "./ingest/lib/db-url";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Resolved at config load: drizzle-kit generates and applies migrations, so
    // it must never silently target anything but the database DATABASE_URL names.
    url: requireDatabaseUrl(),
  },
});
