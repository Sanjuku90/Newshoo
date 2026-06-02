import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  country: text("country").notNull(),
  city: text("city"),
  birthDate: text("birth_date"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  kycLevel: integer("kyc_level").notNull().default(0),
  kycStatus: text("kyc_status").notNull().default("none"),
  vipLevel: integer("vip_level").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredById: integer("referred_by_id"),
  walletAddress: text("wallet_address"),
  mainBalance: text("main_balance").notNull().default("0"),
  investedBalance: text("invested_balance").notNull().default("0"),
  totalEarnings: text("total_earnings").notNull().default("0"),
  bonusBalance: text("bonus_balance").notNull().default("0"),
  totalDeposited: text("total_deposited").notNull().default("0"),
  totalWithdrawn: text("total_withdrawn").notNull().default("0"),
  dailyEarnings: text("daily_earnings").notNull().default("0"),
  totalInvested: text("total_invested").notNull().default("0"),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
