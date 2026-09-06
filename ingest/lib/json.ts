/**
 * Any value a JSON API can hand back. Narrower than `unknown` — it says the
 * value round-trips through JSON.stringify — while still forcing a check
 * before anything is read out of it.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
