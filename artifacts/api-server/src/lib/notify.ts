import { db, notificationsTable } from "@workspace/db";

export async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("[notify] Failed to create notification:", e);
  }
}
