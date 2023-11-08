import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

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
      user: true,
    },
  });
}

export const threadInsertSchema = createInsertSchema(threads);

type CreateNewThreadArgs = Pick<
  z.infer<typeof threadInsertSchema>,
  "body" | "userId"
>;

export async function createNewThread(data: CreateNewThreadArgs) {
  const parsed = threadInsertSchema.safeParse({
    ...data,
    createdAt: new Date(),
  });

  if (!parsed.success) {
    throw Error("An error has occurred.");
  }

  const result = await db.insert(threads).values(parsed.data);

  const rowId = result.lastInsertRowid;
  if (rowId < 1 || typeof rowId !== "number") {
    throw Error("An error has occurred.");
  }

  return;
}
