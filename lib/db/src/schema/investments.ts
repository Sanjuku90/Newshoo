import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { plansTable } from "./plans";

export const investmentsTable = sqliteTable("investments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  planId: integer("plan_id").notNull().references(() => plansTable.id),
  amount: text("amount").notNull(),
  dailyRate: text("daily_rate").notNull(),
  durationDays: integer("duration_days").notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull().defaultNow(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("active"),
  totalEarned: text("total_earned").notNull().default("0"),
  lastProfitAt: integer("last_profit_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertInvestmentSchema = createInsertSchema(investmentsTable).omit({ id: true, createdAt: true });
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investmentsTable.$inferSelect;
