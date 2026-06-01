import { db, usersTable, plansTable } from "./index";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256")
    .update(`investpro_salt_2024${password}`)
    .digest("hex");
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const PLANS = [
  {
    name: "STARTER",
    description: "Plan d'entrée — parfait pour commencer",
    minDeposit: "69",
    maxDeposit: "98",
    dailyRate: "1.5",
    durationDays: 30,
    isActive: true,
    features: JSON.stringify(["Profit journalier 1.5%", "Retrait des bénéfices autorisé", "Support standard", "Accès tableau de bord"]),
  },
  {
    name: "PREMIUM",
    description: "Plan intermédiaire — rendement optimisé",
    minDeposit: "99",
    maxDeposit: "198",
    dailyRate: "2.5",
    durationDays: 30,
    isActive: true,
    features: JSON.stringify(["Profit journalier 2.5%", "Bonus supplémentaire", "Support prioritaire", "Rapports avancés"]),
  },
  {
    name: "VIP",
    description: "Plan premium — rendement maximum",
    minDeposit: "199",
    maxDeposit: null,
    dailyRate: "4.0",
    durationDays: 30,
    isActive: true,
    features: JSON.stringify(["Profit VIP 4%/j maximum", "Support dédié 24/7", "Bonus exclusifs VIP", "Accès VIP complet"]),
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
    console.log("[seed] 3 investment plans created");
  }
}
