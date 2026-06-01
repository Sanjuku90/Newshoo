import cron from "node-cron";
import { db, investmentsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, lte } from "drizzle-orm";
import { logger } from "./logger";

export async function runDailyProfits() {
  logger.info("Starting daily profit crediting...");
  const now = new Date();

  // Fetch all active investments
  const activeInvestments = await db.select().from(investmentsTable)
    .where(eq(investmentsTable.status, "active"));

  let credited = 0;
  let expired = 0;

  for (const inv of activeInvestments) {
    const endDate = inv.endDate ? new Date(inv.endDate) : null;
    const isExpired = endDate && now >= endDate;

    const amount = parseFloat(inv.amount);
    const dailyRate = parseFloat(inv.dailyRate);
    const dailyProfit = parseFloat((amount * dailyRate / 100).toFixed(6));

    // Credit the daily profit
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.id, inv.userId)).limit(1);

    if (!user) continue;

    const newMainBalance = parseFloat(user.mainBalance ?? "0") + dailyProfit;
    const newTotalEarnings = parseFloat(user.totalEarnings ?? "0") + dailyProfit;
    const newInvTotalEarned = parseFloat(inv.totalEarned ?? "0") + dailyProfit;

    await db.update(usersTable).set({
      mainBalance: newMainBalance.toFixed(6),
      totalEarnings: newTotalEarnings.toFixed(6),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, inv.userId));

    await db.update(investmentsTable).set({
      totalEarned: newInvTotalEarned.toFixed(6),
      lastProfitAt: new Date(),
    }).where(eq(investmentsTable.id, inv.id));

    await db.insert(transactionsTable).values({
      userId: inv.userId,
      type: "profit",
      amount: dailyProfit.toFixed(6),
      status: "completed",
      description: `Profit journalier — plan ${inv.planId} (${dailyRate}%/j)`,
      referenceId: inv.id,
    });

    credited++;

    // Mark as completed if expired
    if (isExpired) {
      // Return principal to main balance
      const updatedUser = await db.select().from(usersTable)
        .where(eq(usersTable.id, inv.userId)).limit(1);
      if (updatedUser[0]) {
        const balanceAfterReturn = parseFloat(updatedUser[0].mainBalance ?? "0") + amount;
        const newInvested = Math.max(0, parseFloat(updatedUser[0].investedBalance ?? "0") - amount);

        await db.update(usersTable).set({
          mainBalance: balanceAfterReturn.toFixed(6),
          investedBalance: newInvested.toFixed(6),
          updatedAt: new Date(),
        }).where(eq(usersTable.id, inv.userId));

        await db.insert(transactionsTable).values({
          userId: inv.userId,
          type: "investment_return",
          amount: amount.toFixed(2),
          status: "completed",
          description: `Remboursement capital — fin d'investissement`,
          referenceId: inv.id,
        });
      }

      await db.update(investmentsTable).set({
        status: "completed",
      }).where(eq(investmentsTable.id, inv.id));

      expired++;
      logger.info({ investmentId: inv.id, userId: inv.userId }, "Investment completed, principal returned");
    }
  }

  logger.info({ credited, expired }, "Daily profit crediting complete");
}

export function startCronJobs() {
  // Run every day at 00:01 server time
  cron.schedule("1 0 * * *", async () => {
    try {
      await runDailyProfits();
    } catch (err) {
      logger.error({ err }, "Cron job runDailyProfits failed");
    }
  });

  logger.info("Cron jobs scheduled (daily profits at 00:01)");
}
