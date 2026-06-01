import { Router } from "express";
import { db, plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function formatPlan(plan: any) {
  let features: string[] = [];
  try {
    features = JSON.parse(plan.features || "[]");
  } catch {
    features = [];
  }
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    minDeposit: parseFloat(plan.minDeposit),
    maxDeposit: plan.maxDeposit ? parseFloat(plan.maxDeposit) : null,
    dailyRate: parseFloat(plan.dailyRate),
    durationDays: plan.durationDays,
    isActive: plan.isActive,
    features,
  };
}

router.get("/plans", async (req, res) => {
  const plans = await db.select().from(plansTable).where(eq(plansTable.isActive, true));
  res.json(plans.map(formatPlan));
});

router.get("/plans/:id", async (req, res) => {
  const id = parseInt(String(req.params.id));
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, id)).limit(1);
  if (!plan) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  res.json(formatPlan(plan));
});

export default router;
