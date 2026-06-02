import { db, usersTable, plansTable, settingsTable } from "./index";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256")
    .update(`${password}investpro_salt_2024`)
    .digest("hex");
}

const PLANS = [
  {
    name: "Pack BRONZE",
    description: "Idéal pour tester la plateforme",
    minDeposit: "69",
    maxDeposit: "98",
    dailyRate: "14.4928",
    durationDays: 15,
    isActive: true,
    // daily: $10/day · total: $150
    features: JSON.stringify([
      "10 $ de gain par jour",
      "Retour total : 150 $ en 15 jours",
      "Capital récupéré dès le 7e jour",
      "Retrait dès 9 $ de solde",
      "Capital sécurisé & séparé",
    ]),
  },
  {
    name: "Pack SILVER",
    description: "Le meilleur ratio de rentabilité",
    minDeposit: "99",
    maxDeposit: "198",
    dailyRate: "17.1717",
    durationDays: 15,
    isActive: true,
    // daily: $17/day · total: $255
    features: JSON.stringify([
      "17 $ de gain par jour",
      "Retour total : 255 $ en 15 jours",
      "Capital récupéré en seulement 6 jours",
      "Retrait dès 9 $ de solde",
      "Activation automatique instantanée",
    ]),
  },
  {
    name: "Pack GOLD",
    description: "Revenus maximaux garantis",
    minDeposit: "199",
    maxDeposit: null,
    dailyRate: "18.0905",
    durationDays: 15,
    isActive: true,
    // daily: $36/day · total: $540
    features: JSON.stringify([
      "36 $ de gain par jour",
      "Retour total : 540 $ en 15 jours",
      "Capital récupéré dès le 6e jour",
      "Retrait dès 9 $ de solde",
      "Revenus élite & priorité support",
    ]),
  },
];

export async function seedDatabase() {
  const adminHash = hashPassword("1289");
  const testHash  = hashPassword("test1234");

  // Try inserting the admin row. If any unique constraint fires (email/phone/referral_code),
  // ignore it — the row already exists and we will patch it below.
  try {
    await db.insert(usersTable).values({
      firstName: "Admin",
      lastName: "InvestPro",
      email: "admin@investpro.com",
      phone: "+10000000000",
      country: "International",
      passwordHash: adminHash,
      role: "admin",
      status: "active",
      kycLevel: 3,
      kycStatus: "approved",
      vipLevel: 5,
      referralCode: "ADMIN01",
      mainBalance: "0",
      investedBalance: "0",
      totalEarnings: "0",
      bonusBalance: "0",
      totalDeposited: "0",
      totalWithdrawn: "0",
      dailyEarnings: "0",
      totalInvested: "0",
    });
  } catch {
    // Ignore any insert error — the UPDATE below always corrects the row.
  }

  // Always patch by phone to fix any stale defaults (role='user', email='', etc.)
  await db.update(usersTable).set({
    firstName: "Admin",
    lastName: "InvestPro",
    email: "admin@investpro.com",
    passwordHash: adminHash,
    role: "admin",
    status: "active",
    kycLevel: 3,
    kycStatus: "approved",
    vipLevel: 5,
    referralCode: "ADMIN01",
  }).where(eq(usersTable.phone, "+10000000000"));

  console.log("[seed] Admin account ensured (admin@investpro.com / 1289)");

  // Test user — same pattern.
  try {
    await db.insert(usersTable).values({
      firstName: "Test",
      lastName: "Utilisateur",
      email: "test@investpro.com",
      phone: "+10000000001",
      country: "France",
      passwordHash: testHash,
      role: "user",
      status: "active",
      kycLevel: 1,
      kycStatus: "approved",
      vipLevel: 1,
      referralCode: "TEST01",
      mainBalance: "500",
      investedBalance: "0",
      totalEarnings: "0",
      bonusBalance: "0",
      totalDeposited: "500",
      totalWithdrawn: "0",
      dailyEarnings: "0",
      totalInvested: "0",
    });
  } catch {
    // Ignore any insert error — the UPDATE below always corrects the row.
  }

  await db.update(usersTable).set({
    firstName: "Test",
    lastName: "Utilisateur",
    email: "test@investpro.com",
    passwordHash: testHash,
    role: "user",
    status: "active",
    referralCode: "TEST01",
  }).where(eq(usersTable.phone, "+10000000001"));

  console.log("[seed] Test user ensured (test@investpro.com / test1234)");

  // Seed default settings
  const DEFAULT_SETTINGS: Record<string, string> = {
    deposit_wallet: "TAB1oeEKDS5NATwFAaUrTioDU9djX7anyS",
    min_deposit: "69",
    min_withdrawal: "9",
    withdrawal_fee_rate: "2",
    platform_name: "InvestPro",
    support_email: "support@investpro.com",
    support_telegram: "",
    maintenance_mode: "0",
    referral_l1_rate: "5",
    referral_l2_rate: "3",
    referral_l3_rate: "1",
    announcement_active: "0",
    announcement_text: "",
    announcement_type: "info",
  };
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await db.select({ id: settingsTable.id }).from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    if (existing.length === 0) {
      await db.insert(settingsTable).values({ key, value, updatedAt: new Date() });
    }
  }

  // Check if plans exist
  const existingPlans = await db.select({ id: plansTable.id }).from(plansTable).limit(1);
  if (existingPlans.length === 0) {
    console.log("[seed] Creating investment plans...");
    for (const plan of PLANS) {
      await db.insert(plansTable).values(plan);
    }
    console.log("[seed] 3 investment plans created (BRONZE / SILVER / GOLD)");
  }
}
