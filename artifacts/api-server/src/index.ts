import app from "./app";
import { logger } from "./lib/logger";
import { startCronJobs } from "./lib/cron";
import { seedDatabase } from "@workspace/db/seed";
import { runMigrations } from "@workspace/db/migrate";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.run(sql`SELECT 1`);
    logger.info("✅ Database connection OK");
    return true;
  } catch (e: any) {
    logger.error(
      {
        error: e?.message,
        tursoUrl: process.env.TURSO_DATABASE_URL
          ? process.env.TURSO_DATABASE_URL.replace(/\/\/.*@/, "//***@").substring(0, 60)
          : "NOT SET",
        tursoTokenSet: !!process.env.TURSO_AUTH_TOKEN,
      },
      "❌ DATABASE CONNECTION FAILED — check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables."
    );
    return false;
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  const dbOk = await testDatabaseConnection();

  if (dbOk) {
    try {
      await runMigrations();
    } catch (e) {
      logger.error({ err: e }, "Database migration failed");
    }

    try {
      await seedDatabase();
    } catch (e) {
      logger.warn({ err: e }, "Seed database failed (non-fatal)");
    }
  }

  startCronJobs();
});
