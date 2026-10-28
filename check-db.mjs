
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing.");
  console.error("Run this script with --env-file=.env.local");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  connect_timeout: 10,
  idle_timeout: 5,
  ssl: "require",
});

try {
  // Test the connection without modifying the database.
  const result = await sql`
    SELECT current_database() AS database_name,
           current_user AS database_user,
           NOW() AS server_time
  `;

  console.log("✅ Neon PostgreSQL connection successful!");
  console.log("Database:", result[0].database_name);
  console.log("Server time:", result[0].server_time);

  // Inspect existing tables without changing them.
  const tables = await sql`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name
  `;

  if (tables.length === 0) {
    console.log("\n⚠️ No application tables found yet.");
  } else {
    console.log("\nExisting database tables:");
    for (const table of tables) {
      console.log(`${table.table_schema}.${table.table_name}`);
    }
  }
} catch (error) {
  console.error("❌ Database connection or inspection failed.");
  console.error("Error:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
