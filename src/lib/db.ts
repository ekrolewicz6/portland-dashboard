/**
 * Database connection for Portland Civic Lab Dashboard.
 *
 * Uses Drizzle ORM with postgres-js driver.
 */

export { db } from "@/db/index";

/** Flag that downstream routes check to decide mock vs real data. */
export const USE_MOCK = process.env.DATABASE_URL === undefined;

/**
 * Raw query helper — kept for backward compatibility.
 * Prefer using the Drizzle `db` instance directly.
 */
export async function query<T>(_text: string, _params?: unknown[]): Promise<T[]> {
  return [];
}
