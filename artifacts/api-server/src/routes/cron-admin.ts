import { Router } from "express";
import { requireAdmin } from "../middlewares/authenticate";
import { runDailyProfits } from "../lib/cron";
import { db, investmentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logAdminAction } from "../lib/admin-log";

const router = Router();

// Manual trigger for daily profits (admin only)
router.post("/admin/cron/run-profits", requireAdmin, async (req, res) => {
  try {
    await runDailyProfits();
    await logAdminAction(req, "manual_run_daily_profits", undefined, undefined, "Triggered manually");
    res.json({ success: true, message: "Profits journaliers crédités avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cron status: list active investments with next payout info
router.get("/admin/cron/status", requireAdmin, async (req, res) => {
  const active = await db.select().from(investmentsTable)
    .where(eq(investmentsTable.status, "active"));

  const total = active.length;
  const totalDailyPayout = active.reduce((sum, inv) => {
    return sum + parseFloat(inv.amount) * parseFloat(inv.dailyRate) / 100;
  }, 0);

  const byPlan: Record<number, { count: number; daily: number }> = {};
  for (const inv of active) {
    if (!byPlan[inv.planId]) byPlan[inv.planId] = { count: 0, daily: 0 };
    byPlan[inv.planId].count++;
    byPlan[inv.planId].daily += parseFloat(inv.amount) * parseFloat(inv.dailyRate) / 100;
  }

  const expiringSoon = active.filter(inv => {
    if (!inv.endDate) return false;
    const daysLeft = (new Date(inv.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 3;
  }).length;

  const lastRun = active.reduce((latest, inv) => {
    if (!inv.lastProfitAt) return latest;
    const d = new Date(inv.lastProfitAt);
    return d > latest ? d : latest;
  }, new Date(0));

  res.json({
    activeInvestments: total,
    totalDailyPayout: parseFloat(totalDailyPayout.toFixed(4)),
    byPlan,
    expiringSoon,
    lastRunAt: lastRun.getTime() === 0 ? null : lastRun.toISOString(),
    nextRunAt: (() => {
      const next = new Date();
      next.setDate(next.getDate() + 1);
      next.setHours(0, 1, 0, 0);
      return next.toISOString();
    })(),
  });
});

export default router;
