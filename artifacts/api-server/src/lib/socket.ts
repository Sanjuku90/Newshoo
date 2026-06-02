import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getUserIdFromToken } from "./auth";
import { db, usersTable, ticketsTable, ticketMessagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*", credentials: true },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error("No token"));
    const userId = getUserIdFromToken(token);
    if (!userId) return next(new Error("Invalid token"));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return next(new Error("User not found"));
    (socket as any).userId = userId;
    (socket as any).userRole = user.role;
    (socket as any).userName = `${user.firstName} ${user.lastName}`;
    next();
  });

  io.on("connection", (socket) => {
    const userId: number = (socket as any).userId;
    const userRole: string = (socket as any).userRole;
    const userName: string = (socket as any).userName;

    logger.info({ userId, userRole }, "Socket connected");

    socket.on("join_ticket", async (ticketId: number) => {
      if (isNaN(ticketId)) return;

      if (userRole === "admin") {
        socket.join(`ticket:${ticketId}`);
      } else {
        const [ticket] = await db.select().from(ticketsTable)
          .where(and(eq(ticketsTable.id, ticketId), eq(ticketsTable.userId, userId))).limit(1);
        if (ticket) socket.join(`ticket:${ticketId}`);
      }
    });

    socket.on("leave_ticket", (ticketId: number) => {
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on("send_message", async (data: { ticketId: number; message: string }) => {
      const { ticketId, message } = data;
      if (!ticketId || !message?.trim()) return;

      try {
        let ticket;
        if (userRole === "admin") {
          const [t] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, ticketId)).limit(1);
          ticket = t;
        } else {
          const [t] = await db.select().from(ticketsTable)
            .where(and(eq(ticketsTable.id, ticketId), eq(ticketsTable.userId, userId))).limit(1);
          ticket = t;
        }

        if (!ticket || ticket.status === "closed") return;

        const isAdmin = userRole === "admin";

        const [msg] = await db.insert(ticketMessagesTable).values({
          ticketId,
          userId,
          message: message.trim(),
          isAdmin: isAdmin ? "true" : "false",
        }).returning();

        await db.update(ticketsTable).set({
          status: isAdmin ? "replied" : "open",
          lastReplyAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(ticketsTable.id, ticketId));

        const payload = {
          id: msg.id,
          ticketId,
          message: msg.message,
          isAdmin,
          authorName: isAdmin ? "Support Team" : userName,
          createdAt: msg.createdAt?.toISOString(),
        };

        io?.to(`ticket:${ticketId}`).emit("new_message", payload);
        io?.to(`ticket:${ticketId}`).emit("ticket_updated", { ticketId, status: isAdmin ? "replied" : "open" });

        if (isAdmin) {
          io?.to(`user:${ticket.userId}`).emit("admin_replied", { ticketId, subject: ticket.subject });
        }
      } catch (e) {
        logger.error({ err: e }, "Error sending socket message");
      }
    });

    socket.on("join_user_room", () => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      logger.info({ userId }, "Socket disconnected");
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
