import { db } from "~/db/client";
import { notifications } from "~/db/schema";
import { pusherServer } from "~/utils/pusher.server";

export interface NamespaceRecord {
  actorId: number;
  metadata: {
    type: "follow" | "comment";
    subjectId: number;
  };
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
    metadata: { subjectId: threadId, type: "comment" },
  } satisfies NamespaceRecord);

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
  const namespace = JSON.stringify({
    actorId,
    metadata: { subjectId: followerId, type: "follow" },
  } satisfies NamespaceRecord);

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
