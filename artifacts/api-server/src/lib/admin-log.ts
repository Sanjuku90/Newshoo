import { db, adminLogsTable } from "@workspace/db";
import type { Request } from "express";

export async function logAdminAction(
  req: Request,
  action: string,
  targetType?: string,
  targetId?: number,
  details?: string
) {
  const admin = (req as any).user;
  if (!admin) return;
  try {
    await db.insert(adminLogsTable).values({
      adminId: admin.id,
      action,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      details: details ?? null,
      ipAddress: req.ip ?? null,
    });
  } catch {
    // non-blocking
  }
}
