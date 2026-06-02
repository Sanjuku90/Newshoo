import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, generateReferralCode, storeToken, removeToken, getUserIdFromToken } from "../lib/auth";
import { authenticate } from "../middlewares/authenticate";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { checkBruteForce, recordFailedAttempt, clearAttempts } from "../lib/brute-force";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
    return;
  }

  const { firstName, lastName, email, phone, password, country, city, referralCode } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing[0]) { res.status(400).json({ error: "Email already in use" }); return; }

  const existingPhone = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (existingPhone[0]) { res.status(400).json({ error: "Phone already in use" }); return; }

  let referredById: number | null = null;
  if (referralCode) {
    const referrer = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode)).limit(1);
    if (referrer[0]) referredById = referrer[0].id;
  }

  const passwordHash = hashPassword(password);
  const newReferralCode = generateReferralCode();

  const [user] = await db.insert(usersTable).values({
    firstName, lastName, email, phone, country, city: city ?? null,
    passwordHash, referralCode: newReferralCode, referredById,
    role: "user", status: "active", kycLevel: 0, kycStatus: "none", vipLevel: 0,
  }).returning();

  const token = generateToken(user.id);
  storeToken(token, user.id);

  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ user: { ...safeUser, totalInvested: safeUser.totalInvested ?? "0", createdAt: safeUser.createdAt?.toISOString() }, token });
});

router.post("/auth/login", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";

  const { blocked, remainingMs } = checkBruteForce(ip);
  if (blocked) {
    const minutes = Math.ceil((remainingMs ?? 0) / 60000);
    res.status(429).json({ error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` });
    return;
  }

  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordFailedAttempt(ip);
    res.status(401).json({ error: "Email ou mot de passe invalide" });
    return;
  }

  if (user.status === "banned") {
    res.status(403).json({ error: "Compte suspendu" });
    return;
  }

  clearAttempts(ip);
  const token = generateToken(user.id);
  storeToken(token, user.id);
  await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: { ...safeUser, totalInvested: safeUser.totalInvested ?? "0", createdAt: safeUser.createdAt?.toISOString() }, token });
});

router.post("/auth/logout", authenticate, async (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) removeToken(token);
  res.json({ success: true });
});

router.get("/auth/me", authenticate, async (req, res) => {
  const user = (req as any).user;
  const { passwordHash: _, ...safeUser } = user;
  res.json({ ...safeUser, totalInvested: safeUser.totalInvested ?? "0", createdAt: safeUser.createdAt?.toISOString() });
});

export default router;
