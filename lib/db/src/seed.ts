import { db, usersTable, plansTable } from "./index";
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
  // Check if admin exists
  const existing = await db.select().from(usersTable).where(eq(usersTable.role, "admin")).limit(1);

  if (existing.length === 0) {
    console.log("[seed] Creating admin account...");
    await db.insert(usersTable).values({
      firstName: "Admin",
      lastName: "InvestPro",
      email: "admin@investpro.com",
      phone: "+10000000000",
      country: "International",
      passwordHash: hashPassword("1289"),
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
    console.log("[seed] Admin account created (admin@investpro.com / 1289)");
  }

  // Check if plans exist
  const existingPlans = await db.select().from(plansTable).limit(1);
  if (existingPlans.length === 0) {
    console.log("[seed] Creating investment plans...");
    for (const plan of PLANS) {
      await db.insert(plansTable).values(plan);
    }
    console.log("[seed] 3 investment plans created (BRONZE / SILVER / GOLD)");
  }
}
