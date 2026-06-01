import { Router } from "express";
import { db, investmentsTable, plansTable, usersTable, transactionsTable, commissionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { CreateInvestmentBody } from "@workspace/api-zod";
import { updateVipLevel, checkAndAwardLeaderBonuses } from "../lib/vip";

const router = Router();

const COMMISSION_RATES = [0.10, 0.05, 0.02];

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

  const newTotalInvested = parseFloat(user.totalInvested ?? "0") + amount;

  await db.update(usersTable).set({
    mainBalance: (mainBalance - amount).toString(),
    investedBalance: (parseFloat(user.investedBalance ?? "0") + amount).toString(),
    totalInvested: newTotalInvested.toString(),
    updatedAt: new Date(),
  }).where(eq(usersTable.id, user.id));

  await updateVipLevel(user.id, newTotalInvested);

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "investment",
    amount: amount.toString(),
    status: "completed",
    description: `Investment in ${plan.name} plan`,
    referenceId: investment.id,
  });

  // Pay referral commissions (3 levels)
  let currentUserId = user.referredById;
  for (let level = 1; level <= 3 && currentUserId; level++) {
    const [referrer] = await db.select().from(usersTable)
      .where(eq(usersTable.id, currentUserId)).limit(1);
    if (!referrer) break;

    const commAmount = amount * COMMISSION_RATES[level - 1];

    await db.insert(commissionsTable).values({
      userId: referrer.id,
      fromUserId: user.id,
      investmentId: investment.id,
      level,
      amount: commAmount.toString(),
      status: "completed",
    });

    await db.update(usersTable).set({
      bonusBalance: (parseFloat(referrer.bonusBalance ?? "0") + commAmount).toString(),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, referrer.id));

    await db.insert(transactionsTable).values({
      userId: referrer.id,
      type: "commission",
      amount: commAmount.toString(),
      status: "completed",
      description: `Level ${level} commission from ${user.firstName} ${user.lastName}`,
    });

    await checkAndAwardLeaderBonuses(referrer.id);

    currentUserId = referrer.referredById;
  }

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
