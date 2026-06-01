import { Router } from "express";
import { db, usersTable, depositsTable, withdrawalsTable, investmentsTable, plansTable, ticketsTable, ticketMessagesTable, kycDocumentsTable, transactionsTable, adminLogsTable, promoCodesTable, promoCodeUsagesTable, leaderBonusesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/authenticate";
import { CreatePlanBody, UpdatePlanBody, RejectDepositBody, RejectWithdrawalBody, RejectKycBody, UpdateAdminUserBody, AdminReplyTicketBody } from "@workspace/api-zod";
import { logAdminAction } from "../lib/admin-log";
import { updateVipLevel, checkAndAwardLeaderBonuses } from "../lib/vip";

const router = Router();

// ── Admin stats ─────────────────────────────────────────────────────────────
router.get("/admin/stats", requireAdmin, async (req, res) => {
  const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable);
  const activeUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(eq(usersTable.status, "active"));
  const totalDeposited = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(depositsTable).where(eq(depositsTable.status, "approved"));
  const totalWithdrawn = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "approved"));
  const totalInvested = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` }).from(investmentsTable);
  const pendingDeposits = await db.select({ count: sql<number>`COUNT(*)` }).from(depositsTable).where(eq(depositsTable.status, "pending"));
  const pendingWithdrawals = await db.select({ count: sql<number>`COUNT(*)` }).from(withdrawalsTable).where(eq(withdrawalsTable.status, "pending"));
  const pendingKyc = await db.select({ count: sql<number>`COUNT(*)` }).from(kycDocumentsTable).where(eq(kycDocumentsTable.status, "pending"));
  const openTickets = await db.select({ count: sql<number>`COUNT(*)` }).from(ticketsTable).where(eq(ticketsTable.status, "open"));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const newUsersToday = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable).where(sql`created_at >= ${today}`);

  res.json({
    totalUsers: Number(totalUsers[0]?.count ?? 0),
    activeUsers: Number(activeUsers[0]?.count ?? 0),
    totalDeposited: Number(totalDeposited[0]?.total ?? 0),
    totalWithdrawn: Number(totalWithdrawn[0]?.total ?? 0),
    totalInvested: Number(totalInvested[0]?.total ?? 0),
    totalEarningsPaid: 0,
    pendingDeposits: Number(pendingDeposits[0]?.count ?? 0),
    pendingWithdrawals: Number(pendingWithdrawals[0]?.count ?? 0),
    pendingKyc: Number(pendingKyc[0]?.count ?? 0),
    openTickets: Number(openTickets[0]?.count ?? 0),
    newUsersToday: Number(newUsersToday[0]?.count ?? 0),
    revenueToday: 0,
  });
});

// ── Users ────────────────────────────────────────────────────────────────────
router.get("/admin/users", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const total = await db.select({ count: sql<number>`COUNT(*)` }).from(usersTable);
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
  const safeUsers = users.map(u => { const { passwordHash: _, ...safe } = u; return { ...safe, totalInvested: safe.totalInvested ?? "0", createdAt: safe.createdAt?.toISOString() }; });
  res.json({ data: safeUsers, total: Number(total[0]?.count ?? 0), page, limit });
});

router.get("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const { passwordHash: _, ...safeUser } = user;
  const investments = await db.select().from(investmentsTable).where(eq(investmentsTable.userId, id));
  const deposits = await db.select().from(depositsTable).where(eq(depositsTable.userId, id));
  const withdrawals = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, id));
  res.json({
    user: { ...safeUser, totalInvested: safeUser.totalInvested ?? "0", createdAt: safeUser.createdAt?.toISOString() },
    wallet: { mainBalance: parseFloat(user.mainBalance ?? "0"), investedBalance: parseFloat(user.investedBalance ?? "0"), totalEarnings: parseFloat(user.totalEarnings ?? "0"), bonusBalance: parseFloat(user.bonusBalance ?? "0"), totalDeposited: parseFloat(user.totalDeposited ?? "0"), totalWithdrawn: parseFloat(user.totalWithdrawn ?? "0"), dailyEarnings: 0 },
    investments: investments.map(i => ({ id: i.id, planId: i.planId, planName: "Plan", amount: parseFloat(i.amount), dailyRate: parseFloat(i.dailyRate), durationDays: i.durationDays, startDate: i.startDate?.toISOString(), endDate: i.endDate?.toISOString(), status: i.status, totalEarned: parseFloat(i.totalEarned ?? "0"), dailyEarning: 0 })),
    deposits: deposits.map(d => ({ id: d.id, amount: parseFloat(d.amount), status: d.status, walletAddress: d.walletAddress, txHash: d.txHash, rejectionReason: d.rejectionReason, createdAt: d.createdAt?.toISOString() })),
    withdrawals: withdrawals.map(w => ({ id: w.id, amount: parseFloat(w.amount), fee: parseFloat(w.fee ?? "0"), netAmount: parseFloat(w.netAmount), status: w.status, walletAddress: w.walletAddress, rejectionReason: w.rejectionReason, createdAt: w.createdAt?.toISOString() })),
  });
});

router.patch("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = UpdateAdminUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const updates: any = {};
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.mainBalance !== undefined) updates.mainBalance = parsed.data.mainBalance.toString();
  if (parsed.data.bonusBalance !== undefined) updates.bonusBalance = parsed.data.bonusBalance.toString();
  if (parsed.data.kycLevel !== undefined) updates.kycLevel = parsed.data.kycLevel;
  const [updated] = await db.update(usersTable).set({ ...updates, updatedAt: new Date() }).where(eq(usersTable.id, id)).returning();
  await logAdminAction(req, `update_user_${Object.keys(updates).join("_")}`, "user", id, JSON.stringify(parsed.data));
  const { passwordHash: _, ...safe } = updated;
  res.json({ ...safe, totalInvested: safe.totalInvested ?? "0", createdAt: safe.createdAt?.toISOString() });
});

// ── Deposits ─────────────────────────────────────────────────────────────────
router.get("/admin/deposits", requireAdmin, async (req, res) => {
  const status = req.query.status as string;
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * 20;
  let deposits;
  if (status) {
    deposits = await db.select().from(depositsTable).where(eq(depositsTable.status, status)).orderBy(desc(depositsTable.createdAt)).limit(20).offset(offset);
  } else {
    deposits = await db.select().from(depositsTable).orderBy(desc(depositsTable.createdAt)).limit(20).offset(offset);
  }
  const result = await Promise.all(deposits.map(async (d) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId)).limit(1);
    return { id: d.id, userId: d.userId, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown", amount: parseFloat(d.amount), status: d.status, txHash: d.txHash, walletAddress: d.walletAddress, createdAt: d.createdAt?.toISOString() };
  }));
  res.json(result);
});

router.post("/admin/deposits/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const [deposit] = await db.select().from(depositsTable).where(eq(depositsTable.id, id)).limit(1);
  if (!deposit) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(depositsTable).set({ status: "approved", approvedAt: new Date(), updatedAt: new Date() }).where(eq(depositsTable.id, id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, deposit.userId)).limit(1);
  if (user) {
    const amount = parseFloat(deposit.amount);
    const newTotal = parseFloat(user.totalDeposited ?? "0") + amount;
    await db.update(usersTable).set({
      mainBalance: (parseFloat(user.mainBalance ?? "0") + amount).toString(),
      totalDeposited: newTotal.toString(),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, user.id));
    await db.insert(transactionsTable).values({ userId: user.id, type: "deposit", amount: deposit.amount, status: "completed", description: "Deposit approved" });
    await updateVipLevel(user.id, parseFloat(user.totalInvested ?? "0"));
    if (user.referredById) await checkAndAwardLeaderBonuses(user.referredById);
  }
  await logAdminAction(req, "approve_deposit", "deposit", id, `Amount: ${deposit.amount}`);
  const [updated] = await db.select().from(depositsTable).where(eq(depositsTable.id, id)).limit(1);
  res.json({ id: updated.id, amount: parseFloat(updated.amount), status: updated.status, walletAddress: updated.walletAddress, txHash: updated.txHash, rejectionReason: updated.rejectionReason, createdAt: updated.createdAt?.toISOString() });
});

router.post("/admin/deposits/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = RejectDepositBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Reason required" }); return; }
  await db.update(depositsTable).set({ status: "rejected", rejectionReason: parsed.data.reason, updatedAt: new Date() }).where(eq(depositsTable.id, id));
  await logAdminAction(req, "reject_deposit", "deposit", id, parsed.data.reason);
  const [updated] = await db.select().from(depositsTable).where(eq(depositsTable.id, id)).limit(1);
  res.json({ id: updated.id, amount: parseFloat(updated.amount), status: updated.status, walletAddress: updated.walletAddress, txHash: updated.txHash, rejectionReason: updated.rejectionReason, createdAt: updated.createdAt?.toISOString() });
});

// ── Withdrawals ───────────────────────────────────────────────────────────────
router.get("/admin/withdrawals", requireAdmin, async (req, res) => {
  const status = req.query.status as string;
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * 20;
  let withdrawals;
  if (status) {
    withdrawals = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.status, status)).orderBy(desc(withdrawalsTable.createdAt)).limit(20).offset(offset);
  } else {
    withdrawals = await db.select().from(withdrawalsTable).orderBy(desc(withdrawalsTable.createdAt)).limit(20).offset(offset);
  }
  const result = await Promise.all(withdrawals.map(async (w) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, w.userId)).limit(1);
    return { id: w.id, userId: w.userId, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown", amount: parseFloat(w.amount), fee: parseFloat(w.fee ?? "0"), netAmount: parseFloat(w.netAmount), status: w.status, walletAddress: w.walletAddress, createdAt: w.createdAt?.toISOString() };
  }));
  res.json(result);
});

router.post("/admin/withdrawals/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(withdrawalsTable).set({ status: "approved", processedAt: new Date(), updatedAt: new Date() }).where(eq(withdrawalsTable.id, id));
  const [updated] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
  if (user) {
    await db.update(usersTable).set({ totalWithdrawn: (parseFloat(user.totalWithdrawn ?? "0") + parseFloat(updated.amount)).toString() }).where(eq(usersTable.id, user.id));
  }
  await logAdminAction(req, "approve_withdrawal", "withdrawal", id, `Amount: ${updated.amount}`);
  res.json({ id: updated.id, amount: parseFloat(updated.amount), fee: parseFloat(updated.fee ?? "0"), netAmount: parseFloat(updated.netAmount), status: updated.status, walletAddress: updated.walletAddress, rejectionReason: updated.rejectionReason, createdAt: updated.createdAt?.toISOString() });
});

router.post("/admin/withdrawals/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = RejectWithdrawalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Reason required" }); return; }
  const [withdrawal] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
  if (withdrawal) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, withdrawal.userId)).limit(1);
    if (user) await db.update(usersTable).set({ mainBalance: (parseFloat(user.mainBalance ?? "0") + parseFloat(withdrawal.amount)).toString() }).where(eq(usersTable.id, user.id));
  }
  await db.update(withdrawalsTable).set({ status: "rejected", rejectionReason: parsed.data.reason, updatedAt: new Date() }).where(eq(withdrawalsTable.id, id));
  await logAdminAction(req, "reject_withdrawal", "withdrawal", id, parsed.data.reason);
  const [updated] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).limit(1);
  res.json({ id: updated.id, amount: parseFloat(updated.amount), fee: parseFloat(updated.fee ?? "0"), netAmount: parseFloat(updated.netAmount), status: updated.status, walletAddress: updated.walletAddress, rejectionReason: updated.rejectionReason, createdAt: updated.createdAt?.toISOString() });
});

// ── KYC ───────────────────────────────────────────────────────────────────────
router.get("/admin/kyc", requireAdmin, async (req, res) => {
  const status = req.query.status as string;
  let docs = status
    ? await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.status, status)).orderBy(desc(kycDocumentsTable.createdAt))
    : await db.select().from(kycDocumentsTable).orderBy(desc(kycDocumentsTable.createdAt));
  const result = await Promise.all(docs.map(async (d) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, d.userId)).limit(1);
    return { id: d.id, userId: d.userId, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown", documentType: d.documentType, status: d.status, submittedAt: d.submittedAt?.toISOString() };
  }));
  res.json(result);
});

router.post("/admin/kyc/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const [doc] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.id, id)).limit(1);
  if (!doc) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(kycDocumentsTable).set({ status: "approved", reviewedAt: new Date() }).where(eq(kycDocumentsTable.id, id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, doc.userId)).limit(1);
  if (user) {
    const newLevel = user.kycLevel + 1;
    await db.update(usersTable).set({ kycLevel: newLevel, kycStatus: "approved", updatedAt: new Date() }).where(eq(usersTable.id, user.id));
  }
  await logAdminAction(req, "approve_kyc", "kyc", id);
  res.json({ level: (user?.kycLevel ?? 0) + 1, status: "approved", rejectionReason: null, documents: [] });
});

router.post("/admin/kyc/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = RejectKycBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Reason required" }); return; }
  const [doc] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.id, id)).limit(1);
  if (!doc) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(kycDocumentsTable).set({ status: "rejected", rejectionReason: parsed.data.reason, reviewedAt: new Date() }).where(eq(kycDocumentsTable.id, id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, doc.userId)).limit(1);
  if (user) await db.update(usersTable).set({ kycStatus: "rejected" }).where(eq(usersTable.id, user.id));
  await logAdminAction(req, "reject_kyc", "kyc", id, parsed.data.reason);
  res.json({ level: user?.kycLevel ?? 0, status: "rejected", rejectionReason: parsed.data.reason, documents: [] });
});

// ── Plans ─────────────────────────────────────────────────────────────────────
router.post("/admin/plans", requireAdmin, async (req, res) => {
  const parsed = CreatePlanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const { name, description, minDeposit, maxDeposit, dailyRate, durationDays, features } = parsed.data;
  const [plan] = await db.insert(plansTable).values({ name, description, minDeposit: minDeposit.toString(), maxDeposit: maxDeposit ? maxDeposit.toString() : null, dailyRate: dailyRate.toString(), durationDays, isActive: true, features: features ?? [] }).returning();
  await logAdminAction(req, "create_plan", "plan", plan.id, name);
  res.status(201).json({ id: plan.id, name: plan.name, description: plan.description, minDeposit: parseFloat(plan.minDeposit), maxDeposit: plan.maxDeposit ? parseFloat(plan.maxDeposit) : null, dailyRate: parseFloat(plan.dailyRate), durationDays: plan.durationDays, isActive: plan.isActive, features: plan.features ?? [] });
});

router.patch("/admin/plans/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = UpdatePlanBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const updates: any = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.minDeposit !== undefined) updates.minDeposit = parsed.data.minDeposit.toString();
  if (parsed.data.maxDeposit !== undefined) updates.maxDeposit = parsed.data.maxDeposit ? parsed.data.maxDeposit.toString() : null;
  if (parsed.data.dailyRate !== undefined) updates.dailyRate = parsed.data.dailyRate.toString();
  if (parsed.data.durationDays !== undefined) updates.durationDays = parsed.data.durationDays;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.features !== undefined) updates.features = parsed.data.features;
  updates.updatedAt = new Date();
  const [plan] = await db.update(plansTable).set(updates).where(eq(plansTable.id, id)).returning();
  await logAdminAction(req, "update_plan", "plan", id);
  res.json({ id: plan.id, name: plan.name, description: plan.description, minDeposit: parseFloat(plan.minDeposit), maxDeposit: plan.maxDeposit ? parseFloat(plan.maxDeposit) : null, dailyRate: parseFloat(plan.dailyRate), durationDays: plan.durationDays, isActive: plan.isActive, features: plan.features ?? [] });
});

// ── Tickets ───────────────────────────────────────────────────────────────────
router.get("/admin/tickets", requireAdmin, async (req, res) => {
  const status = req.query.status as string;
  let tickets = status
    ? await db.select().from(ticketsTable).where(eq(ticketsTable.status, status)).orderBy(desc(ticketsTable.updatedAt))
    : await db.select().from(ticketsTable).orderBy(desc(ticketsTable.updatedAt));
  const result = await Promise.all(tickets.map(async (t) => {
    const msgs = await db.select().from(ticketMessagesTable).where(eq(ticketMessagesTable.ticketId, t.id));
    return { id: t.id, subject: t.subject, category: t.category, status: t.status, messageCount: msgs.length, createdAt: t.createdAt?.toISOString(), lastReplyAt: t.lastReplyAt?.toISOString() ?? t.createdAt?.toISOString() };
  }));
  res.json(result);
});

router.post("/admin/tickets/:id/reply", requireAdmin, async (req, res) => {
  const adminUser = (req as any).user;
  const id = parseInt(req.params.id);
  const parsed = AdminReplyTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const [msg] = await db.insert(ticketMessagesTable).values({ ticketId: id, userId: adminUser.id, message: parsed.data.message, isAdmin: "true" }).returning();
  await db.update(ticketsTable).set({ status: "replied", lastReplyAt: new Date(), updatedAt: new Date() }).where(eq(ticketsTable.id, id));
  await logAdminAction(req, "reply_ticket", "ticket", id);
  res.status(201).json({ id: msg.id, message: msg.message, isAdmin: true, authorName: "Support Team", createdAt: msg.createdAt?.toISOString() });
});

router.post("/admin/tickets/:id/close", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.update(ticketsTable).set({ status: "closed", updatedAt: new Date() }).where(eq(ticketsTable.id, id));
  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id)).limit(1);
  const msgs = await db.select().from(ticketMessagesTable).where(eq(ticketMessagesTable.ticketId, id));
  await logAdminAction(req, "close_ticket", "ticket", id);
  res.json({ id: ticket.id, subject: ticket.subject, category: ticket.category, status: ticket.status, messageCount: msgs.length, createdAt: ticket.createdAt?.toISOString(), lastReplyAt: ticket.lastReplyAt?.toISOString() ?? ticket.createdAt?.toISOString() });
});

// ── Admin Logs ────────────────────────────────────────────────────────────────
router.get("/admin/logs", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const total = await db.select({ count: sql<number>`COUNT(*)` }).from(adminLogsTable);
  const logs = await db.select().from(adminLogsTable).orderBy(desc(adminLogsTable.createdAt)).limit(limit).offset(offset);
  const result = await Promise.all(logs.map(async (log) => {
    const [admin] = await db.select().from(usersTable).where(eq(usersTable.id, log.adminId)).limit(1);
    return { id: log.id, adminName: admin ? `${admin.firstName} ${admin.lastName}` : "Unknown", action: log.action, targetType: log.targetType, targetId: log.targetId, details: log.details, ipAddress: log.ipAddress, createdAt: log.createdAt?.toISOString() };
  }));
  res.json({ data: result, total: Number(total[0]?.count ?? 0), page });
});

// ── Promo Codes ───────────────────────────────────────────────────────────────
router.get("/admin/promo-codes", requireAdmin, async (req, res) => {
  const codes = await db.select().from(promoCodesTable).orderBy(desc(promoCodesTable.createdAt));
  res.json(codes.map(c => ({ id: c.id, code: c.code, type: c.type, value: parseFloat(c.value), maxUses: c.maxUses, usedCount: c.usedCount, isActive: c.isActive, description: c.description, expiresAt: c.expiresAt?.toISOString(), createdAt: c.createdAt?.toISOString() })));
});

router.post("/admin/promo-codes", requireAdmin, async (req, res) => {
  const { code, type, value, maxUses, description, expiresAt } = req.body;
  if (!code || !value) { res.status(400).json({ error: "Code and value required" }); return; }
  const [promo] = await db.insert(promoCodesTable).values({
    code: code.toUpperCase().trim(),
    type: type ?? "fixed",
    value: value.toString(),
    maxUses: maxUses ?? null,
    description: description ?? null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isActive: true,
  }).returning();
  await logAdminAction(req, "create_promo_code", "promo_code", promo.id, code);
  res.status(201).json({ id: promo.id, code: promo.code, type: promo.type, value: parseFloat(promo.value), maxUses: promo.maxUses, usedCount: promo.usedCount, isActive: promo.isActive, description: promo.description, expiresAt: promo.expiresAt?.toISOString(), createdAt: promo.createdAt?.toISOString() });
});

router.patch("/admin/promo-codes/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { isActive } = req.body;
  const [promo] = await db.update(promoCodesTable).set({ isActive }).where(eq(promoCodesTable.id, id)).returning();
  await logAdminAction(req, isActive ? "activate_promo_code" : "deactivate_promo_code", "promo_code", id);
  res.json({ id: promo.id, code: promo.code, type: promo.type, value: parseFloat(promo.value), maxUses: promo.maxUses, usedCount: promo.usedCount, isActive: promo.isActive, description: promo.description, expiresAt: promo.expiresAt?.toISOString(), createdAt: promo.createdAt?.toISOString() });
});

router.delete("/admin/promo-codes/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(promoCodesTable).where(eq(promoCodesTable.id, id));
  await logAdminAction(req, "delete_promo_code", "promo_code", id);
  res.json({ success: true });
});

// ── Leader Bonuses ────────────────────────────────────────────────────────────
router.get("/admin/leader-bonuses", requireAdmin, async (req, res) => {
  const bonuses = await db.select().from(leaderBonusesTable).orderBy(desc(leaderBonusesTable.createdAt));
  const result = await Promise.all(bonuses.map(async (b) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, b.userId)).limit(1);
    return { id: b.id, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown", milestone: b.milestone, amount: parseFloat(b.amount), status: b.status, createdAt: b.createdAt?.toISOString() };
  }));
  res.json(result);
});

export default router;
