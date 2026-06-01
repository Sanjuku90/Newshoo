import { Router } from "express";
import { db, kycDocumentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { SubmitKycBody } from "@workspace/api-zod";

const router = Router();

router.get("/kyc", authenticate, async (req, res) => {
  const user = (req as any).user;
  const docs = await db.select().from(kycDocumentsTable)
    .where(eq(kycDocumentsTable.userId, user.id));

  res.json({
    level: user.kycLevel,
    status: user.kycStatus,
    rejectionReason: null,
    documents: docs.map(d => ({
      id: d.id,
      type: d.documentType,
      status: d.status,
      fileUrl: d.fileUrl,
    })),
  });
});

router.post("/kyc/submit", authenticate, async (req, res) => {
  const user = (req as any).user;
  const parsed = SubmitKycBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const { documentType, documentData } = parsed.data;

  const [doc] = await db.insert(kycDocumentsTable).values({
    userId: user.id,
    documentType,
    documentData,
    status: "pending",
    submittedAt: new Date(),
  }).returning();

  await db.update(usersTable).set({ kycStatus: "pending" }).where(eq(usersTable.id, user.id));

  const docs = await db.select().from(kycDocumentsTable)
    .where(eq(kycDocumentsTable.userId, user.id));

  res.json({
    level: user.kycLevel,
    status: "pending",
    rejectionReason: null,
    documents: docs.map(d => ({
      id: d.id,
      type: d.documentType,
      status: d.status,
      fileUrl: d.fileUrl,
    })),
  });
});

export default router;
