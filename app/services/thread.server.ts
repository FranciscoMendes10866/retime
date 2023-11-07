import { db } from "~/db/client";
import { threads } from "~/db/schema";

export async function getFeedThreads(userId: number) {
  const following = await db.query.follows.findMany({
    where: (follow, { eq }) => eq(follow.followerId, userId),
    columns: {
      followedId: true,
    },
  });

  const ids = following.map((item) => item.followedId);
  var date = new Date();
  date.setDate(date.getDate() - 7);

  return await db.query.threads.findMany({
    where: (thread, { inArray, and, gte }) =>
      and(inArray(thread.userId, ids), gte(thread.createdAt, date)),
    limit: 40,
    with: {
      user: {
        columns: {
          username: true,
        },
      },
    },
  });
}

interface CreateNewThreadArgs {
  userId: number;
  body: string;
}

export async function createNewThread(data: CreateNewThreadArgs) {
  const result = await db.insert(threads).values({
    ...data,
    createdAt: new Date(),
  });

  const rowId = result.lastInsertRowid;
  if (rowId < 1 || typeof rowId !== "number") {
    throw Error("An error has occurred.");
  }
}
