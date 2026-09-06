import { defineConfig } from "drizzle-kit";
import { requireDatabaseUrl } from "./ingest/lib/db-url";

export default defineConfig({
  out: "./src/db/introspected",
  dialect: "postgresql",
  dbCredentials: {
    url: requireDatabaseUrl(),
  },
  schemaFilter: [
    "public", "safety", "housing", "homelessness", "education", "economy",
    "environment", "transportation", "quality", "accountability", "business",
    "downtown", "migration", "fiscal", "content", "performance", "reference",
    "real_estate",
  ],
});
