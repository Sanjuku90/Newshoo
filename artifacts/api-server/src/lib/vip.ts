import { db, usersTable, leaderBonusesTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export function computeVipLevel(totalInvested: number): number {
  if (totalInvested >= 25000) return 5;
  if (totalInvested >= 10000) return 4;
  if (totalInvested >= 5000) return 3;
  if (totalInvested >= 2000) return 2;
  if (totalInvested >= 500) return 1;
  return 0;
}

const LEADER_MILESTONES: { count: number; bonus: number }[] = [
  { count: 10, bonus: 25 },
  { count: 50, bonus: 150 },
  { count: 100, bonus: 500 },
  { count: 500, bonus: 5000 },
];

export async function updateVipLevel(userId: number, totalInvested: number) {
  const newVip = computeVipLevel(totalInvested);
  await db.update(usersTable)
    .set({ vipLevel: newVip, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
}

export async function checkAndAwardLeaderBonuses(referrerId: number) {
  const level1 = await db.select().from(usersTable)
    .where(eq(usersTable.referredById, referrerId));
  const activeCount = level1.filter(u => u.status === "active" && parseFloat(u.totalInvested ?? "0") > 0).length;

  for (const milestone of LEADER_MILESTONES) {
    if (activeCount >= milestone.count) {
      const existing = await db.select().from(leaderBonusesTable)
        .where(and(
          eq(leaderBonusesTable.userId, referrerId),
          eq(leaderBonusesTable.milestone, milestone.count)
        )).limit(1);

      if (existing.length === 0) {
        await db.insert(leaderBonusesTable).values({
          userId: referrerId,
          milestone: milestone.count,
          amount: milestone.bonus.toString(),
          status: "awarded",
        });

        const [referrer] = await db.select().from(usersTable)
          .where(eq(usersTable.id, referrerId)).limit(1);
        if (referrer) {
          await db.update(usersTable).set({
            bonusBalance: (parseFloat(referrer.bonusBalance ?? "0") + milestone.bonus).toString(),
            updatedAt: new Date(),
          }).where(eq(usersTable.id, referrerId));

          await db.insert(transactionsTable).values({
            userId: referrerId,
            type: "leader_bonus",
            amount: milestone.bonus.toString(),
            status: "completed",
            description: `Leader bonus: ${milestone.count} active referrals`,
          });
        }
      }
    }
  }
}
