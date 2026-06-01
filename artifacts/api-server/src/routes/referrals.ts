import { Router } from "express";
import { db, usersTable, commissionsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/referrals", authenticate, async (req, res) => {
  const user = (req as any).user;

  // Level 1 referrals
  const level1 = await db.select().from(usersTable)
    .where(eq(usersTable.referredById, user.id));

  // Level 2 referrals
  const level2Users: any[] = [];
  for (const l1 of level1) {
    const l2 = await db.select().from(usersTable).where(eq(usersTable.referredById, l1.id));
    level2Users.push(...l2);
  }

  // Level 3 referrals
  const level3Users: any[] = [];
  for (const l2 of level2Users) {
    const l3 = await db.select().from(usersTable).where(eq(usersTable.referredById, l2.id));
    level3Users.push(...l3);
  }

  const totalCommissions = await db.select({
    total: sql<number>`COALESCE(SUM(CAST(${commissionsTable.amount} AS DECIMAL)), 0)`,
  }).from(commissionsTable).where(eq(commissionsTable.userId, user.id));

  const referralLink = `https://investpro.app/register?ref=${user.referralCode}`;
  const activeReferrals = level1.filter(u => u.status === "active").length;

  const allReferrals = [
    ...level1.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      level: 1,
      status: u.status,
      joinedAt: u.createdAt?.toISOString(),
      totalInvested: parseFloat(u.totalInvested ?? "0"),
    })),
    ...level2Users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      level: 2,
      status: u.status,
      joinedAt: u.createdAt?.toISOString(),
      totalInvested: parseFloat(u.totalInvested ?? "0"),
    })),
    ...level3Users.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      level: 3,
      status: u.status,
      joinedAt: u.createdAt?.toISOString(),
      totalInvested: parseFloat(u.totalInvested ?? "0"),
    })),
  ];

  res.json({
    referralCode: user.referralCode,
    referralLink,
    totalReferrals: allReferrals.length,
    activeReferrals,
    totalCommissions: Number(totalCommissions[0]?.total ?? 0),
    level1Count: level1.length,
    level2Count: level2Users.length,
    level3Count: level3Users.length,
    referrals: allReferrals,
  });
});

router.get("/referrals/commissions", authenticate, async (req, res) => {
  const user = (req as any).user;
  const commissions = await db.select().from(commissionsTable)
    .where(eq(commissionsTable.userId, user.id))
    .orderBy(desc(commissionsTable.createdAt))
    .limit(50);

  const result = await Promise.all(commissions.map(async (c) => {
    const [fromUser] = await db.select().from(usersTable).where(eq(usersTable.id, c.fromUserId)).limit(1);
    return {
      id: c.id,
      amount: parseFloat(c.amount),
      level: c.level,
      fromUser: fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : "Unknown",
      createdAt: c.createdAt?.toISOString(),
    };
  }));

  res.json(result);
});

router.get("/referrals/leaderboard", async (req, res) => {
  const users = await db.select().from(usersTable).limit(20);

  const withCounts = await Promise.all(users.map(async (u) => {
    const refs = await db.select().from(usersTable).where(eq(usersTable.referredById, u.id));
    const commTotal = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${commissionsTable.amount} AS DECIMAL)), 0)`,
    }).from(commissionsTable).where(eq(commissionsTable.userId, u.id));
    return {
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      referralCount: refs.length,
      totalCommissions: Number(commTotal[0]?.total ?? 0),
    };
  }));

  const sorted = withCounts.sort((a, b) => b.referralCount - a.referralCount).slice(0, 10);
  res.json(sorted.map((u, i) => ({ ...u, rank: i + 1 })));
});

export default router;
