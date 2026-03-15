/**
 * Database connection helper for Portland Commons Dashboard.
 *
 * Currently returns mock data. When ready to connect to PostgreSQL,
 * install `pg` and uncomment the pool configuration below.
 *
 * Usage:
 *   const rows = await query<MyType>("SELECT * FROM table WHERE id = $1", [id]);
 */

// ---- Uncomment when PostgreSQL is ready ----
// import { Pool, QueryResult } from "pg";
//
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === "production"
//     ? { rejectUnauthorized: false }
//     : undefined,
//   max: 10,
//   idleTimeoutMillis: 30_000,
//   connectionTimeoutMillis: 5_000,
// });
//
// export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
//   const result: QueryResult<T> = await pool.query(text, params);
//   return result.rows;
// }
//
// export async function getClient() {
//   return pool.connect();
// }
//
// export default pool;

/** Flag that downstream routes check to decide mock vs real data. */
export const USE_MOCK = process.env.DATABASE_URL === undefined;

/**
 * Placeholder query function — returns an empty array when no DB is configured.
 * Replace with the real implementation above once pg is installed.
 */
export async function query<T>(_text: string, _params?: unknown[]): Promise<T[]> {
  return [];
}
