import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaderBonusesTable = sqliteTable("leader_bonuses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  milestone: integer("milestone").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("awarded"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertLeaderBonusSchema = createInsertSchema(leaderBonusesTable).omit({ id: true, createdAt: true });
export type InsertLeaderBonus = z.infer<typeof insertLeaderBonusSchema>;
export type LeaderBonus = typeof leaderBonusesTable.$inferSelect;
