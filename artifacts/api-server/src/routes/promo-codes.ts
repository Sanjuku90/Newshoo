import { Router } from "express";
import { db, promoCodesTable, promoCodeUsagesTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/promo-codes/apply", authenticate, async (req, res) => {
  const user = (req as any).user;
  const { code } = req.body;
  if (!code) { res.status(400).json({ error: "Code required" }); return; }

  const [promo] = await db.select().from(promoCodesTable)
    .where(eq(promoCodesTable.code, code.toUpperCase().trim())).limit(1);

  if (!promo || !promo.isActive) {
    res.status(404).json({ error: "Code promo invalide ou expiré" });
    return;
  }

  if (promo.expiresAt && new Date() > promo.expiresAt) {
    res.status(400).json({ error: "Ce code promo a expiré" });
    return;
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    res.status(400).json({ error: "Ce code promo a atteint son nombre maximum d'utilisations" });
    return;
  }

  const alreadyUsed = await db.select().from(promoCodeUsagesTable)
    .where(and(
      eq(promoCodeUsagesTable.promoCodeId, promo.id),
      eq(promoCodeUsagesTable.userId, user.id)
    )).limit(1);

  if (alreadyUsed.length > 0) {
    res.status(400).json({ error: "Vous avez déjà utilisé ce code promo" });
    return;
  }

  const bonus = parseFloat(promo.value);

  await db.insert(promoCodeUsagesTable).values({
    promoCodeId: promo.id,
    userId: user.id,
  });

  await db.update(promoCodesTable).set({
    usedCount: promo.usedCount + 1,
  }).where(eq(promoCodesTable.id, promo.id));

  const [currentUser] = await db.select().from(usersTable)
    .where(eq(usersTable.id, user.id)).limit(1);
  if (currentUser) {
    await db.update(usersTable).set({
      bonusBalance: (parseFloat(currentUser.bonusBalance ?? "0") + bonus).toString(),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));

    await db.insert(transactionsTable).values({
      userId: user.id,
      type: "promo_bonus",
      amount: bonus.toString(),
      status: "completed",
      description: `Code promo appliqué: ${promo.code}`,
    });
  }

  res.json({
    success: true,
    bonus,
    message: `Code promo appliqué ! +${bonus} USDT ajoutés à votre bonus`,
  });
});

export default router;
