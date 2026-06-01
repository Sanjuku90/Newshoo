import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, generateReferralCode, storeToken, removeToken, getUserIdFromToken } from "../lib/auth";
import { authenticate } from "../middlewares/authenticate";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
    return;
  }

  const { firstName, lastName, email, phone, password, country, city, referralCode } = parsed.data;

  const existing = await db.select().from(usersTable)
    .where(eq(usersTable.email, email)).limit(1);
  if (existing[0]) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  const existingPhone = await db.select().from(usersTable)
    .where(eq(usersTable.phone, phone)).limit(1);
  if (existingPhone[0]) {
    res.status(400).json({ error: "Phone already in use" });
    return;
  }

  let referredById: number | null = null;
  if (referralCode) {
    const referrer = await db.select().from(usersTable)
      .where(eq(usersTable.referralCode, referralCode)).limit(1);
    if (referrer[0]) {
      referredById = referrer[0].id;
    }
  }

  const passwordHash = hashPassword(password);
  const newReferralCode = generateReferralCode();

  const [user] = await db.insert(usersTable).values({
    firstName,
    lastName,
    email,
    phone,
    country,
    city: city ?? null,
    passwordHash,
    referralCode: newReferralCode,
    referredById,
    role: "user",
    status: "active",
    kycLevel: 0,
    kycStatus: "none",
    vipLevel: 0,
  }).returning();

  const token = generateToken(user.id);
  storeToken(token, user.id);

  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({
    user: {
      ...safeUser,
      totalInvested: safeUser.totalInvested ?? "0",
      createdAt: safeUser.createdAt?.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (user.status === "banned") {
    res.status(403).json({ error: "Account is banned" });
    return;
  }

  const token = generateToken(user.id);
  storeToken(token, user.id);

  await db.update(usersTable).set({ lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));

  const { passwordHash: _, ...safeUser } = user;
  res.json({
    user: {
      ...safeUser,
      totalInvested: safeUser.totalInvested ?? "0",
      createdAt: safeUser.createdAt?.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", authenticate, async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  if (token) removeToken(token);
  res.json({ success: true });
});

router.get("/auth/me", authenticate, async (req, res) => {
  const user = (req as any).user;
  const { passwordHash: _, ...safeUser } = user;
  res.json({
    ...safeUser,
    totalInvested: safeUser.totalInvested ?? "0",
    createdAt: safeUser.createdAt?.toISOString(),
  });
});

export default router;
