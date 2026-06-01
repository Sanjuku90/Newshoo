import { Request, Response, NextFunction } from "express";
import { getUserIdFromToken } from "../lib/auth";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user[0]) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  if (user[0].status === "banned" || user[0].status === "suspended") {
    res.status(403).json({ error: "Account is " + user[0].status });
    return;
  }

  (req as any).user = user[0];
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await authenticate(req, res, () => {
    if ((req as any).user?.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}
