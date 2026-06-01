import { Router } from "express";
import { db, usersTable, investmentsTable, transactionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/dashboard/summary", authenticate, async (req, res) => {
  const user = (req as any).user;

  const activeInvestments = await db.select().from(investmentsTable)
    .where(eq(investmentsTable.userId, user.id));
  const active = activeInvestments.filter(i => i.status === "active");

  const referrals = await db.select().from(usersTable)
    .where(eq(usersTable.referredById, user.id));

  res.json({
    mainBalance: parseFloat(user.mainBalance ?? "0"),
    investedBalance: parseFloat(user.investedBalance ?? "0"),
    totalEarnings: parseFloat(user.totalEarnings ?? "0"),
    bonusBalance: parseFloat(user.bonusBalance ?? "0"),
    totalDeposited: parseFloat(user.totalDeposited ?? "0"),
    totalWithdrawn: parseFloat(user.totalWithdrawn ?? "0"),
    dailyEarnings: parseFloat(user.dailyEarnings ?? "0"),
    activeInvestments: active.length,
    referralCount: referrals.length,
    vipLevel: user.vipLevel ?? 0,
    kycStatus: user.kycStatus ?? "none",
  });
});

router.get("/dashboard/earnings-history", authenticate, async (req, res) => {
  const user = (req as any).user;
  
  // Generate last 30 days of earnings data
  const investments = await db.select().from(investmentsTable)
    .where(eq(investmentsTable.userId, user.id));

  const history: { date: string; amount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    
    let dayEarnings = 0;
    for (const inv of investments) {
      if (inv.status === "active" || inv.status === "completed") {
        const startDate = new Date(inv.startDate);
        const endDate = new Date(inv.endDate);
        if (date >= startDate && date <= endDate) {
          dayEarnings += parseFloat(inv.amount) * (parseFloat(inv.dailyRate) / 100);
        }
      }
    }
    history.push({ date: dateStr, amount: Math.round(dayEarnings * 100) / 100 });
  }

  res.json(history);
});

router.get("/dashboard/recent-activity", authenticate, async (req, res) => {
  const user = (req as any).user;
  const transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, user.id))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(10);

  res.json(transactions.map(t => ({
    id: t.id,
    type: t.type,
    amount: parseFloat(t.amount),
    description: t.description ?? t.type,
    createdAt: t.createdAt?.toISOString(),
  })));
});

router.get("/users/wallet", authenticate, async (req, res) => {
  const user = (req as any).user;
  const investments = await db.select().from(investmentsTable)
    .where(eq(investmentsTable.userId, user.id));
  const active = investments.filter(i => i.status === "active");
  const dailyEarnings = active.reduce((sum, inv) => {
    return sum + parseFloat(inv.amount) * (parseFloat(inv.dailyRate) / 100);
  }, 0);

  res.json({
    mainBalance: parseFloat(user.mainBalance ?? "0"),
    investedBalance: parseFloat(user.investedBalance ?? "0"),
    totalEarnings: parseFloat(user.totalEarnings ?? "0"),
    bonusBalance: parseFloat(user.bonusBalance ?? "0"),
    totalDeposited: parseFloat(user.totalDeposited ?? "0"),
    totalWithdrawn: parseFloat(user.totalWithdrawn ?? "0"),
    dailyEarnings: Math.round(dailyEarnings * 100) / 100,
  });
});

router.get("/users/transactions", authenticate, async (req, res) => {
  const user = (req as any).user;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const total = await db.select({ count: sql<number>`COUNT(*)` })
    .from(transactionsTable).where(eq(transactionsTable.userId, user.id));
  
  const txs = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, user.id))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit).offset(offset);

  res.json({
    data: txs.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      status: t.status,
      description: t.description,
      createdAt: t.createdAt?.toISOString(),
    })),
    total: Number(total[0]?.count ?? 0),
    page,
    limit,
  });
});

router.patch("/users/profile", authenticate, async (req, res) => {
  const user = (req as any).user;
  const { firstName, lastName, phone, city, walletAddress } = req.body;
  
  const [updated] = await db.update(usersTable).set({
    firstName: firstName ?? user.firstName,
    lastName: lastName ?? user.lastName,
    phone: phone ?? user.phone,
    city: city ?? user.city,
    walletAddress: walletAddress ?? user.walletAddress,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, user.id)).returning();

  const { passwordHash: _, ...safeUser } = updated;
  res.json({ ...safeUser, createdAt: safeUser.createdAt?.toISOString() });
});

export default router;
