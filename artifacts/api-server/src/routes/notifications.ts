import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/notifications", authenticate, async (req, res) => {
  const user = (req as any).user;
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(notifications.map(n => ({ ...n, createdAt: n.createdAt?.toISOString() })));
});

router.get("/notifications/unread-count", authenticate, async (req, res) => {
  const user = (req as any).user;
  const all = await db
    .select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.isRead, false)));
  res.json({ count: all.length });
});

router.patch("/notifications/read-all", authenticate, async (req, res) => {
  const user = (req as any).user;
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, user.id));
  res.json({ success: true });
});

router.patch("/notifications/:id/read", authenticate, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(String(req.params.id));
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));
  res.json({ success: true });
});

export default router;
