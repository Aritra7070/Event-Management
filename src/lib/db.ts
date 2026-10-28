import postgres from "postgres";

export const sql = postgres(
  process.env.DATABASE_URL ||
    "postgres://placeholder:placeholder@localhost:5432/placeholder",
  {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  }
);

export function ensureDb() {
  if (!process.env.DATABASE_URL)
    throw new Error(
      "DATABASE_URL missing. Configure Neon and run db/schema.sql."
    );
}