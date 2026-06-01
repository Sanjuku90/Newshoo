import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const kycDocumentsTable = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  documentType: text("document_type").notNull(),
  documentData: text("document_data"),
  fileUrl: text("file_url"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKycDocumentSchema = createInsertSchema(kycDocumentsTable).omit({ id: true, createdAt: true });
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocumentsTable.$inferSelect;
