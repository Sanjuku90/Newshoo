import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/health", async (_req, res) => {
  let dbStatus = "ok";
  let dbError: string | null = null;
  try {
    await db.run(sql`SELECT 1`);
  } catch (e: any) {
    dbStatus = "error";
    dbError = e?.message || "Unknown database error";
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL || "NOT SET";
  const tursoTokenSet = !!process.env.TURSO_AUTH_TOKEN;

  res.status(dbStatus === "ok" ? 200 : 503).json({
    status: dbStatus === "ok" ? "ok" : "degraded",
    database: {
      status: dbStatus,
      error: dbError,
      url: tursoUrl.substring(0, 40) + (tursoUrl.length > 40 ? "..." : ""),
      tokenConfigured: tursoTokenSet,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
