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
