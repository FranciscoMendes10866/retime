import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { db } from "~/db/client";
import { notifications } from "~/db/schema";
import { pusherServer } from "~/utils/pusher.server";

export const notificationInsertSchema = createInsertSchema(notifications);

export type Notification = z.infer<typeof notificationInsertSchema>;

export interface NotificationNamespace {
  actorId: number;
  subjectId: number;
}

interface CreateCommentNotificationArgs {
  actorId: number;
  threadId: number;
}

export async function createCommentNotification({
  actorId,
  threadId,
}: CreateCommentNotificationArgs) {
  const namespace = JSON.stringify({
    actorId,
    subjectId: threadId,
  } satisfies NotificationNamespace);

  const values = await notificationInsertSchema.parseAsync({
    actorId,
    createdAt: new Date(),
    namespace,
  });

  const results = await db.insert(notifications).values(values).returning();

  for await (const result of results) {
    await pusherServer.trigger(actorId.toString(), "notify-evt", result);
  }
}

export async function getRecentActivity(userId: number) {
  return await db.query.notifications.findMany({
    where: (notification, { eq }) => eq(notification.actorId, userId),
    orderBy: (column, { desc }) => desc(column.createdAt),
    limit: 20,
  });
}
