import { Router } from "express";
import { db, depositsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { CreateDepositBody } from "@workspace/api-zod";

const router = Router();

const PLATFORM_WALLET = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

function formatDeposit(d: any) {
  return {
    id: d.id,
    amount: parseFloat(d.amount),
    status: d.status,
    walletAddress: d.walletAddress ?? PLATFORM_WALLET,
    txHash: d.txHash,
    rejectionReason: d.rejectionReason,
    createdAt: d.createdAt?.toISOString(),
  };
}

router.get("/deposits", authenticate, async (req, res) => {
  const user = (req as any).user;
  const deposits = await db.select().from(depositsTable)
    .where(eq(depositsTable.userId, user.id));
  res.json(deposits.map(formatDeposit));
});

router.post("/deposits", authenticate, async (req, res) => {
  const user = (req as any).user;
  const parsed = CreateDepositBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const { amount, txHash, walletAddress } = parsed.data;

  if (amount < 69) {
    res.status(400).json({ error: "Minimum deposit is 69 USDT" });
    return;
  }

  const [deposit] = await db.insert(depositsTable).values({
    userId: user.id,
    amount: amount.toString(),
    status: "pending",
    walletAddress: walletAddress ?? PLATFORM_WALLET,
    txHash: txHash ?? null,
  }).returning();

  res.status(201).json(formatDeposit(deposit));
});

router.get("/deposits/:id", authenticate, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(String(req.params.id));
  const [deposit] = await db.select().from(depositsTable)
    .where(and(eq(depositsTable.id, id), eq(depositsTable.userId, user.id))).limit(1);
  if (!deposit) {
    res.status(404).json({ error: "Deposit not found" });
    return;
  }
  res.json(formatDeposit(deposit));
});

export default router;
