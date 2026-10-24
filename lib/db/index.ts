import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * HTTP driver — used for simple reads and single writes.
 *
 * The client is created lazily so `next build` can run without DATABASE_URL.
 * Never use this connection for interactive transactions; use `getDbPool()`
 * from `lib/db/pool.ts` for those.
 */
function createDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
    );
  }

  return drizzle(neon(url), { schema });
}

let instance: ReturnType<typeof createDb> | undefined;

export function getDb(): ReturnType<typeof createDb> {
  if (!instance) {
    instance = createDb();
  }

  return instance;
}

export type Database = ReturnType<typeof createDb>;

/**
 * Convenience export for callers that expect `db` directly. Property access
 * is lazy, so importing this module does not open a connection.
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[property];

    return typeof value === "function" ? value.bind(real) : value;
  },
});
