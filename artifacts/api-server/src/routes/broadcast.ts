import { Router } from "express";
import { db, usersTable, notificationsTable } from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { requireAdmin } from "../middlewares/authenticate";
import { logAdminAction } from "../lib/admin-log";

const router = Router();

router.post("/admin/broadcast", requireAdmin, async (req, res) => {
  const { title, message, targetGroup, minBalance } = req.body;

  if (!title || !message) {
    res.status(400).json({ error: "title and message are required" });
    return;
  }

  let users;
  if (targetGroup === "all") {
    users = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "user"));
  } else if (targetGroup === "active") {
    users = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.status, "active"));
  } else if (targetGroup === "min_balance" && minBalance !== undefined) {
    const all = await db.select({ id: usersTable.id, mainBalance: usersTable.mainBalance }).from(usersTable).where(eq(usersTable.role, "user"));
    users = all.filter(u => parseFloat(u.mainBalance ?? "0") >= parseFloat(minBalance));
  } else {
    users = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "user"));
  }

  if (users.length === 0) {
    res.json({ sent: 0 });
    return;
  }

  await db.insert(notificationsTable).values(
    users.map(u => ({
      userId: u.id,
      type: "broadcast",
      title,
      message,
      isRead: false,
      createdAt: new Date(),
    }))
  );

  await logAdminAction(req, "broadcast", "notification", 0, `${title} → ${users.length} users`);
  res.json({ sent: users.length });
});

export default router;
