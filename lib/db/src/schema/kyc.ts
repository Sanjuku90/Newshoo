import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const kycDocumentsTable = sqliteTable("kyc_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  documentType: text("document_type").notNull(),
  documentData: text("document_data"),
  fileUrl: text("file_url"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull().defaultNow(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertKycDocumentSchema = createInsertSchema(kycDocumentsTable).omit({ id: true, createdAt: true });
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocumentsTable.$inferSelect;
