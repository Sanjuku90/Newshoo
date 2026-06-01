import { pgTable, serial, text, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  country: text("country").notNull(),
  city: text("city"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  kycLevel: integer("kyc_level").notNull().default(0),
  kycStatus: text("kyc_status").notNull().default("none"),
  vipLevel: integer("vip_level").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredById: integer("referred_by_id"),
  walletAddress: text("wallet_address"),
  mainBalance: numeric("main_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  investedBalance: numeric("invested_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  totalEarnings: numeric("total_earnings", { precision: 18, scale: 8 }).notNull().default("0"),
  bonusBalance: numeric("bonus_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  totalDeposited: numeric("total_deposited", { precision: 18, scale: 8 }).notNull().default("0"),
  totalWithdrawn: numeric("total_withdrawn", { precision: 18, scale: 8 }).notNull().default("0"),
  dailyEarnings: numeric("daily_earnings", { precision: 18, scale: 8 }).notNull().default("0"),
  totalInvested: numeric("total_invested", { precision: 18, scale: 8 }).notNull().default("0"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
