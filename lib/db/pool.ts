import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

/**
 * Pooled WebSocket driver — only for interactive transactions.
 *
 * Neon's HTTP driver cannot run `BEGIN ... COMMIT`, so question reordering
 * and other multi-statement writes use this pool instead.
 *
 * In Node 22+ a global WebSocket exists, but pinning `ws` keeps local dev and
 * Vercel's Node runtime deterministic.
 */
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
}

function createPoolDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
    );
  }

  const pool = new Pool({ connectionString: url });

  return { pool, db: drizzle(pool, { schema }) };
}

let instance: ReturnType<typeof createPoolDb> | undefined;

export function getDbPool(): ReturnType<typeof createPoolDb>["db"] {
  if (!instance) {
    instance = createPoolDb();
  }

  return instance.db;
}

/** Close the pool (seed scripts, tests, graceful shutdown). */
export async function closeDbPool(): Promise<void> {
  if (instance) {
    await instance.pool.end();
    instance = undefined;
  }
}
