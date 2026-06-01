import { Router } from "express";
import { db, ticketsTable, ticketMessagesTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { CreateTicketBody, ReplyTicketBody } from "@workspace/api-zod";

const router = Router();

function formatTicket(t: any) {
  return {
    id: t.id,
    subject: t.subject,
    category: t.category,
    status: t.status,
    messageCount: t.messageCount ?? 0,
    createdAt: t.createdAt?.toISOString(),
    lastReplyAt: t.lastReplyAt?.toISOString() ?? t.createdAt?.toISOString(),
  };
}

router.get("/tickets", authenticate, async (req, res) => {
  const user = (req as any).user;
  const tickets = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.userId, user.id))
    .orderBy(desc(ticketsTable.updatedAt));
  
  const result = await Promise.all(tickets.map(async (t) => {
    const msgs = await db.select().from(ticketMessagesTable).where(eq(ticketMessagesTable.ticketId, t.id));
    return formatTicket({ ...t, messageCount: msgs.length });
  }));
  
  res.json(result);
});

router.post("/tickets", authenticate, async (req, res) => {
  const user = (req as any).user;
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const { subject, category, message } = parsed.data;

  const [ticket] = await db.insert(ticketsTable).values({
    userId: user.id,
    subject,
    category,
    status: "open",
  }).returning();

  await db.insert(ticketMessagesTable).values({
    ticketId: ticket.id,
    userId: user.id,
    message,
    isAdmin: "false",
  });

  res.status(201).json(formatTicket({ ...ticket, messageCount: 1 }));
});

router.get("/tickets/:id", authenticate, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(String(req.params.id));
  const [ticket] = await db.select().from(ticketsTable)
    .where(and(eq(ticketsTable.id, id), eq(ticketsTable.userId, user.id))).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const messages = await db.select().from(ticketMessagesTable)
    .where(eq(ticketMessagesTable.ticketId, id))
    .orderBy(ticketMessagesTable.createdAt);

  const messagesWithAuthor = await Promise.all(messages.map(async (m) => {
    let authorName = "User";
    if (m.userId) {
      const [author] = await db.select().from(usersTable).where(eq(usersTable.id, m.userId)).limit(1);
      authorName = author ? `${author.firstName} ${author.lastName}` : "User";
    }
    if (m.isAdmin === "true") authorName = "Support Team";
    return {
      id: m.id,
      message: m.message,
      isAdmin: m.isAdmin === "true",
      authorName,
      createdAt: m.createdAt?.toISOString(),
    };
  }));

  res.json({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    createdAt: ticket.createdAt?.toISOString(),
    messages: messagesWithAuthor,
  });
});

router.post("/tickets/:id/reply", authenticate, async (req, res) => {
  const user = (req as any).user;
  const id = parseInt(String(req.params.id));
  const parsed = ReplyTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const [ticket] = await db.select().from(ticketsTable)
    .where(and(eq(ticketsTable.id, id), eq(ticketsTable.userId, user.id))).limit(1);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const [msg] = await db.insert(ticketMessagesTable).values({
    ticketId: id,
    userId: user.id,
    message: parsed.data.message,
    isAdmin: "false",
  }).returning();

  await db.update(ticketsTable).set({
    status: "open",
    lastReplyAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(ticketsTable.id, id));

  res.status(201).json({
    id: msg.id,
    message: msg.message,
    isAdmin: false,
    authorName: `${user.firstName} ${user.lastName}`,
    createdAt: msg.createdAt?.toISOString(),
  });
});

export default router;
