import { pgTable, serial, integer, numeric, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const depositsTable = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("pending"),
  walletAddress: text("wallet_address").notNull().default("TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"),
  txHash: text("tx_hash"),
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDepositSchema = createInsertSchema(depositsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof depositsTable.$inferSelect;
