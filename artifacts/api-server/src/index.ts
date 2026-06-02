import app from "./app";
import { logger } from "./lib/logger";
import { startCronJobs } from "./lib/cron";
import { seedDatabase } from "@workspace/db/seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  try {
    await seedDatabase();
  } catch (e) {
    logger.warn({ err: e }, "Seed database failed (non-fatal)");
  }

  startCronJobs();
  startKeepAlive(port);
});

function startKeepAlive(port: number): void {
  const externalUrl = process.env["RENDER_EXTERNAL_URL"];
  if (!externalUrl) return;

  const pingUrl = `${externalUrl}/api/healthz`;
  const INTERVAL_MS = 14 * 60 * 1000;

  setInterval(async () => {
    try {
      const res = await fetch(pingUrl);
      logger.info({ status: res.status }, "Keep-alive ping sent");
    } catch (err) {
      logger.warn({ err }, "Keep-alive ping failed");
    }
  }, INTERVAL_MS);

  logger.info({ pingUrl, intervalMinutes: 14 }, "Keep-alive started");
}
