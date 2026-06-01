import { Router } from "express";
import { db, investmentsTable, plansTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { CreateInvestmentBody } from "@workspace/api-zod";

const router = Router();

function formatInvestment(inv: any, planName: string) {
  const amount = parseFloat(inv.amount);
  const dailyRate = parseFloat(inv.dailyRate);
  return {
    id: inv.id,
    planId: inv.planId,
    planName,
    amount,
    dailyRate,
    durationDays: inv.durationDays,
    startDate: inv.startDate?.toISOString(),
    endDate: inv.endDate?.toISOString(),
    status: inv.status,
    totalEarned: parseFloat(inv.totalEarned ?? "0"),
    dailyEarning: amount * (dailyRate / 100),
  };
}

router.get("/investments", authenticate, async (req, res) => {
  const user = (req as any).user;
  const investments = await db.select().from(investmentsTable)
    .where(eq(investmentsTable.userId, user.id));
  
  const result = await Promise.all(investments.map(async (inv) => {
    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, inv.planId)).limit(1);
    return formatInvestment(inv, plan?.name ?? "Unknown");
  }));
  
  res.json(result);
});

router.post("/investments", authenticate, async (req, res) => {
  const user = (req as any).user;
  const parsed = CreateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const { planId, amount } = parsed.data;

  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, planId)).limit(1);
  if (!plan || !plan.isActive) {
    res.status(400).json({ error: "Plan not found or inactive" });
    return;
  }

  if (amount < parseFloat(plan.minDeposit)) {
    res.status(400).json({ error: `Minimum deposit is ${plan.minDeposit} USDT` });
    return;
  }
  if (plan.maxDeposit && amount > parseFloat(plan.maxDeposit)) {
    res.status(400).json({ error: `Maximum deposit is ${plan.maxDeposit} USDT` });
    return;
  }

  const mainBalance = parseFloat(user.mainBalance ?? "0");
  if (mainBalance < amount) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  const [investment] = await db.insert(investmentsTable).values({
    userId: user.id,
    planId,
    amount: amount.toString(),
    dailyRate: plan.dailyRate,
    durationDays: plan.durationDays,
    startDate,
    endDate,
    status: "active",
    totalEarned: "0",
  }).returning();

  // Deduct from main balance, add to invested
  await db.update(usersTable).set({
    mainBalance: (mainBalance - amount).toString(),
    investedBalance: (parseFloat(user.investedBalance ?? "0") + amount).toString(),
    totalInvested: (parseFloat(user.totalInvested ?? "0") + amount).toString(),
  }).where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "deposit",
    amount: amount.toString(),
    status: "completed",
    description: `Investment in ${plan.name} plan`,
    referenceId: investment.id,
  });

  res.status(201).json(formatInvestment(investment, plan.name));
});

router.get("/investments/:id", authenticate, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(req.params.id);
  const [inv] = await db.select().from(investmentsTable)
    .where(and(eq(investmentsTable.id, id), eq(investmentsTable.userId, user.id))).limit(1);
  if (!inv) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }
  const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, inv.planId)).limit(1);
  res.json(formatInvestment(inv, plan?.name ?? "Unknown"));
});

export default router;
