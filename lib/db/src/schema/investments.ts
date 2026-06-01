import { pgTable, serial, integer, numeric, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { plansTable } from "./plans";

export const investmentsTable = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  planId: integer("plan_id").notNull().references(() => plansTable.id),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  dailyRate: numeric("daily_rate", { precision: 5, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"),
  totalEarned: numeric("total_earned", { precision: 18, scale: 8 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInvestmentSchema = createInsertSchema(investmentsTable).omit({ id: true, createdAt: true });
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investmentsTable.$inferSelect;
