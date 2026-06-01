import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastReplyAt: timestamp("last_reply_at").notNull().defaultNow(),
});

export const ticketMessagesTable = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => ticketsTable.id),
  userId: integer("user_id").references(() => usersTable.id),
  message: text("message").notNull(),
  isAdmin: text("is_admin").notNull().default("false"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true, updatedAt: true, lastReplyAt: true });
export const insertTicketMessageSchema = createInsertSchema(ticketMessagesTable).omit({ id: true, createdAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
export type TicketMessage = typeof ticketMessagesTable.$inferSelect;
