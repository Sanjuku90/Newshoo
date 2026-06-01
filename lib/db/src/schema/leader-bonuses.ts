import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaderBonusesTable = pgTable("leader_bonuses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  milestone: integer("milestone").notNull(),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("awarded"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLeaderBonusSchema = createInsertSchema(leaderBonusesTable).omit({ id: true, createdAt: true });
export type InsertLeaderBonus = z.infer<typeof insertLeaderBonusSchema>;
export type LeaderBonus = typeof leaderBonusesTable.$inferSelect;
