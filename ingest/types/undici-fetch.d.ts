/**
 * Node's global `fetch` is undici's, whose `RequestInit` omits the `cache`
 * hint that the WHATWG/browser signature carries. Several ingest scripts —
 * and the app-side helpers a couple of them reuse — pass `cache: "no-store"`
 * to say "never serve this from a cache"; undici accepts and ignores it.
 * Declaring the member keeps those call sites honest under the Node lib
 * instead of forcing the whole project onto the DOM lib, which would also
 * swap `Response.json(): Promise<unknown>` for a `Promise<any>`.
 */
declare module "undici-types" {
  interface RequestInit {
    cache?:
      | "default"
      | "force-cache"
      | "no-cache"
      | "no-store"
      | "only-if-cached"
      | "reload";
  }
}

export {};
