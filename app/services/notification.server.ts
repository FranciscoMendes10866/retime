import { z } from "zod";

import { db } from "~/db/client";
import { notifications } from "~/db/schema";
import { pusherServer } from "~/utils/pusher.server";

export const namespaceRecordSchema = z.object({
  actorId: z.number().positive(),
  metadata: z.object({
    type: z.union([z.literal("follow"), z.literal("comment")]),
    subjectId: z.number().positive(),
  }),
});

export type NamespaceRecord = z.infer<typeof namespaceRecordSchema>;

interface CreateCommentNotificationArgs {
  actorId: number;
  threadId: number;
}

export async function createCommentNotification({
  actorId,
  threadId,
}: CreateCommentNotificationArgs) {
  const datums = await namespaceRecordSchema.parseAsync({
    actorId,
    metadata: { subjectId: threadId, type: "comment" },
  });

  const namespace = JSON.stringify(datums);

  const result = await db.insert(notifications).values({
    actorId,
    createdAt: new Date(),
    namespace,
  });

  if (result.changes > 0) {
    await pusherServer.trigger(
      actorId.toString(),
      "new-comment-evt",
      namespace
    );
  }
}

interface CreateFollowNotificationArgs {
  actorId: number;
  followerId: number;
}

export async function createFollowNotification({
  actorId,
  followerId,
}: CreateFollowNotificationArgs) {
  const datums = await namespaceRecordSchema.parseAsync({
    actorId,
    metadata: { subjectId: followerId, type: "follow" },
  });

  const namespace = JSON.stringify(datums);

  const result = await db.insert(notifications).values({
    actorId,
    createdAt: new Date(),
    namespace,
  });

  if (result.changes > 0) {
    await pusherServer.trigger(
      actorId.toString(),
      "new-follower-evt",
      namespace
    );
  }
}

export async function getRecentActivity(userId: number) {
  return await db.query.notifications.findMany({
    where: (notification, { eq }) => eq(notification.actorId, userId),
    orderBy: (column, { desc }) => desc(column.createdAt),
    limit: 20,
  });
}

export async function markAllAsRead(ids: Array<number>) {
  const list = await db.query.notifications.findMany({
    where: (notification, { inArray }) => inArray(notification.id, ids),
  });

  const values = list.filter((item) => item.readAt !== null);

  const result = await db
    .insert(notifications)
    .values(values)
    .onConflictDoUpdate({
      target: notifications.id,
      set: { readAt: new Date() },
    });

  if (result.changes !== values.length) {
    throw new Error();
  }
}
