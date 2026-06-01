import { pgTable, serial, integer, numeric, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const commissionsTable = pgTable("commissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  fromUserId: integer("from_user_id").notNull().references(() => usersTable.id),
  investmentId: integer("investment_id"),
  level: integer("level").notNull(),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommissionSchema = createInsertSchema(commissionsTable).omit({ id: true, createdAt: true });
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissionsTable.$inferSelect;
