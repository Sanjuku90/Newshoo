import { Router } from "express";
import { db, withdrawalsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { CreateWithdrawalBody } from "@workspace/api-zod";
import { getSetting } from "../lib/settings";

const router = Router();

function formatWithdrawal(w: any) {
  return {
    id: w.id,
    amount: parseFloat(w.amount),
    fee: parseFloat(w.fee ?? "0"),
    netAmount: parseFloat(w.netAmount),
    status: w.status,
    walletAddress: w.walletAddress,
    rejectionReason: w.rejectionReason,
    createdAt: w.createdAt?.toISOString(),
  };
}

router.get("/withdrawals", authenticate, async (req, res) => {
  const user = (req as any).user;
  const withdrawals = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, user.id));
  res.json(withdrawals.map(formatWithdrawal));
});

router.post("/withdrawals", authenticate, async (req, res) => {
  const user = (req as any).user;
  const coerced = { ...req.body, amount: parseFloat(req.body.amount) };
  const parsed = CreateWithdrawalBody.safeParse(coerced);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues.map((i: any) => i.message).join(", ") }); return; }

  const { amount, walletAddress } = parsed.data;
  const minWithdrawal = parseFloat(await getSetting("min_withdrawal"));
  const feeRate = parseFloat(await getSetting("withdrawal_fee_rate")) / 100;

  if (amount < minWithdrawal) {
    res.status(400).json({ error: `Minimum withdrawal is ${minWithdrawal} USDT` });
    return;
  }

  const mainBalance = parseFloat(user.mainBalance ?? "0");
  if (mainBalance < amount) { res.status(400).json({ error: "Insufficient balance" }); return; }

  const fee = amount * feeRate;
  const netAmount = amount - fee;

  const [withdrawal] = await db.insert(withdrawalsTable).values({
    userId: user.id,
    amount: amount.toString(),
    fee: fee.toString(),
    netAmount: netAmount.toString(),
    status: "pending",
    walletAddress,
  }).returning();

  await db.update(usersTable).set({ mainBalance: (mainBalance - amount).toString() }).where(eq(usersTable.id, user.id));

  await db.insert(transactionsTable).values({
    userId: user.id,
    type: "withdrawal",
    amount: amount.toString(),
    status: "pending",
    description: `Withdrawal to ${walletAddress}`,
    referenceId: withdrawal.id,
  });

  res.status(201).json(formatWithdrawal(withdrawal));
});

router.get("/withdrawals/:id", authenticate, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(String(req.params.id));
  const [withdrawal] = await db.select().from(withdrawalsTable)
    .where(and(eq(withdrawalsTable.id, id), eq(withdrawalsTable.userId, user.id))).limit(1);
  if (!withdrawal) { res.status(404).json({ error: "Withdrawal not found" }); return; }
  res.json(formatWithdrawal(withdrawal));
});

export default router;
