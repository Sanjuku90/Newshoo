import { pgTable, serial, text, numeric, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const plansTable = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  minDeposit: numeric("min_deposit", { precision: 18, scale: 2 }).notNull(),
  maxDeposit: numeric("max_deposit", { precision: 18, scale: 2 }),
  dailyRate: numeric("daily_rate", { precision: 5, scale: 2 }).notNull(),
  durationDays: integer("duration_days").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  features: jsonb("features").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPlanSchema = createInsertSchema(plansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plansTable.$inferSelect;
